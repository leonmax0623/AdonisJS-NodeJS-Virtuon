'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class UserCreditTransactionsSchema extends Schema {
  up() {
    this.create('user_credit_transactions', (table) => {
      table.uuid('id').primary().defaultTo(this.db.raw('public.gen_random_uuid()'))
      table.uuid('user_id').unsigned().notNullable()
        .references('id').inTable('users')
        .onUpdate('cascade').onDelete('cascade')
      table.uuid('account_id').unsigned().notNullable()
        .references('id').inTable('accounts')
      table.uuid('user_credit_id').unsigned().notNullable()
        .references('id').inTable('user_credits')
      table.uuid('loan_transaction_id').unsigned().references('id').inTable('transactions')
      table.uuid('intrest_transaction_id').unsigned().references('id').inTable('transactions')
      table.double('loan_amount').notNullable().defaultTo(0);
      table.double('interest_amount').notNullable().defaultTo(0);
      table.enum('status', ['0', '1', '2', '3']).notNullable()
        .defaultTo('0')
      table.timestamps()
    })
  }

  down() {
    this.drop('user_credit_transactions')
  }
}

module.exports = UserCreditTransactionsSchema
