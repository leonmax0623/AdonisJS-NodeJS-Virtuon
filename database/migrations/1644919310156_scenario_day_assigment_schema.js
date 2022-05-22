'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class ScenarioDayAssigmentSchema extends Schema {
  up () {
    this.create('scenario_day_assigment', (table) => {
      table.uuid('id').primary().defaultTo(this.db.raw('public.gen_random_uuid()'))
      table.integer('day');
      table.uuid('assignment_id').unsigned().notNullable().references('id').inTable('assignments').onUpdate('cascade').onDelete('cascade');
      table.timestamps()
    })
  }

  down () {
    this.drop('scenario_day_assigment')
  }
}

module.exports = ScenarioDayAssigmentSchema
