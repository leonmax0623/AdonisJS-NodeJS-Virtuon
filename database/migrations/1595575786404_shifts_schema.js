'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class ShiftsSchema extends Schema {
  up () {
    this.create('shifts', (table) => {
      table.increments()

      table.string('name').notNullable()
      table.text('description')
      table.date('begin')
      table.date('end')
      table.unique(['name', 'begin'])
      table.unique(['name', 'end'])
      table.integer('charge_interval').notNullable()
        .defaultTo(1)
      table.integer('charge_amount').notNullable()
        .defaultTo(100)
      table.enum('eco_mode', ['crisis', 'stagnation', 'sanctions', 'growth'])
        .index()
      table.datetime('eco_mode_start')
      table.timestamps()
    })
  }

  down () {
    this.drop('shifts')
  }
}

module.exports = ShiftsSchema
