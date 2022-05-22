'use strict'
const Model = use('Model')

module.exports = class UserCreditTransaction extends Model {
    static boot() {
        super.boot()
    }

    static get table() {
        return 'user_credit_transactions'
    }

    account() {
        return this.belongsTo('App/Models/UserCredits', 'user_credit_id', 'id')
    }
}
