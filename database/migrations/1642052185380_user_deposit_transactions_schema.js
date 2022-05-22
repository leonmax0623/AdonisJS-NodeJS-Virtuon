'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class UserDepositTransactionsSchema extends Schema {
  up() {
    this.create('user_deposit_transactions', (table) => {
      table.uuid('id').primary().defaultTo(this.db.raw('public.gen_random_uuid()'))
      table.uuid('user_id').unsigned().notNullable()
        .references('id').inTable('users')
        .onUpdate('cascade').onDelete('cascade')
      table.uuid('account_id').unsigned().notNullable()
        .references('id').inTable('accounts')
      table.uuid('user_deposit_id').unsigned().notNullable()
        .references('id').inTable('user_deposites')
      table.double('amount').notNullable().defaultTo(0);
      table.uuid('transaction_id').unsigned().references('id').inTable('transactions')
      table.enum('status', ['0', '1', '2', '3']).notNullable()
        .defaultTo('0')
      table.timestamps()
    })
  }

  down() {
    this.drop('user_deposit_transactions')
  }
}

module.exports = UserDepositTransactionsSchema
