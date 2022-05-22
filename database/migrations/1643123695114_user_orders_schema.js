'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class UserOrdersSchema extends Schema {
  up() {
    this.create('user_orders', (table) => {
      table.uuid('id').primary().defaultTo(this.db.raw('public.gen_random_uuid()'))
      table.uuid('user_id').unsigned().notNullable().references('id').inTable('users').onUpdate('cascade').onDelete('cascade');
      table.uuid('badge_id').unsigned().references('id').inTable('badges');
      table.uuid('property_id').unsigned().references('id').inTable('property');
      table.enum('type', ['badge', 'property']).notNullable().defaultTo('badge');
      table.double('amount').notNullable().defaultTo(0);
      table.double('daily_reward');
      table.string('remaining_days');
      table.enum('status', ['0', '1', '2', '3']).notNullable().defaultTo('0');
      table.timestamps()
    })
  }

  down() {
    this.drop('user_orders')
  }
}
module.exports = UserOrdersSchema
