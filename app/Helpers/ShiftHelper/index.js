'use strict'

const moment = require('moment')
const Database = use('Database')
const Logger = use('Logger')
const Event = use('Event')
const User = use('App/Repo/User')
const Trap = use('App/Models/Trap')
const { TYPE } = use('App/Models/Account')
const { pickBy, chunk, orderBy } = require('lodash')
const ScenarioAccount = use('App/Models/ScenarioAccount')
const ScenarioVideo = use('App/Models/ScenarioVideo')
const ScenarioTrap = use('App/Models/ScenarioTrap')
const ScenarioMailingMessage = use('App/Models/ScenarioMailingMessage')
const ScenarioDayAssignment = use('App/Models/ScenarioDayAssignment')
const Usermodel = use('App/Models/User')
const Common = use('App/Repo/Common')
const Env = use('Env')

module.exports = class ShiftHelper {
    #shift

    constructor(shift) {
        this.#shift = shift
    }

    static get reason() {
        return {
            inflation: 'Инфляция',
            deflation: 'Дефляция',
            devaluation: 'Девальвация',
            crisis: 'Кризис',
            stagnation: 'Стагнация экономики',
            sanctions: 'Санкции',
            growth: 'Рост экономики',
            denomination: 'Деноминация',
        }
    }

    get shift() {
        return this.#shift
    }

    get traps() {
        return require('./Trap')
    }

    scenario(dayNumber) {
        return require('./Scenario')(this, dayNumber)
    }

    async newScenario() {
        const filter = { status: '1', is_admin: false }
        const event = '';
        const users = await Usermodel.query().where(filter).fetch();
        const usersJson = users.toJSON();
        const ms = Env.get('CRON_SLEEP_TIME');
        for (const user of usersJson) {
            var day = moment(moment()).diff(user.created_at, 'days') + 1;
            var cron = true;
            if (day > 21) {
                const shiftDay = Math.trunc(Math.abs(day / 21))
                day = shiftDay;
            } else {
                if (day == 1) {
                    cron = false;
                }
            }
            if (day && cron) {
                await this.addTransaction(day, user.id);
                await this.sleep(ms);
                await this.sentVideoMessage(day, user.id);
                await this.sleep(ms);
                await this.sentMailingMessage(day, user.id);
                await this.sleep(ms);
                await this.sentTrapMessage(day, user.id);
                await this.sleep(ms);
                await this.sentAssignements(day, user.id);
            }
        }
        await this.sleep(ms);
        await User.creditSettlement();
        await this.sleep(ms);
        await User.depositeSettlement();
        await this.sleep(ms);
        await Common.PropertyReward();
    }
    async sleep(ms) {
        return new Promise((resolve) => {
            setTimeout(resolve, ms);
        });
    }

    async newScenarioTest(day, userId) {
        const ms = Env.get('CRON_SLEEP_TIME');
        await this.addTransaction(day, userId);
        await this.sleep(ms);
        await this.sentVideoMessage(day, userId);
        await this.sleep(ms);
        await this.sentMailingMessage(day, userId);
        await this.sleep(ms);
        await this.sentTrapMessage(day, userId);
        await this.sleep(ms);
        await this.sentAssignements(day, userId);
        await this.sleep(ms);
        await User.creditSettlement();
        await this.sleep(ms);
        await User.depositeSettlement();
        await this.sleep(ms);
        await Common.PropertyReward();
        await this.sleep(ms);
    }

    async addTransaction(day, userId) {
        const accountScenario = await ScenarioAccount.query().where({ 'day': day }).fetch();
        const accountScenarioJson = accountScenario.toJSON();
        for (const scenario of accountScenarioJson) {
            if (Object.keys(TYPE).includes(scenario.account)) {
                if (scenario.type == 1) {
                    await User.charge(userId, scenario.account, scenario.virtuon, null, null, null)
                }
                if (scenario.type == 2) {
                    const user = await Usermodel.findOrFail(userId);
                    const balance = await user.balance(scenario.account)
                    const amount = Math.trunc(Math.abs(balance * scenario.virtuon / 100));
                    if (scenario.virtuon > 0) {
                        await User.charge(userId, scenario.account, amount, null, null, null)
                    } else {
                        await User.charge(userId, scenario.account, amount * -1, null, null, null)
                    }
                }
            } else {
                switch (scenario.account) {
                    case 'all':
                        await this.allAccountTransaction(scenario, userId);
                        break
                }
            }
        }
    }

    async allAccountTransaction(scenario, userId) {
        const user = await Usermodel.findOrFail(userId)
        if (user) {
            const transactions = await user.accounts()
                .fetch()
                .then(({ rows }) => orderBy(rows, ['created_at']))
                .then(async function (accounts) {
                    const trpromises = [];
                    await accounts.forEach(async function (account) {
                        if (scenario.type == 1) {
                            await User.charge(userId, account.type, scenario.virtuon, null, null, null)
                        }
                        if (scenario.type == 2) {
                            const balance = await user.balance(account.type)
                            const amount = Math.trunc(Math.abs(balance * scenario.virtuon / 100));
                            if (scenario.virtuon > 0) {
                                await User.charge(userId, account.type, amount, null, null, null)
                            } else {
                                await User.charge(userId, account.type, amount * -1, null, null, null)
                            }
                        }
                    })
                })
        }
    }

    async sentVideoMessage(day, userId, responseType = null) {
        const videoScenario = await ScenarioVideo.query().where({ 'day': day }).fetch();
        const videoScenarioJson = videoScenario.toJSON();
        var responseMessage = [];
        for (const scenario of videoScenarioJson) {
            const video = scenario.video;
            const message = scenario.message;
            responseMessage.push({video:video, message: message});
            if(responseType == null){
                Event.emit('scenario::videoMessage', { day, video, message, userId })
            } 
        }
        if(responseType == 'json'){
            return responseMessage;
        }
    }

    async sentMailingMessage(day, userId, responseType = null) {
        const mailingMessageScenario = await ScenarioMailingMessage.query().where({ 'day': day }).fetch();
        const mailingMessageScenarioJson = mailingMessageScenario.toJSON();
        var responseMessage = [];
        for (const scenario of mailingMessageScenarioJson) {
            const message = scenario.message;
            responseMessage.push({message: message});
            if(responseType == null){
                Event.emit('scenario::mailMessage', { day, message, userId })
            }
        }
        if(responseType == 'json'){
            return responseMessage;
        }
    }

    async sentTrapMessage(day, userId, responseType = null) {
        const trapMessageScenario = await ScenarioTrap.query().where({ 'day': day }).fetch();
        const trapMessageScenarioJson = trapMessageScenario.toJSON();
        var responseMessage = [];
        for (const scenario of trapMessageScenarioJson) {

            let trapId = scenario.id;
            let trapText = scenario.message;
            let trap = [];
            let trapActions = [
                {
                    value: 'yes',
                    label: scenario.yes_lable,
                }, {
                    value: 'no',
                    label: scenario.no_lable,
                }
            ]
            if (scenario.action_type == 2) {
                trapActions = [
                    {
                        value: scenario.yes_amount,
                        label: scenario.yes_lable,
                    }

                ]
            }
            let trapMessage = [
                {
                    text: trapText,
                    actions: trapActions
                },
            ];

            if (scenario.action_type == 2 && scenario.next_question_id) {
                const nextTrap = await ScenarioTrap.find(scenario.next_question_id);
                trapId = scenario.next_question_id;
                trapMessage.push({
                    label: scenario.yes_amount,
                    text: nextTrap.message,
                    actions: [
                        {
                            value: 'yes',
                            label: nextTrap.yes_lable,
                        }, {
                            value: 'no',
                            label: nextTrap.no_lable,
                        }
                    ]
                });
            }
            trap.id = trapId;
            trap.message = trapMessage;
            let usersIds = [];
            usersIds.push(userId);
            responseMessage.push({id: trapId, message: trapMessage})
            if(responseType == null){
                Event.emit('trap::issue', { trap, usersIds })
            }
        }
        if(responseType == 'json'){
            return responseMessage;
        }
    }

    async sentAssignements(day, userId, responseType = null) {
        const assignmentScenarion = await ScenarioDayAssignment.query().where({ 'day': day })
            .with('assignment', (builder) => {
                builder.with('assignmentquestions', (builder) => {
                    builder.with('assignmentoptions')
                })
            }).fetch();
        const assignmentScenarionJson = assignmentScenarion.toJSON();
        var responseMessage = [];
        for (const scenario of assignmentScenarionJson) {
            if (scenario.assignment[0].file) {
                scenario.assignment[0].file = Env.get('IMG_URL') + '/img/' + scenario.assignment[0].file;
            }
            const assignment = scenario.assignment[0];
            const message = assignment.title;
            responseMessage.push({assignment: assignment, message: message});
            if(responseType == null){
                Event.emit('scenario::assignementQuestion', { day, message, assignment, userId });
            }
        }
        if(responseType == 'json'){
            return responseMessage;
        }
    }


    async users(filter = {}) {
        const users = await User.model.query().where(filter).fetch()
        return users.rows
    }

    async bulkCharge(filter = { status: '1' }, amount, event, message, account = 'wallet') {
        const users = await User.model.query().where(filter).fetch()

        const affectedUsers = await Database.transaction(async t => {
            const promises = users.rows
                .map(async user => {
                    const day = moment(user.created_at).diff(moment(), 'days') + 1
                    if (day > 18) {
                        const shiftDaysFromBegin = moment(this.shift.begin).diff(moment(), 'days')
                        const shiftDay = Math.abs(shiftDaysFromBegin % 18) + 1
                        if (shiftDay > 5) {
                            const balance = await User.charge(user.id, account, amount,
                                event ? this.constructor.reason[event] : '', null, t)
                            Logger.notice(`[${user.username}] Баланс счёта «${account}»: ${balance.data.balance}`)
                            return user
                        }
                    } else {
                        const balance = await User.charge(user.id, account, amount,
                            event ? this.constructor.reason[event] : '', null, t)
                        Logger.notice(`[${user.username}] Баланс счёта «${account}»: ${balance.data.balance}`)
                        return user
                    }
                })

            return await Promise.all(promises)
        })

        if (event) {
            Event.emit(`event::${event}`, {
                shift: this.shift,
                users: affectedUsers,
                message,
            })
        }
    }

    inflation(amount = 100, filter) {
        return this.bulkCharge(filter, amount * -1, 'inflation',
            `Твои Виртуоны заболели инфляцией. Они ослабли и похудели. «Вкусняшек» стало меньше на ${amount} V`)
    }

    deflation(amount = 200, filter) {
        return this.bulkCharge(filter, amount, 'deflation',
            `Твои виртуоны накачались дефляцией. «Вкусняшек» стало больше на ${amount} V`)
    }

    async denomination(filter = { status: '1' }) {

        const users = await User.model.query().where(filter).fetch()
        const affectedUsers = await Database.transaction(async t => {
            const promises = users.rows
                .map(async user => {
                    // await UserRight
                    //     .query()
                    //     .select('user_id')
                    //     .distinct('user_id')
                    //     .preload('user')
                    //     .paginate(page || 1, limit || 10)
                    const accounts = await user.accounts().fetch();

                    const promises = accounts.rows
                        .map(async row => {
                            const balance = await row.balance()
                            if (balance === 0) {
                                Logger.warning(`[${user.username}] Баланс счёта «${row.type}» = 0`)
                                return
                            }
                            const discount = Math.floor(balance * 0.9)
                            const reason = `${this.constructor.reason.denomination}: Было ${balance}, стало ${balance - discount}`
                            if (row.type != 'credit' || row.type != 'deposit') {
                                return await User.charge(user.id, row, discount * -1, reason, null, t)
                            }
                        })
                        .filter(promise => (!!promise))

                    return await Promise.all(promises)
                })

            return await Promise.all(promises)
        })

        Event.emit(`event::denomination`, {
            shift: this.shift,
            users: affectedUsers,
            message: '«Валютные ножницы» отрезали от твоих Виртуонов один 0',
        })
    }

    async devaluation(amount = 500, filter = { status: '1' }) {
        await User.model.query().where(filter).update({ target: Database.raw(`target + ?`, amount) })
        Event.emit(`event::devaluation`, {
            shift: this.shift,
            users: null,
            message: `Банк России объявил о девальвации Виртуона. Твоя «мечта» стала дороже на ${amount} V.`,
        })
    }

    changeEcoMode(mode, when = moment()) {
        this.shift.merge({
            eco_mode: mode,
            eco_mode_start: when,
        })

        return this.shift.save()
    }

    async crisis(when) {
        await this.changeEcoMode('crisis', when)
        Event.emit(`event::crisis`, {
            shift: this.shift,
            users: null,
            message: `Сегодня наступил финансовый кризис. Карманных денег сегодня не жди`,
        })
    }

    async stagnation(when) {
        await this.changeEcoMode('stagnation', when)
        Event.emit(`event::stagnation`, {
            shift: this.shift,
            users: null,
            message: `Стагнация экономики – твои карманные деньги перестали расти`,
        })
    }

    async sanctions(when) {
        await this.changeEcoMode('sanctions', when)
        Event.emit(`event::sanctions`, {
            shift: this.shift,
            users: null,
            message: `Внимание! Экономические санкции! Сегодня запрещены переводы с текущего счёта на «Вкусняшки» и «Мечту»`,
        })
    }

    async growth(when) {
        await this.changeEcoMode('growth', when)
        Event.emit(`event::sanctions`, {
            shift: this.shift,
            users: null,
            message: `Экономика в стране развивается. Это сказывается и на твоих доходах. Деньги на текущем счету растут с каждым днём.`,
        })
    }

    async eco_reset() {
        await this.changeEcoMode(null, null)
    }

    async trap(id) {
        const trap = await Trap.query().where({ name: 'Ловушка №' + id }).first();
        const usersIds = await User.model.ids();
        Event.emit('trap::issue', { trap, usersIds })
    }
}
