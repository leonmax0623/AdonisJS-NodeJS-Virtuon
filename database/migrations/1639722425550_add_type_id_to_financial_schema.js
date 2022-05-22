'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class AddTypeIdToFinancialSchema extends Schema {
  up() {
    this.table('financials', (table) => {
      table.integer('type_id');
    })
  }

  down() {
    this.table('financials', (table) => {
      table.dropColumn('type_id');
    })
  }
}

module.exports = AddTypeIdToFinancialSchema
