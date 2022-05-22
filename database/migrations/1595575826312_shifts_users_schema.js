'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class ShiftsUsersSchema extends Schema {
  up() {
    this.create('shifts_users', (table) => {
      table.uuid('user_id').unsigned().notNullable()
        .references('id').inTable('users')
        .onUpdate('cascade').onDelete('cascade')
      table.integer('shift_id').unsigned().notNullable()
        .references('id').inTable('shifts')
        .onUpdate('cascade').onDelete('cascade')
      table.primary(['user_id', 'shift_id'])
      table.timestamps()
    })
  }

  down() {
    this.drop('shifts_users')
  }
}

module.exports = ShiftsUsersSchema
