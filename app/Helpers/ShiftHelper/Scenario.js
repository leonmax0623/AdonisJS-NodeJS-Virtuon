'use strict'

const Logger = use('Logger')
const Database = use('Database')
const moment = use('moment')
const User = use('App/Repo/User')

const dailyEvent = async helper => {
    let amount = helper.shift.charge_amount || 0

    if (helper.shift.eco_mode) {
        const ecoModeDayNumber = moment(helper.shift.eco_mode_start)
            .diff(moment(), 'days', true)

        switch (helper.shift.eco_mode) {
            case 'crisis':
                if (ecoModeDayNumber > 1) {
                    Logger.notice('Stop crisis')
                    await helper.eco_reset()
                } else {
                    amount = 0
                }
                break
    
            case 'stagnation':
                if (ecoModeDayNumber > 4) {
                    Logger.notice('Stop stagnation')
                    await helper.eco_reset()
                } else {
                    amount = 50
                }
                break
    
            case 'sanctions':
                if (ecoModeDayNumber > 1) {
                    Logger.notice('Stop sanctions')
                    await helper.eco_reset()
                }
                break
    
            case 'growth':
                if (ecoModeDayNumber > 3) {
                    Logger.notice('Stop growth')
                    await helper.eco_reset()
                } else {
                    switch (Math.abs(ecoModeDayNumber) + 1) {
                        case 1:
                            amount += 5
                            break
        
                        case 2:
                            amount += 10
                            break
        
                        case 3:
                            amount += 20
                            break
                    }
                }
                break
        }
    }

    if (amount > 0) {
        Logger.info('Daily charge', { amount })
        await helper.bulkCharge(undefined, amount, null, null, 'common')
    }
}

module.exports = async (helper, dayNumber) => {
    Logger.info('Scenario day number', { dayNumber })

    switch (Number(dayNumber)) {
        case 2:
            Logger.notice('Emit inflation')
            await helper.inflation()
            break

        case 3:
            Logger.notice('Emit trap #1')
            await helper.trap(1)
            break

        case 4:
            Logger.notice('Start growth')
            await helper.growth()
            break

        case 5:
            Logger.notice('Emit trap #2')
            await helper.trap(2)
            break

        case 6:
            Logger.notice('Emit trap #2')
            await helper.trap(3)
            break

        case 7:
            Logger.notice('Emit deflation')
            await helper.deflation()
            await Database.transaction(t => {
                Logger.notice('Charge weekly profit')
                return User.model.query()
                    .where('status', '1')
                    .fetch()
                    .then(result => (result.rows))
                    .then(users => users.map(async user => {
                        const balance = await user.balance('wallet')
                        const amount = Math.ceil(balance * 0.06)

                        return User.charge(user.id, 'wallet', amount, 'Начисление процентов на остаток', null, t)
                    }))
                    .then(promises => Promise.all(promises))
            })
            break

        case 8:
            Logger.notice('Emit trap #4')
            await helper.trap(4)
            break

        case 9:
            Logger.notice('Emit stagnation')
            await helper.stagnation()
            break

        case 10:
            Logger.notice('Emit trap #5')
            await helper.trap(5)
            break

        case 11:
            Logger.notice('Emit trap #6')
            await helper.trap(6)
            break

        case 12:
            Logger.notice('Emit crisis')
            await helper.crisis()
            break

        case 13:
            Logger.notice('Emit devaluation')
            await helper.devaluation()
            break

        case 14:
            Logger.notice('Emit trap #7')
            await helper.trap(7)
            break

        case 15:
            Logger.notice('Emit sanctions')
            await helper.sanctions()
            break

        case 16:
            Logger.notice('Emit trap #8')
            await helper.trap(8)
            break

        case 17:
            Logger.notice('Emit denomination')
            await helper.denomination()
            break

        case 18:
            Logger.notice('Emit trap #9')
            await helper.trap(9)
            break

        default:
            Logger.error('No scenario for day', { dayNumber })
    }

    await dailyEvent(helper)
}
