'use strict'

const _ = require('lodash')
const moment = use('moment')
const Logger = use('Logger')

const Shift = use('App/Models/Shift')
const ShiftHelper = use('App/Helpers/ShiftHelper')
const ShiftTransformer = use('App/Transformers/ShiftTransformer')

const User = use('App/Repo/User')
const UserTransformer = use('App/Transformers/UserTransformer')

const Trap = use('App/Models/Trap')

module.exports = class ShiftController {
    async index({ view, transform }) {
        let shifts = await Shift.query()
            .fetch()
        shifts = await transform.collection(shifts, ShiftTransformer)
        return view.render('admin/shifts/index', { shifts })
    }

    async view({ params: { id }, transform, view, response }) {
        const shift = await Shift.findOrFail(id)
        const users = await shift.users()
            .fetch()
            .then(data => transform
                .include('id,accounts,status,total_balance,progress,score')
                .collection(data, UserTransformer))
            .then(users => _.orderBy(users, 'score', 'desc'))

        const traps = await Trap.query()
            .fetch()

        return view.render('admin.shifts.view', {
            shift,
            users,
            traps: traps.rows,
            with_progress: true,
        })
    }

    async update({ params: { id }, request, response }) {
        const shift = await Shift.findOrFail(id)
        const attributes = _.pickBy(request.only([
            'name',
            'description',
            'begin',
            'end',
            'charge_interval',
            'charge_amount',
        ]), v => (!['null', '', undefined, 'undefined'].includes(v)))
        shift.merge(attributes)
        await shift.save()

        response.redirect(request.header('referer'))
    }

    async select({ params: { id }, view }) {
        const shift = await Shift.findOrFail(id)
        const users = await User.model.query()
            .whereDoesntHave('shifts', builder => {
                builder.where({ id })
            })
            .fetch()

        return view.render('admin.shifts.select-users', { shift, users: users.rows })
    }

    async invite({ params: { id }, request, response }) {
        const shift = await Shift.findOrFail(id)

        await shift.users()
            .attach(request.input('user_id'))

        try {
            const now = moment()
            const begin = moment(shift.begin)
            const end = moment(shift.end)

            if (now > begin && now < end) {
                await shift.users()
                    .where('status', '0')
                    .update({ status: '1' })
            }
        } catch (error) {
            Logger.warning(error.message, error)
        }

        return response.redirect('/admin/shifts/' + shift.id)
    }

    async charge({ params: { id }, request, response }) {
        const shift = await Shift.findOrFail(id)
        const helper = new ShiftHelper(shift)

        let filter = { status: '1' }
        if (request.input('all_users') !== 'yes') {
            filter = builder => {
                builder.where({ status: '1' })
                    .whereIn('id', request.input('user_id', []))
            }
        }
        await helper.bulkCharge(filter, request.input('amount'), null, request.input('reason'), request.input('account'))

        response.redirect(request.header('referer'))
    }

    async applyScenario({ params: { id }, request, response }) {
        const helper = await Shift.findOrFail(id)
            .then(shift => (new ShiftHelper(shift)))

        await helper.scenario(request.input('day_number'))

        response.redirect(request.header('referer'))
    }
}
