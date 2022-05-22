'use strict'

const Model = use('Model')

module.exports = class ScenarioDayAssignment extends Model
{
    static boot() {
        super.boot()
    }

    static get table() {
        return 'scenario_day_assigment'
    }

    assignment() {
        return this.hasMany('App/Models/Assignments', 'assignment_id', 'id')
    }
}
