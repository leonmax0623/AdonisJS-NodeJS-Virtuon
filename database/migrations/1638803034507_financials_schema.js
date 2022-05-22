'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class FinancialssSchema extends Schema {
  up() {
    this.create('financials', (table) => {
      table.increments()
      table.timestamps()
    })
  }

  up() {
    this.create('financials', (table) => {
      table.uuid('id').primary()
        .defaultTo(this.db.raw('public.gen_random_uuid()'))
      table.string('key').notNullable()
        .unique()
      table.text('value')
      table.enum('status', ['0', '1', '2']).notNullable()
        .defaultTo('1')
      table.timestamps()
    })
  }

  down() {
    this.drop('financials')
  }
}

module.exports = FinancialssSchema
