'use strict'
const Model = use('Model')

module.exports = class Assignments extends Model {
    static boot() {
        super.boot()
    }

    static get table() {
        return 'assignments'
    }

    assignmentquestions() {
        return this.hasMany('App/Models/AssignmentQuestions', 'id', 'assignment_id')
    }
}
