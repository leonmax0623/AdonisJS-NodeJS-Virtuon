'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class AssignmentQuestionsSchema extends Schema {
  up () {
    this.create('assignment_questions', (table) => {
      table.uuid('id').primary().defaultTo(this.db.raw('public.gen_random_uuid()'))
      table.uuid('assignment_id').unsigned().notNullable().references('id').inTable('assignments').onUpdate('cascade').onDelete('cascade');
      table.string('title');
      table.enum('status', ['0', '1']).notNullable().defaultTo('0');
      table.timestamps()
    })
  }

  down () {
    this.drop('assignment_questions')
  }
}

module.exports = AssignmentQuestionsSchema
