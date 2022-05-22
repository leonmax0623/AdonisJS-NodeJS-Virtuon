'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class AddStatusToUsersSchema extends Schema {
  up() {
    this.table('users', (table) => {
      table.enum('status', ['0', '1', '2']).after('email').notNullable()
        .defaultTo('1')
    })
  }

  down() {}
}

module.exports = AddStatusToUsersSchema
