'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class AssignmentSchema extends Schema {
  up () {
    this.create('assignments', (table) => {
      table.uuid('id').primary().defaultTo(this.db.raw('public.gen_random_uuid()'))
      table.string('title');
      table.text('description');
      table.enum('file_type', ['file', 'url']).notNullable().defaultTo('file');
      table.string('file');
      table.string('url');
      table.string('shift_day');
      table.string('reward');
      table.enum('status', ['0', '1', '2', '3']).notNullable().defaultTo('0');
      table.timestamps()
    })
  }

  down () {
    this.drop('assignments')
  }
}

module.exports = AssignmentSchema
