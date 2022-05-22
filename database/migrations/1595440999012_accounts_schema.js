'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class AccountsSchema extends Schema {
  up () {
    this.create('accounts', (table) => {
      table.uuid('id').primary()
        .defaultTo(this.db.raw('public.gen_random_uuid()'))

      table.uuid('user_id').unsigned().notNullable()
        .index()
        .references('id').inTable('users')
        .onUpdate('cascade').onDelete('cascade')

      table.string('label')
      table.enum('type', ['common', 'dream', 'invest', 'podushka', 'sweets']).notNullable()
        .index()
      table.json('options')

      table.timestamps()
    })
  }

  down () {
    this.drop('accounts')
  }
}

module.exports = AccountsSchema
