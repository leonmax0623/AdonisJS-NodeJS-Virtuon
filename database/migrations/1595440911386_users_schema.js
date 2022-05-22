'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class UsersSchema extends Schema {
  up () {
    this.create('users', (table) => {
      table.uuid('id').primary()
        .defaultTo(this.db.raw('public.gen_random_uuid()'))

      table.string('username').notNullable()
        .unique()

      table.string('password')
      table.string('firstname')
      table.string('lastname')
      table.index(['firstname', 'lastname'])
      table.string('email')
        .unique()
      table.text('about')

      table.enum('status', ['active', 'inactive']).notNullable()
        .defaultTo('inactive')
      table.bool('is_admin').notNullable()
        .index()
        .defaultTo(false)
      table.datetime('last_login')

      table.timestamps()
    })
  }

  down () {
    this.drop('users')
  }
}

module.exports = UsersSchema
