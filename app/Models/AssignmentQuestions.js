'use strict'
const Model = use('Model')

module.exports = class AssignmentQuestions extends Model {
    static boot() {
        super.boot()
    }

    static get table() {
        return 'assignment_questions'
    }

    assignments() {
        return this.belongsTo('App/Models/Assignments', 'assignment_id', 'id')
    }

    assignmentoptions() {
        return this.hasMany('App/Models/AssignmentOptions', 'id', 'questions_id')
    }
}
