'use strict'
const Model = use('Model')

module.exports = class UserDeposites extends Model {
    static boot() {
        super.boot()
    }

    static get table() {
        return 'user_deposites'
    }

    account() {
        return this.belongsTo('App/Models/Account', 'account_id', 'id')
    }

    deposittransaction() {
        return this.hasMany('App/Models/UserDepositTransaction', 'id', 'user_deposit_id')
    }

    balance() {
        return this.deposittransaction().whereIn('status', [1, 2]).sum('amount as total')
            .then(r => Number(r[0].total));
    }

    interest() {
        return this.deposittransaction().where('status', 3).sum('amount as total')
            .then(r => Number(r[0].total));
    }
}
