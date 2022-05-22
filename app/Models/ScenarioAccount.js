'use strict'

const Model = use('Model')

module.exports = class ScenarioAccount extends Model
{
    static boot() {
        super.boot()
    }

    static get table() {
        return 'scenario_account'
    }
}
