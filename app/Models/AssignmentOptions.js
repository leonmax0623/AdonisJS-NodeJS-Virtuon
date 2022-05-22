'use strict'
const Model = use('Model')

module.exports = class AssignmentOptions extends Model {
    static boot() {
        super.boot()
    }

    static get table() {
        return 'assignment_options'
    }

    assignments() {
        return this.belongsTo('App/Models/AssignmentQuestions', 'questions_id', 'id')
    }
}
