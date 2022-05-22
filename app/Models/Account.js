'use strict'
const Model = use('Model')

module.exports = class Account extends Model {

    static TYPE = {
        common: 'Основной',
        podushka: 'Подушка',
        sweets: 'Вкусняшки',
        dream: 'Мечта',
        credit: 'Кредит',
        deposit: 'Вклад',
        wallet: 'Кошелёк',
        investment: 'Инвестиционный',
    }

    static boot() {
        super.boot()
        this.addHook('beforeSave', function (model) {
            if (!Object.keys(model.constructor.TYPE).includes(model.type)) {
                throw new Error(`Unknown account type: ${model.type}`)
            }
        })
        this.addHook('beforeSave', 'User.changeAccountLabelBeforeSave')
        this.addHook('afterFetch', 'User.changeAccountLabel')
    }

    user() {
        return this.belongsTo('App/Models/User', 'user_id', 'id')
    }

    accountType() {
        return this.belongsTo('App/Models/AccountType', 'type', 'name')
    }

    transactions() {
        return this.hasMany('App/Models/Transaction', 'id', 'account_id')
    }

    usercredits() {
        return this.hasMany('App/Models/UserCredits', 'id', 'account_id')
    }

    userdeposites() {
        return this.hasMany('App/Models/UserDeposites', 'id', 'account_id')
    }

    balance() {
        return this.transactions().sum('amount as total')
            .then(r => Number(r[0].total));
    }

    deopsitBalance(type) {
        return this.transactions().where({ transaction_type: type }).sum('amount as total')
            .then(r => Number(r[0].total));
    }

    capitalizationRunning(userId, type) {
        return this.userdeposites().where({ user_id: userId, 'status':1, 'type': type }).first();
    }


}
