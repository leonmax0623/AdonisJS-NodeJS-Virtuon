'use strict'
const Model = use('Model')

module.exports = class UserAssignmentLogs extends Model {
    static boot() {
        super.boot()
    }

    static get table() {
        return 'user_assignment_logs'
    }

    user() {
        return this.belongsTo('App/Models/User', 'user_id', 'id')
    }

    assignments() {
        return this.belongsTo('App/Models/Assignments', 'assignment_id', 'id')
    }

    assignmentsquestions() {
        return this.belongsTo('App/Models/AssignmentQuestions', 'question_id', 'id')
    }
}
