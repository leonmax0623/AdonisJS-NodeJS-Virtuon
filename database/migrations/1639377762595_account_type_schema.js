'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class AccountTypeSchema extends Schema {
  up() {
    this.create('account_types', (table) => {
      table.uuid('id').primary()
        .defaultTo(this.db.raw('public.gen_random_uuid()'))
      table.string('name')
      table.string('value')
      table.text('icon')
      table.text('description')
      table.enum('status', ['0', '1', '2']).notNullable()
        .defaultTo('1')
      table.timestamps()
    })
  }

  down() {
    this.drop('account_types')
  }
}

module.exports = AccountTypeSchema
