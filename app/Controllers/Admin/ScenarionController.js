'use strict'

const _ = require('lodash')
const moment = use('moment')
const Logger = use('Logger')
const AccountType = use('App/Models/AccountType');
const Assignments = use('App/Models/Assignments');
const ScenarioAccount = use('App/Models/ScenarioAccount');
const ScenarioDayAssignment = use('App/Models/ScenarioDayAssignment');
const ScenarioVideo = use('App/Models/ScenarioVideo');
const ScenarioMailingMessage = use('App/Models/ScenarioMailingMessage');
const ScenarioTrap = use('App/Models/ScenarioTrap');

module.exports = class ScenarionController {
    async index({ view, transform }) {
        const scenario = Array(21);
        return view.render('admin/scenario/index', { scenario })
    }

    async edit({ params: { day }, transform, view, response }) {
        const actionUrl = "/admin/scenario/update";
        const accountType = await AccountType.query().fetch().then(({ rows }) => rows);
        const assignments = await Assignments.query().fetch().then(({ rows }) => rows);
        const accounts = await ScenarioAccount.query().where({ 'day': day }).fetch().then(({ rows }) => rows);
        const traps = await ScenarioTrap.query().with('nextTrap').where({ 'day': day }).fetch().then(({ rows }) => rows);
        const scenarioDayAssignmentsId = await ScenarioDayAssignment.query().select('assignment_id').where({ 'day': day }).fetch().then(({ rows }) => rows);
        let assignmentId = [];
        scenarioDayAssignmentsId.forEach(id => {
            assignmentId.push(id.assignment_id);
        });
        const video = await ScenarioVideo.query().where({ 'day': day }).first();
        const mail = await ScenarioMailingMessage.query().where({ 'day': day }).first();
        return view.render('admin/scenario/view', { day, actionUrl, video, mail, accountType, accounts, assignments, assignmentId, traps })
    }

    async update({ params: { type }, request, response }) {
        try {
            if (type == 'transaction') {
                const accounts = request.input('account');
                const type = request.input('type');
                const virtuon = request.input('virtuon');
                await ScenarioAccount.query().where({ 'day': request.input('day') }).delete();
                await accounts.forEach(async (account, index) => {
                    if ((accounts.length - 1) > index) {
                        const sAccount = new ScenarioAccount();
                        sAccount.day = request.input('day');
                        sAccount.account = account;
                        sAccount.type = type[index];
                        sAccount.virtuon = virtuon[index];
                        await sAccount.save();
                    }
                });
            }
            if (type == 'video') {
                await ScenarioVideo.query().update({ 'video': request.input('video'), 'message': request.input('videoMessage') }).where({ 'day': request.input('day') });
            }
            if (type == 'mail') {
                await ScenarioMailingMessage.query().update({ 'message': request.input('mailMessage') }).where({ 'day': request.input('day') });
            }
            if (type == 'assignments') {
                const assignments = request.input('assignments');
                await ScenarioDayAssignment.query().where({ 'day': request.input('day') }).delete();
                await assignments.forEach(async (assignment, index) => {
                    const dayAssignment = new ScenarioDayAssignment();
                    dayAssignment.day = request.input('day');
                    dayAssignment.assignment_id = assignment;
                    await dayAssignment.save();
                });
            }
            if (type == 'trap') {
                const parameters = request.all();
                const dayTrap = new ScenarioTrap();
                dayTrap.day = parameters.day;
                dayTrap.name = parameters.trap_name;
                dayTrap.message = parameters.trap_message;
                dayTrap.action_type = parameters.action_type;
                if (parameters.action_type == '2') {
                    const nextTrap = new ScenarioTrap();
                    nextTrap.day = '';
                    nextTrap.name = parameters.nex_trap_name;
                    nextTrap.message = parameters.next_trap_message;
                    nextTrap.action_type = '1';
                    nextTrap.yes_lable = parameters.yes_lable;
                    nextTrap.yes_amount = parameters.yes_amount;
                    nextTrap.no_lable = parameters.no_lable;
                    nextTrap.no_amount = parameters.no_amount;
                    nextTrap.no_amount = parameters.no_amount;
                    await nextTrap.save()
                    dayTrap.yes_lable = parameters.next_button_lable;
                    dayTrap.yes_amount = 'next';
                    dayTrap.next_question_id = nextTrap.id;
                } else {
                    dayTrap.yes_lable = parameters.yes_lable;
                    dayTrap.yes_amount = parameters.yes_amount;
                    dayTrap.no_lable = parameters.no_lable;
                    dayTrap.no_amount = parameters.no_amount;
                }
                await dayTrap.save();
                response.redirect('/admin/scenario/edit/' + parameters.day)
            }
            response.redirect('/admin/scenario/edit/' + request.input('day'))
        } catch (err) {
            console.log(err);
            response.redirect('/admin/scenario/edit/' + request.input('day'))
        }
        // await ScenarioMailingMessage.query().where({ 'day': day }).first();



        // const shift = await Shift.findOrFail(id)
        // const attributes = _.pickBy(request.only([
        //     'name',
        //     'description',
        //     'begin',
        //     'end',
        //     'charge_interval',
        //     'charge_amount',
        // ]), v => (!['null', '', undefined, 'undefined'].includes(v)))
        // shift.merge(attributes)
        // await shift.save()

        // response.redirect(request.header('referer'))
    }


    async deleteTrap({ params: { id, day }, response }) {
        try {
            const scenariotrap = await ScenarioTrap.find(id);
            if (scenariotrap) {
                if (ScenarioTrap.next_question_id) {
                    await ScenarioTrap.query().where({ 'id': scenariotrap.next_question_id }).delete();
                }
                await ScenarioTrap.query().where({ 'id': id }).delete();
            }
            return response.redirect('/admin/scenario/edit/' + day);
        } catch (err) {
            console.log(err);
        }
    }
}
