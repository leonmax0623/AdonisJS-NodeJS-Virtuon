'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class DreamsUsersSchema extends Schema {
  up() {
    this.create('dreams_users', (table) => {
      table.uuid('user_id').unsigned().notNullable()
        .references('id').inTable('users')
        .onUpdate('cascade').onDelete('cascade')

      table.uuid('dream_id').unsigned().notNullable()
        .references('id').inTable('dreams')
        .onUpdate('cascade').onDelete('cascade')

      table.primary(['user_id', 'dream_id'])
      table.string('dreamName')
      table.string('dreamCost')
      table.enum('status', ['0', '1', '2']).notNullable()
        .defaultTo('1')
      table.timestamps()
    })
  }

  down() {
    this.drop('dreams_users')
  }
}

module.exports = DreamsUsersSchema
