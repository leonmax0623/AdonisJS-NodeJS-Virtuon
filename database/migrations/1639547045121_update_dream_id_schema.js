'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class UpdateDreamIdSchema extends Schema {
  up () {
    this.alter('dreams_users', (table) => {
      table.uuid('dream_id').nullable().alter();
    })
  }

  down () {
  }
}

module.exports = UpdateDreamIdSchema
