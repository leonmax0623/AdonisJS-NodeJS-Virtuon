'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class UpdateIdToAccountTypeSchema extends Schema {
  up() {
    this.table('account_types', (table) => {
      table.integer('is_default').notNullable().defaultTo(0);
      table.integer('type_id').notNullable()
    })
  }

  down() {
    this.table('account_types', (table) => {
      table.dropColumn('type_id');
      table.dropColumn('is_default');
    })
  }
}

module.exports = UpdateIdToAccountTypeSchema
