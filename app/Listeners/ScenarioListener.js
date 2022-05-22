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
    static async videoMessage(data) {
        const user = await User.findOrFail(data.userId);
        const pushTokens = await user.tokens().fetch()
            .then(tokens => {
                return tokens.rows
                    .map(token => (token.token))
            })
        
        if (pushTokens.length === 0) {
            Logger.notice('No push-tokens for user: ', data.userId)
            return false
        }

        const promises = chunk(Array.from(pushTokens), 500)
            .map(tokens => {
                return Firebase.sendMulticast({
                    tokens,
                    notification: {
                        title: 'День '+data.day,
                        body: ''
                    },
                    data: {
                        event_type: 'scenario_video',
                        event_body: JSON.stringify({video:data.video, message: data.message})
                    },
                })
            })

        return await Promise.allSettled(promises)
            .then(Logger.debug)
            .catch(Logger.error)
    }

    static async mailMessage(data) {
        const user = await User.findOrFail(data.userId);
        const pushTokens = await user.tokens().fetch()
            .then(tokens => {
                return tokens.rows
                    .map(token => (token.token))
            })
        if (pushTokens.length === 0) {
            Logger.notice('No push-tokens for user: ', data.userId)
            return false
        }
        
        const promises = chunk(Array.from(pushTokens), 500)
            .map(tokens => {
                return Firebase.sendMulticast({
                    tokens,
                    notification: {
                        title: data.message,
                        body: ''
                    },
                    data: {
                        event_type: 'scenario_mail',
                        event_body: JSON.stringify({message: data.message})
                    },
                })
            })

        return await Promise.allSettled(promises)
            .then(Logger.debug)
            .catch(Logger.error)
    }

    static async assignementQuestion(data) {
        const user = await User.findOrFail(data.userId);
        const pushTokens = await user.tokens().fetch()
            .then(tokens => {
                return tokens.rows
                    .map(token => (token.token))
            })
        console.log(pushTokens);
        if (pushTokens.length === 0) {
            Logger.notice('No push-tokens for user: ', data.userId)
            return false
        }
        
        const promises = chunk(Array.from(pushTokens), 500)
            .map(tokens => {
                return Firebase.sendMulticast({
                    tokens,
                    notification: {
                        title: 'Сегодняшнее задание',
                        body: data.message
                    },
                    data: {
                        event_type: 'scenario_assignment',
                        event_body: JSON.stringify({message: data.assignment})
                    },
                })
            })

        return await Promise.allSettled(promises)
            .then(Logger.debug)
            .catch(Logger.error)
    }
}
