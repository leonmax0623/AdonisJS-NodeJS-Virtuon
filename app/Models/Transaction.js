'use strict'

const Model = use('Model')
const Event = use('Event')

module.exports = class Transaction extends Model
{
    static boot () {
        super.boot()

        this.addHook('afterSave', function (model) {
            Event.emit('transaction::created', model)
        })
    }

    account () {
        return this.belongsTo('App/Models/Account', 'account_id', 'id')
    }
}
