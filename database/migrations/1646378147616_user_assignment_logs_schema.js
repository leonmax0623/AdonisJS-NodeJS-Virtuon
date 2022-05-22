'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class UserAssignmentLogsSchema extends Schema {
  up () {
    this.create('user_assignment_logs', (table) => {
      table.uuid('id').primary().defaultTo(this.db.raw('public.gen_random_uuid()'))
      table.uuid('user_id').unsigned().notNullable().references('id').inTable('users').onUpdate('cascade').onDelete('cascade');
      table.uuid('question_id').unsigned().notNullable().references('id').inTable('assignment_questions').onUpdate('cascade').onDelete('cascade');
      table.uuid('assignment_id').unsigned().notNullable().references('id').inTable('assignments').onUpdate('cascade').onDelete('cascade');
      table.string('day');
      table.string('reward');
      table.timestamps();
    })
  }

  down () {
    this.drop('user_assignment_logs')
  }
}

module.exports = UserAssignmentLogsSchema
