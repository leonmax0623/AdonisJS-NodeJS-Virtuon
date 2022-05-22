'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class RemoveCoulmnAssignmentOptionsSchema extends Schema {
  up () {
    this.table('assignment_options', (table) => {
      table.dropColumn('assignment_id');
      table.uuid('questions_id').unsigned().notNullable().references('id').inTable('assignment_questions').onUpdate('cascade').onDelete('cascade');
      table.string('reward');
    })
  }

  down () {
    this.table('assignment_options', (table) => {
    })
  }
}

module.exports = RemoveCoulmnAssignmentOptionsSchema
