'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class ScenarioVideoSchema extends Schema {
  up() {
    this.create('scenario_video', (table) => {
      table.uuid('id').primary().defaultTo(this.db.raw('public.gen_random_uuid()'))
      table.integer('day').notNullable();
      table.text('video').notNullable();
      table.text('message');
      table.timestamps()
    })
  }

  down() {
    this.drop('scenario_video')
  }
}

module.exports = ScenarioVideoSchema
