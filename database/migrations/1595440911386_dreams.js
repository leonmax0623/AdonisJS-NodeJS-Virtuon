'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class DreamsSchema extends Schema {
  up() {
    this.create('dreams', (table) => {
      table.uuid('id').primary().defaultTo(this.db.raw('public.gen_random_uuid()'))
      table.string('name')
      table.string('value')
      table.enum('status', ['1', '2']).notNullable()
        .defaultTo('1')
      table.timestamps()
    })
  }

}

module.exports = DreamsSchema
