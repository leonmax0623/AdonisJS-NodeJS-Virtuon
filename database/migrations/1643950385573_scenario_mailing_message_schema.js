'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class ScenarioMailingMessageSchema extends Schema {
  up() {
    this.create('scenario_mailing_message', (table) => {
      table.uuid('id').primary().defaultTo(this.db.raw('public.gen_random_uuid()'))
      table.integer('day').notNullable();
      table.text('message').notNullable();
      table.timestamps()
    })
  }

  down() {
    this.drop('scenario_mailing_message')
  }
}

module.exports = ScenarioMailingMessageSchema
