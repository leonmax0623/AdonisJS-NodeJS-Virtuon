'use strict'

const Model = use('Model')

class Dream extends Model {
    static boot() {
        super.boot()
    }

    dreamusers () {
        return this.hasMany('App/Models/DreamUsers', 'id', 'dream_id')
    }

}

module.exports = Dream
