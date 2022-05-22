'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class ScenarioTrapSchema extends Schema {
  up() {
    this.create('scenario_trap', (table) => {
      table.uuid('id').primary().defaultTo(this.db.raw('public.gen_random_uuid()'))
      table.integer('day');
      table.string('name');
      table.string('message');
      table.enum('action_type', ['1', '2']).notNullable().defaultTo('1');
      table.string('yes_lable');
      table.string('no_lable');
      table.string('yes_amount');
      table.string('no_amount');
      table.string('next_question_id');
      table.timestamps()
    })
  }

  down() {
    this.drop('scenario_trap')
  }
}

module.exports = ScenarioTrapSchema
