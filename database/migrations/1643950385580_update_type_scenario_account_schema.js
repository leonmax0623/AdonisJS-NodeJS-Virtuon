'use strict'


/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')
const Database = use('Database');


class UpdateTypeAccountSchema extends Schema {
  async up() {
    await Database.raw('ALTER TABLE scenario_account DROP CONSTRAINT scenario_account_type_check');
    await Database.raw("ALTER TABLE scenario_account ADD CONSTRAINT scenario_account_type_check CHECK (type = ANY (ARRAY['1'::text,'2'::text,'3'::text]))");
  }

  down() {
    this.table('scenario_account', (table) => {
      // reverse alternations
    })
  }
}

module.exports = UpdateTypeAccountSchema
