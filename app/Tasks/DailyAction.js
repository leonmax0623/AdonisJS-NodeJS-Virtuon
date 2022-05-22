'use strict'

const Task = use('Task')
const Shift = use('App/Models/Shift')
const ShiftHelper = use('App/Helpers/ShiftHelper')
const moment = use('moment')
const { raw } = use('Database')
const UserRepo = use('App/Repo/User')
const Common = use('App/Repo/Common')

class DailyAction extends Task {
  static get schedule() {
    return '0 0 12 * * *'
  }

  static getDayNumber(shift) {
    const daysFromBegin = moment(shift.begin)
      .diff(moment(), 'days')
    return Math.abs(daysFromBegin % 18) + 1
  }

  async handle() {
    const helper = new ShiftHelper({});
    helper.newScenario();
    
    /*
    const shifts = await Shift.query().fetch().then(result => (result.rows));
    shifts.forEach(async (shift) => {
      const helper = new ShiftHelper(shift)
      const dayNumber = this.constructor.getDayNumber(shift)
      helper.scenario(dayNumber)
      
    })
    */
  }
}

module.exports = DailyAction
