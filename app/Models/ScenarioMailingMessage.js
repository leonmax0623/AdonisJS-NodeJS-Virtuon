'use strict'

const Model = use('Model')

module.exports = class ScenarioMailingMessage extends Model
{
    static boot() {
        super.boot()
    }

    static get table() {
        return 'scenario_mailing_message'
    }
}
