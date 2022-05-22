'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class BalanceToAccountSchema extends Schema {
  up() {
    this.table('accounts', (table) => {
      table.string('balance');
    })
  }

  down() {
    this.table('accounts', (table) => {
      // reverse alternations
    })
  }
}

module.exports = BalanceToAccountSchema
