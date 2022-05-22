'use strict'

/*
|--------------------------------------------------------------------------
| DefaultShiftSeeder
|--------------------------------------------------------------------------
|
| Make use of the Factory instance to seed database with dummy data or
| make use of Lucid models directly.
|
*/

/** @type {import('@adonisjs/lucid/src/Factory')} */
const Factory = use('Factory')
const Shift = use('App/Models/Shift')
const moment = use('moment')
const Database = use('Database')


class DefaultShiftSeeder {
  async run () {
    await Database.raw('TRUNCATE shifts CASCADE')
    await Shift.create({
      name: 'Первая',
      description: 'Первая смена для проверки',
      begin: moment(),
      end: moment().add(18, 'd'),
    })
  }
}

module.exports = DefaultShiftSeeder
