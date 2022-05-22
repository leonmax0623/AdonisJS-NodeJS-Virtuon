'use strict'

/*
|--------------------------------------------------------------------------
| DefaultAdminSeeder
|--------------------------------------------------------------------------
|
| Make use of the Factory instance to seed database with dummy data or
| make use of Lucid models directly.
|
*/

/** @type {import('@adonisjs/lucid/src/Factory')} */
const Factory = use('Factory')
const ScenarioMailingMessage = use('App/Models/ScenarioMailingMessage')
const Database = use('Database')

class DefaultScenarioMailingMessageSeeder {

  async run() {
    await Database.raw('TRUNCATE scenario_mailing_message CASCADE')
    
    for (let i = 1; i < 22; i++) {
      await ScenarioMailingMessage.create({
        day: i,
        message: 'Твои Виртуоны заболели инфляцией. Они ослабли и похудели. «Кошелёк» стал меньше на 100 V.',
      })
    }
  }
}

module.exports = DefaultScenarioMailingMessageSeeder
