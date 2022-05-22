'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class UserDepositSchema extends Schema {
  up() {
    this.create('user_deposites', (table) => {
      table.uuid('id').primary().defaultTo(this.db.raw('public.gen_random_uuid()'))
      table.uuid('user_id').unsigned().notNullable()
        .references('id').inTable('users')
        .onUpdate('cascade').onDelete('cascade')
      table.uuid('account_id').unsigned().notNullable()
        .references('id').inTable('accounts')
      table.enum('type', ['0', '1', '2']).notNullable()
        .defaultTo('0')
      table.integer('amount');
      table.double('period');
      table.double('intrest_rate');
      table.datetime('period_expired');
      table.enum('status', ['0', '1', '2']).notNullable()
        .defaultTo('0')
      table.timestamps()
    })
  }

  down() {
    this.drop('user_deposits')
  }
}

module.exports = UserDepositSchema
