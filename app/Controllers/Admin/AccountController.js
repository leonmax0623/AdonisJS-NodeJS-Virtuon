'use strict'

const Account = use('App/Models/Account')
const __ = use('App/Helpers/string-localize');
const { validateAll } = use('Validator');

module.exports = class {
    async charge({ request, response, session }) {
        try {
            const rules = {
                description: 'required',
                amount: 'required|number'
            }
            const parameter = request.only(['description', 'amount']);
            const validation = await validateAll(request.all(), rules, request.VaildateMessage)
            if (validation.fails()) {
                session.withErrors(validation.messages())
                return response.redirect('back')
            } else {
                await Account.findOrFail(request.input('account_id'))
                    .then(account => {
                        return account.transactions()
                            .create(request.only(['description', 'amount']))
                    })

                response.redirect(request.header('referer'))
            }
        } catch (error) {
            console.log(error);
        }
    }
}
