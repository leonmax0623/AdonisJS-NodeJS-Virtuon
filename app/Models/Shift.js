'use strict'

const Model = use('Model')
const moment = use('moment')

module.exports = class Shift extends Model
{
    static MODE = {
        crisis: 'Кризис',
        stagnation: 'Стагнация экономики',
        growth: 'Рост экономики',
        sanctions: 'Санкции',
    }

    static get computed () {
        return ['duration', 'proceed', 'estimated']
    }

    static get dates () {
        return super.dates.concat(['begin', 'end', 'eco_mode_start'])
    }

    getDuration () {
        return moment(this.begin)
            .diff(this.end, 'days', true)
    }

    getProceed () {
        const begin = moment(this.begin)
        const now = moment()

        return (begin < now)
            ? begin.diff(now, 'days', true)
            : 0
    }

    getEstimated () {
        const end = moment(this.end)
        const now = moment()

        return (end > now)
            ? end.diff(now, 'days', true)
            : 0
    }

    users () {
        return this.belongsToMany('App/Models/User', 'shift_id', 'user_id')
            .pivotTable('shifts_users')
            .withTimestamps()
    }
}
