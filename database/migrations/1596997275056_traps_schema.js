'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class TrapsSchema extends Schema {
  up () {
    this.create('traps', (table) => {
      table.uuid('id').primary()
        .defaultTo(this.db.raw('public.gen_random_uuid()'))

      table.string('name').notNullable()
        .unique()
      table.json('message').notNullable()
      table.integer('reward').notNullable()
        .defaultTo(0)
      table.integer('penalty').notNullable()
        .defaultTo(0)

      table.timestamps()
    })
  }

  down () {
    this.drop('traps')
  }
}

module.exports = TrapsSchema
