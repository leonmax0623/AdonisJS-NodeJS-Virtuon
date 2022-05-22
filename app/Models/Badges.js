'use strict'

const Model = use('Model')
const Env = use('Env')

class Badges extends Model {
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
}

module.exports = Badges
