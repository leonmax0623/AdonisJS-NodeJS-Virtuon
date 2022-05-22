'use strict'

const Model = use('Model')

class UserOrders extends Model {
    static boot() {
        super.boot()
    }

    badges() {
        return this.belongsTo('App/Models/Badges', 'badge_id', 'id')
    }
    
    property() {
        return this.belongsTo('App/Models/Property', 'property_id', 'id')
    }
}

module.exports = UserOrders
