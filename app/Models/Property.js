'use strict'

const Model = use('Model')
const Env = use('Env')

class Property extends Model {
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
    static get table() {
        return 'property'
    }
}

module.exports = Property
