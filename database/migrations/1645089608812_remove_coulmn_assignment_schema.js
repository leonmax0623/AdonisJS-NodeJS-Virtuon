'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class RemoveCoulmnAssignmentSchema extends Schema {
  up() {
    this.table('assignments', (table) => {
      table.dropColumn('shift_day');
      table.dropColumn('reward');
    })
  }

  down() {
    this.table('assignments', (table) => {
    })
  }
}

module.exports = RemoveCoulmnAssignmentSchema
