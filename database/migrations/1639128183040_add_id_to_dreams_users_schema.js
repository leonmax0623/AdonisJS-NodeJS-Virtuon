'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class AddIdToDreamsUsersSchema extends Schema {
  up() {
    this.table('dreams_users', (table) => {
      table.dropPrimary();
      table.uuid('id').primary()
        .defaultTo(this.db.raw('public.gen_random_uuid()')).first()

    })
  }

  down() {
    this.table('dreams_users', (table) => {
      table.dropColumn('id')
    })
  }
}

module.exports = AddIdToDreamsUsersSchema
