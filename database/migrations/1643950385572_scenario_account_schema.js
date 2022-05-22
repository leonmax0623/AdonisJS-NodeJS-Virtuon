'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class ScenarioAccountSchema extends Schema {
  up() {
    this.create('scenario_account', (table) => {
      table.uuid('id').primary().defaultTo(this.db.raw('public.gen_random_uuid()'))
      table.integer('day').notNullable();
      table.string('account').notNullable();
      table.string('virtuon').notNullable();
      table.enum('type', ['1', '2']).notNullable().defaultTo('1');
      table.timestamps()
    })
  }

  down() {
    this.drop('scenario_account')
  }
}

module.exports = ScenarioAccountSchema
