'use strict'

const Logger = use('Logger')
const __ = use('App/Helpers/string-localize');
const Token = use('App/Models/User/Token');

module.exports = class TokenController {
    async create({ auth, request, response, antl }) {
        let status = 201
        let message = '';
        try {
            const checkToken = await Token.query().where({ 'token': request.input('token') }).fetch().then(({ rows }) => rows);;
            if (checkToken.length > 0) {
                await Token.query().where({ 'token': request.input('token') }).update({ 'user_id': auth.user.id });
            } else {
                await auth.user.tokens().create(request.only(['type', 'label', 'token']));
            }
            const token = await Token.query().where({ 'token': request.input('token') }).first();
            response.ok(null, token);
        } catch (error) {
            switch (error.code) {
                case 'ER_DUP_ENTRY':
                    Logger.notice('Token already registered', { token: request.input('token') })
                    message = 'Token already registered'
                    status = 202
                    break

                case '23505':
                    Logger.notice('Token already registered', { token: request.input('token') })
                    message = 'Token already registered'
                    status = 202
                    break

                default:
                    Logger.error('TOKEN SAVE ERROR', error)
                    message = 'TOKEN SAVE ERROR'
                    status = 400
            }
            response.badRequest(__(message, antl), null);
        }
    }

    async delete({ auth, response }) {
        try {
            await auth.user.tokens().delete()
            response.ok("Tokens Deleted", null);
        } catch (error) {
            response.badRequest(null, null);
        }
    }
    // async delete({ params: { id }, auth, response }) {
    //     await auth.user.tokens()
    //         .where(builder => {
    //             if (id) {
    //                 builder.where({ id })
    //             }
    //         })
    //         .delete()

    //     response.status(204)
    //         .send()
    // }
}
