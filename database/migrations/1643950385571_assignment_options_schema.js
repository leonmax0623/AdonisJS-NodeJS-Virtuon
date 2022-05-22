'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class AssignmentOptionsSchema extends Schema {
  up() {
    this.create('assignment_options', (table) => {
      table.uuid('id').primary().defaultTo(this.db.raw('public.gen_random_uuid()'))
      table.uuid('assignment_id').unsigned().notNullable().references('id').inTable('assignments').onUpdate('cascade').onDelete('cascade');
      table.enum('option_type', ['0', '1', '2', '3']).notNullable().defaultTo('0');
      table.string('option_title');
      table.enum('option_value', ['0', '1']).notNullable().defaultTo('0');
      table.enum('status', ['0', '1']).notNullable().defaultTo('0');
      table.timestamps()
    })
  }

  down() {
    this.drop('assignment_options')
  }
}

module.exports = AssignmentOptionsSchema
