'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class UserCreditSchema extends Schema {
  up() {
    this.create('user_credits', (table) => {
      table.uuid('id').primary().defaultTo(this.db.raw('public.gen_random_uuid()'))
      table.uuid('user_id').unsigned().notNullable()
        .references('id').inTable('users')
        .onUpdate('cascade').onDelete('cascade')
      table.uuid('account_id').unsigned().notNullable()
        .references('id').inTable('accounts')
      table.double('loan_amount');
      table.double('interest_rate');
      table.double('remaining_days');
      table.double('interest_amount');
      table.double('loan_emi').notNullable().defaultTo(0);
      table.double('interest_emi').notNullable().defaultTo(0);
      table.enum('status', ['0', '1', '2']).notNullable()
        .defaultTo('0')
      table.timestamps()
    })
  }

  down() {
    this.drop('user_credits')
  }
}

module.exports = UserCreditSchema
