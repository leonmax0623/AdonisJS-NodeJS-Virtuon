'use strict'
const Model = use('Model')

module.exports = class UserCredits extends Model {
    static boot() {
        super.boot()
    }

    static get table() {
        return 'user_credits'
    }

    account() {
        return this.belongsTo('App/Models/Account', 'account_id', 'id')
    }

    credittransaction() {
        return this.hasMany('App/Models/UserCreditTransaction', 'id', 'user_credit_id')
    }
}
