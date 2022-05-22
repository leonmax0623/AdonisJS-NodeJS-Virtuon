'use strict'

const Model = use('Model')

module.exports = class ScenarioTrap extends Model {
    static boot() {
        super.boot()
    }

    static get table() {
        return 'scenario_trap'
    }

    nextTrap() {
        return this.belongsTo('App/Models/ScenarioTrap', 'next_question_id', 'id')
    }
}
