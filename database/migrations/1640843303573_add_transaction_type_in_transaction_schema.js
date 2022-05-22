'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class AddTransactionTypeInTransactionSchema extends Schema {
  up() {
    this.table('transactions', (table) => {
      table.string('transaction_type');
    })
  }

  down() {
    this.table('transactions', (table) => {
      // reverse alternations
    })
  }
}

module.exports = AddTransactionTypeInTransactionSchema
