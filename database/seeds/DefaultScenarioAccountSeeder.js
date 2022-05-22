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
const ScenarioAccount = use('App/Models/ScenarioAccount')
const Database = use('Database')

class DefaultScenarioAccountSeeder {

  async run() {
    await Database.raw('TRUNCATE scenario_account CASCADE')
    const scenarioAccounts = [
      {
        day: 1,
        account: 'common',
        virtuon: 100,
        type:1
      },
      {
        day: 2,
        account: 'common',
        virtuon: 100,
        type:1
      },
      {
        day: 3,
        account: 'common',
        virtuon: 100,
        type:1
      },
      {
        day: 3,
        account: 'wallet',
        virtuon: '-100',
        type:1
      },
      {
        day: 4,
        account: 'common',
        virtuon: 100,
        type:1
      },
      {
        day: 4,
        account: 'wallet',
        virtuon: '-100',
        type:1
      },
      {
        day: 5,
        account: 'common',
        virtuon: 100,
        type:1
      },
      {
        day: 5,
        account: 'common',
        virtuon: 200,
        type:1
      },
      {
        day: 6,
        account: 'common',
        virtuon: 100,
        type:1
      },
      {
        day: 6,
        account: 'common',
        virtuon: 300,
        type:1
      },
      {
        day: 7,
        account: 'common',
        virtuon: 100,
        type:1
      },
      {
        day: 7,
        account: 'common',
        virtuon: 500,
        type:1
      },
      {
        day: 8,
        account: 'common',
        virtuon: 100,
        type:1
      },
      {
        day: 8,
        account: 'common',
        virtuon: 200,
        type:1
      },
      {
        day: 9,
        account: 'common',
        virtuon: 100,
        type:1
      },
      {
        day: 9,
        account: 'common',
        virtuon: 100,
        type:1
      },
      {
        day: 10,
        account: 'common',
        virtuon: 50,
        type:1
      },
      {
        day: 11,
        account: 'common',
        virtuon: 50,
        type:1
      },
      {
        day: 12,
        account: 'common',
        virtuon: 50,
        type:1
      },
      {
        day: 14,
        account: 'dream',
        virtuon: 500,
        type:1
      },
      {
        day: 14,
        account: 'common',
        virtuon: 100,
        type:1
      },
      {
        day: 15,
        account: 'common',
        virtuon: 100,
        type:1
      },
      {
        day: 16,
        account: 'common',
        virtuon: 100,
        type:1
      },
      {
        day: 17,
        account: 'common',
        virtuon: 100,
        type:1
      },
      {
        day: 18,
        account: 'common',
        virtuon: 100,
        type:1
      },
      {
        day: 19,
        account: 'common',
        virtuon: 100,
        type:1
      },
      {
        day: 20,
        account: 'all',
        virtuon: 10,
        type:2
      },
      {
        day: 21,
        account: 'common',
        virtuon: 300,
        type:1
      }
    ]

    for (let i = 0; i < scenarioAccounts.length; i++) {
      await ScenarioAccount.create({
        ...scenarioAccounts[i],
      })
    }
  }
}

module.exports = DefaultScenarioAccountSeeder
