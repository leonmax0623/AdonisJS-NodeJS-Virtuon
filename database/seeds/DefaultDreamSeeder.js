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
const Dream = use('App/Models/Dream')
const Database = use('Database')

class DefaultDreamSeeder {

  async run() {
    await Database.raw('TRUNCATE dreams CASCADE')
    const dreams = [
      {
        name: 'automobile',
        value: 1000,
        status: '1',
      },
      {
        name: 'house',
        value: 2000,
        status: '1',
      },
      {
        name: 'business',
        value: 3000,
        status: '1',
      }
    ]

    for (let i = 0; i < dreams.length; i++) {
      await Dream.create({
        ...dreams[i],
      })
    }
  }
}

module.exports = DefaultDreamSeeder
