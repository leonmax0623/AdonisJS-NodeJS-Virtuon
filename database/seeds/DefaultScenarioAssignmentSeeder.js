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
const Assignments = use('App/Models/Assignments')
const AssignmentQuestions = use('App/Models/AssignmentQuestions')
const AssignmentOptions = use('App/Models/AssignmentOptions')
const ScenarioDayAssignment = use('App/Models/ScenarioDayAssignment')
const Database = use('Database')

class DefaultScenarioAssignmentSeeder {

  async run() {
    await Database.raw('TRUNCATE assignment_options CASCADE')
    await Database.raw('TRUNCATE assignment_questions CASCADE')
    await Database.raw('TRUNCATE assignments CASCADE')
    await Database.raw('TRUNCATE scenario_day_assigment CASCADE')

    let assignment = await Assignments.create({
      title: 'Зачем нужно сберегать деньги?',
      description: "Сберегать – это важно! Наличие сбережений позволяет семье безболезненно пережить непредвиденные жизненные ситуации и достигать поставленных финансовых целей.Вот универсальные правила эффективных сбережений:",
      file:"stage_001.mp4",
      status: '1',
      url:"https://cloud.mail.ru/public/sWEv/yn8Ep36Zf",
    });

    let assignmentquestions = await AssignmentQuestions.create({
      assignment_id: assignment.id,
      title: "Выбери верное утверждение",
    });

    let assignmentoptions = await AssignmentOptions.create({
      questions_id: assignmentquestions.id,
      option_title: "Наличие сбережений позволяет семье безболезненно пережить непредвиденные жизненные ситуации и достичь поставленных финансовых целейВыбери верное утверждение",
      reward: 1,
      status: '1',
      option_value: 1
    })

    assignmentoptions = await AssignmentOptions.create({
      questions_id: assignmentquestions.id,
      option_title: "Чем выше уровень ожиданий доходности, тем ниже риск получения убытков",
      reward: 0,
      status: '1',
      option_value: '0'
    })

    for (let i = 1; i < 22; i++) {
      await ScenarioDayAssignment.create({
        day: i,
        assignment_id: assignment.id
      })
    }
  }
}

module.exports = DefaultScenarioAssignmentSeeder
