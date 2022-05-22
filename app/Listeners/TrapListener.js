'use strict'

const User = use('App/Repo/User')
const Firebase = use('AltPoint/Notify/Firebase')
const Logger = use('Logger')
const { get, chunk } = require('lodash')

module.exports = {
    async issue ({ trap, usersIds = [] }) {
        const pushTokens = await User.model.query()
            .where(builder => {
                if (usersIds.length > 0) {
                    builder.whereIn('id', usersIds)
                }
            })
            .fetch()
            .then(async result => {
                const pushTokens = new Set()
                for (let user of result.rows) {
                    const tokens = await user.tokens()
                        .fetch()
                    tokens.rows
                        .forEach(row => (pushTokens.add(row.token)))
                }

                return pushTokens
            })

        if (pushTokens.size === 0) {
            Logger.warning('No active tokens found for send trap notification')
            return
        }

        const promises = chunk(Array.from(pushTokens), 500)
            .map(tokens => {
                return Firebase.sendMulticast({
                    tokens,
                    notification: {
                        title: 'ВНИМАНИЕ!',
                        body: get(trap.message[0], 'text')
                    },
                    data: {
                        event_type: 'trap',
                        trap_id: String(trap.id),
                        trap_payload: JSON.stringify({dialogs: trap.message}),
                    },
                })
            })

        const result = await Promise.allSettled(promises)
        Logger.debug('Firebase response', result)
    }
}
