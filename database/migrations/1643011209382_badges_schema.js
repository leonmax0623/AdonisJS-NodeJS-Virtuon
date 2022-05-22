'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class BadgesSchema extends Schema {
  up() {
    this.create('badges', (table) => {
      table.uuid('id').primary().defaultTo(this.db.raw('public.gen_random_uuid()'))
      table.string('name').notNullable()
      table.string('value').notNullable()
      table.text('icon')
      table.string('color')
      table.enum('status', ['0', '1']).notNullable()
        .defaultTo('1')
      table.timestamps()
    })
  }

  down() {
    this.drop('badges')
  }
}

module.exports = BadgesSchema
