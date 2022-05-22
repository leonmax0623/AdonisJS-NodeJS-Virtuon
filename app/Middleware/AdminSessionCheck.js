'use strict'

const Logger = use('Logger')

module.exports = class {
    async handle({ auth, response }, next) {
        try {
            await auth.authenticator('session').check()
        } catch (error) {
            Logger.warning(error.message, error)
            response.redirect('/admin/auth')
            return
        }
        await next()
    }
}
