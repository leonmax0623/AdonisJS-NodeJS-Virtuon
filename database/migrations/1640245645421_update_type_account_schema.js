'use strict'


/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')
const Database = use('Database');


class UpdateTypeAccountSchema extends Schema {
  async up() {
    await Database.raw('ALTER TABLE accounts DROP CONSTRAINT accounts_type_check');
    await Database.raw("ALTER TABLE accounts ADD CONSTRAINT accounts_type_check CHECK (type = ANY (ARRAY['common'::text,'dream'::text,'podushka'::text,'credit'::text,'deposit'::text,'wallet'::text,'investment'::text]))");
  }

  down() {
    this.table('accounts', (table) => {
      // reverse alternations
    })
  }
}

module.exports = UpdateTypeAccountSchema
