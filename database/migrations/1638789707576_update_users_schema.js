'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class UpdateUsersSchema extends Schema {
  up() {
    this.alter('users', (table) => {
      table.dropColumn('firstname')
      table.dropColumn('lastname')
      table.dropColumn('about')
      table.dropColumn('status')
    })
  }

  down() {
    this.table('users', (table) => {
      // reverse alternations
    })
  }
}

module.exports = UpdateUsersSchema
