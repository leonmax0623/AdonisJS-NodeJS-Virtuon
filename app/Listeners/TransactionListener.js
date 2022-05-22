'use strict'

const { TYPE } = use('App/Models/Account')
const Token = use('App/Models/User/Token')
const User = use('App/Models/User')
const Bumblebee = use('Adonis/Addons/Bumblebee')
const TransactionTransformer = use('App/Transformers/TransactionTransformer')
const Logger = use('Logger')
const Firebase = use('AltPoint/Notify/Firebase')
const { get, chunk, mapValues, orderBy } = require('lodash')
const Account = use('App/Models/Account')

module.exports = class {
    static async created(transaction) {
        const account = await Account.findOrFail(transaction.account_id);
        const user = await User.findOrFail(account.user_id);
        const body = t => {
            return (t.amount > 0)
                ? `На счёт «${TYPE[account.type]}»: +${t.amount}V (${t.description})`
                : `Со счёта «${TYPE[account.type]}»: ${t.amount}V (${t.description})`
        }
        const pushTokens = await user.tokens().fetch()
            .then(tokens => {
                return tokens.rows
                    .map(token => (token.token))
            })

        transaction.account_type = account.type;
        const payload = {
            title: (transaction.amount > 0)
                ? 'Пополнение'
                : 'Списание',
            body: body(transaction),
        }
        if (pushTokens.length === 0) {
            Logger.notice('No push-tokens for transaction', transaction.toJSON())
            return false
        }

        const promises = chunk(pushTokens, 500)
            .map(async chunk => {
                const result = await Bumblebee.create()
                    .include('id')
                    .item(transaction, TransactionTransformer)
                    .then(transactionDataModel => mapValues(transactionDataModel, String))
                    .then(transactionDataModel => {
                        return Firebase.sendMulticast({
                            tokens: chunk,
                            notification: payload,
                            data: {
                                event_type: 'transaction_info',
                                ...transactionDataModel,
                            }
                        })
                    })
                Logger.debug('Firebase response', result)

                const failedTokens = new Set
                for (let i = 0; i < chunk.length; i++) {
                    if (get(result.responses[i], 'success') === true) {
                        continue
                    } else {
                        switch (get(result.responses[i], 'error.code')) {
                            case 'messaging/invalid-argument':
                            case 'messaging/registration-token-not-registered':
                                Logger.debug('Failed token', { token: chunk[i] })
                                failedTokens.add(chunk[i])
                                break

                            default:
                                Logger.notice('Skip failed token', result.responses[i])
                                continue
                        }
                    }
                }

                if (failedTokens.size > 0) {
                    Logger.notice(`Deleting ${failedTokens.size} failed token(s)`)
                    await Token.query()
                        .whereIn('token', Array.from(failedTokens))
                        .delete()
                }

                return result
            })

        return await Promise.allSettled(promises)
            .then(Logger.debug)
            .catch(Logger.error)
    }
}
