'use strict'

const Hash = use('Hash')
const Logger = use('Logger')
const User = use('App/Repo/User')

module.exports = class AuthController
{
    async signIn ({ auth, request, view, response }) {
        if (request.method() === 'POST') {
            try {
                const user = await User.model.query()
                    .where(builder => {
                        builder.where('username', request.input('login'))
                            .orWhere('email', request.input('login'))
                    })
                    .where({
                        is_admin: true,
                        status: '1',
                    })
                    .firstOrFail()

                const authResult = await Hash.verify(request.input('password'), user.password)
                if (!authResult) {
                    return view.renderString('Доступ запрещён')
                }

                await auth.authenticator('session')
                    .login(user)
                Logger.info(`User «${user.username}» logged in`)

                response.redirect('/admin')
                return
            } catch (error) {
                Logger.error(error.message, error)
            }
        }

        return view.render('admin.auth.signin')
    }

    async signOut ({ auth, response }) {
        await auth.logout()

        return response.redirect('/admin/auth')
    }
}
