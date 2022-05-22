'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class AddTargetToUserSchema extends Schema {
  up() {
    this.table('users', (table) => {
      table.string('goal');
      table.integer('target');
    })
  }

  down() {
    this.table('users', (table) => {
      // reverse alternations
    })
  }
}

module.exports = AddTargetToUserSchema
