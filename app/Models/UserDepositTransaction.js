'use strict'
const Model = use('Model')

module.exports = class UserDepositTransaction extends Model {
    static boot() {
        super.boot()
    }

    static get table() {
        return 'user_deposit_transactions'
    }

    account() {
        return this.belongsTo('App/Models/UserDeposites', 'user_deposit_id', 'id')
    }
}
