'use strict'

const Model = use('Model')
const Env = use('Env')

module.exports = class AccountType extends Model {
    static boot() {
        super.boot();
        this.addHook('afterFetch', function (types) {
            types.forEach(type => {
                if (type.icon != '') {
                    type.icon = type.icon
                }
            });
        })
    }

    financials() {
        return this.hasMany('App/Models/Financial', 'type_id', 'type_id')
    }

}
