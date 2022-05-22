'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class PushTokensSchema extends Schema {
  up () {
    this.create('user_tokens', (table) => {
      table.uuid('id').primary()
        .defaultTo(this.db.raw('public.gen_random_uuid()'))

      table.uuid('user_id').unsigned().notNullable()
        .index()
        .references('id').inTable('users')
        .onUpdate('cascade').onDelete('cascade')

      table.enum('type', ['ios', 'android', 'web'])
        .notNullable()
        .index()

      table.string('label')
      table.string('token').notNullable()
        .unique()

      table.timestamps()
    })
  }

  down () {
    this.drop('user_tokens')
  }
}

module.exports = PushTokensSchema
