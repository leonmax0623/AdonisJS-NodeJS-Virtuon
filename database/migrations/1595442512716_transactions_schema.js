'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class TransactionsSchema extends Schema {
  up () {
    this.create('transactions', (table) => {
      table.uuid('id').primary()
        .defaultTo(this.db.raw('public.gen_random_uuid()'))

      table.uuid('account_id').unsigned().notNullable()
        .index()
        .references('id').inTable('accounts')
        .onUpdate('cascade').onDelete('cascade')

      table.double('amount').notNullable()
        .defaultTo(0)

      table.string('description')

      table.timestamps()
    })
  }

  down () {
    this.drop('transactions')
  }
}

module.exports = TransactionsSchema
