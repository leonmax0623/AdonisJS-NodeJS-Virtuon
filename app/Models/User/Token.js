'use strict'

const Model = use('Model')

module.exports = class Token extends Model
{
    static get table () {
        return 'user_tokens'
    }

    user () {
        return this.belongsTo('App/Models/User', 'user_id', 'id')
    }
}
