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
const ScenarioVideo = use('App/Models/ScenarioVideo')
const Database = use('Database')

class DefaultScenarioVideoSeeder {

  async run() {
    await Database.raw('TRUNCATE scenario_video CASCADE')
    
    for (let i = 1; i < 22; i++) {
      await ScenarioVideo.create({
        day: i,
        video: 'stage_001.mp4',
        message: 'Видео сообщение'
      })
    }
  }
}

module.exports = DefaultScenarioVideoSeeder
