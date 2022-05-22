'use strict'

const Transaction = use('App/Models/Transaction')

module.exports = class TransactionController
{
    async delete ({ params: { id }, request, response }) {
        const transaction = await Transaction.findOrFail(id)
        await transaction.delete()

        response.redirect(request.header('referer'))
    }
}
