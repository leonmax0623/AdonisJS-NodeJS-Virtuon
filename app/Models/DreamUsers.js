'use strict'

const Model = use('Model')

class DreamUsers extends Model {
    static boot() {
        super.boot()
    }
    static get table() {
        return 'dreams_users'
    }

    dreams() {
        return this.hasMany('App/Models/Dream', 'dream_id', 'id')
    }
}

module.exports = DreamUsers
