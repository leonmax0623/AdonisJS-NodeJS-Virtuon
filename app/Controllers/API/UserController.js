'use strict'

const { pickBy, orderBy } = require('lodash')
const { raw } = use('Database')
const Hash = use('Hash')
const Logger = use('Logger')
const User = use('App/Models/User')
const UserRepo = use('App/Repo/User')
const Dream = use('App/Models/Dream')
const Account = use('App/Models/Account')
const Transaction = use('App/Models/Transaction')
const UserTransformer = use('App/Transformers/UserTransformer')
const TransactionTransformer = use('App/Transformers/TransactionTransformer')
const AccountTransformer = use('App/Transformers/AccountTransformer')
const ForbiddenException = use('App/Exceptions/ForbiddenException')
const { validate } = use('Validator');
const __ = use('App/Helpers/string-localize');
const Env = use('Env')
const ShiftHelper = use('App/Helpers/ShiftHelper')
const moment = require('moment')
const _ = require('lodash')

module.exports = class UserController {

    async signUp({ request, response, auth, antl }) {
        try {
            const rules = {
                username: 'required|unique:users,username',
                email: 'required|email|unique:users,email',
                password: 'required',
                dreamName: 'required_without_any:dream_id',
                dreamCost: 'required_if:dreamName',
            }
            const parameter = request.only(['username', 'email', 'password', 'dreamName', 'dream_id', 'dreamCost']);
            const validation = await validate(request.all(), rules, request.VaildateMessage)

            if (validation.fails()) {
                response.badRequest(__('Validation Error', antl), validation.messages());
            } else {
                try {
                    if (parameter.dream_id) {
                        const dream = await Dream.findOrFail(parameter.dream_id);
                        parameter.dreamName = dream.name;
                        parameter.dreamCost = dream.value;
                    }
                    const newUser = new User();
                    newUser.email = parameter.email;
                    newUser.username = parameter.username;
                    newUser.password = parameter.password;
                    newUser.target = parameter.dreamCost;
                    newUser.goal = parameter.dreamName;
                    newUser.status = '1';
                    await newUser.save();
                    const account = new Account();
                    account.user_id = newUser.id
                    account.label = parameter.dreamName
                    account.type = 'dream';
                    await account.save();
                    response.ok(null, await auth.generate(newUser));

                } catch (error) {
                    Logger.error(error.message, error)
                    response.badRequest(__('Issue while signup please try again', antl), null);
                }
            }
        } catch (error) {
            Logger.error(error.message, error)
            response.badRequest(__('Invalid login credentials', antl), null);
        }
    }

    async userNotificationInfo({ request, response, auth, antl }){
        try {
            const userInfo = await auth.getUser();
            if (userInfo) {
                var day = moment(moment()).diff(userInfo.created_at, 'days') + 1;
                if (day > 21) {
                    day = Math.trunc(Math.abs(day / 21))
                }
                const shiftDay = 21 - day;
                const event_type = request.input('event_type')
                const helper = new ShiftHelper({});
                var message = [];
                switch (event_type) {
                    case 'scenario_video':
                        message = await helper.sentVideoMessage(shiftDay, userInfo.id, 'json');
                        break;
                    case 'scenario_assignment':
                        message = await helper.sentAssignements(shiftDay, userInfo.id, 'json');
                        break;
                    case 'scenario_mail':
                        message = await helper.sentMailingMessage(shiftDay, userInfo.id, 'json');
                        break;
                    case 'trap':
                        message = await helper.sentTrapMessage(shiftDay, userInfo.id, 'json');
                        break;
                }
                response.ok(null, message);
            }
            else {
                response.badRequest(__('Invalid User', antl), null);
            }
        } catch (err) {
            response.badRequest(__(null, antl), null);
        }
    }
    
    async newUserScenario({ request, response, auth, antl }) {
        try {
            const userInfo = await auth.getUser();
            if (userInfo) {
                var day = moment(moment()).diff(userInfo.created_at, 'days') + 1;
                if (day == 1) {
                    const helper = new ShiftHelper({});
                    const ms = Env.get('CRON_SLEEP_TIME');
                    await helper.addTransaction(1, userInfo.id);
                    await helper.sleep(ms);
                    await helper.sentVideoMessage(1, userInfo.id);
                    await helper.sleep(ms);
                    await helper.sentMailingMessage(1, userInfo.id);
                    await helper.sleep(ms);
                    await helper.sentTrapMessage(1, userInfo.id);
                    await helper.sleep(ms);
                    await helper.sentAssignements(1, userInfo.id);
                }
            }
            response.ok(null, null);
        } catch (error) {
            Logger.error(error.message, error)
            response.badRequest(__('Something went wrong. Please try again. ', antl), null);
        }
    }
    async signIn({ request, response, auth, antl }) {

        try {
            const rules = {
                email: 'required',
                password: 'required',
            }
            const parameter = request.only(['email', 'password']);
            const validation = await validate(request.all(), rules, request.VaildateMessage)
            if (validation.fails()) {
                response.badRequest(__('Validation Error', antl), validation.messages());
            } else {
                const { email, password } = request.all();
                const usersDetails = await User.query().where({ 'email': email, 'status': '1' }).orWhere({ 'username': email, 'status': '1' }).first();
                if (usersDetails && usersDetails.id) {
                    const isMatchedPassword = await Hash.verify(password, usersDetails.password)
                    if (isMatchedPassword) {
                        const dataRespnse = await auth.attempt(usersDetails.email, password);
                        if (dataRespnse.token != null) {
                            //await User.model.query().where({ id: user.id }).update({ last_login: raw('now()') });
                            response.ok(null, await auth.attempt(usersDetails.email, password));
                        } else {
                            response.badRequest(__('Error on login, please retry', antl), null);
                        }
                    } else {
                        response.badRequest(__('Invalid login credentials', antl), null);
                    }
                } else {
                    response.badRequest(__("This email don't exist in our system", antl), null);
                }
            }
        } catch (error) {
            Logger.error(error.message, error)
            response.badRequest(__('Invalid login credentials', antl), null);
        }
    }

    info({ auth, transform }) {
        return transform
            .include('accounts,current_shift,progress,tokens')
            .item(auth.user, UserTransformer)
    }

    async transactions({ auth, request, transform }) {
        const transactions = await auth.user.transactions()
            .where(builder => {
                const account = request.input('account')
                if (account) {
                    builder.where({ account })
                }
            })
            .orderBy('created_at', 'desc')
            .paginate(request.input('page', 1), request.input('limit', 50))

        return await transform.paginate(transactions, TransactionTransformer)
    }

    async dreams({ response }) {
        const dreams = await Dream.query().fetch().then(({ rows }) => rows);
        response.ok(null, dreams);
    }

    async rating({ auth, request, response, antl }) {
        try {
            const userInfo = await auth.getUser();
            if (userInfo) {
                var day = moment(moment()).diff(userInfo.created_at, 'days') + 1;
                if (day > 21) {
                    day = Math.trunc(Math.abs(day / 21))
                }
                const shiftDay = 21 - day;
                const users = await User.query().fetch()
                    .then(result => result.rows
                        .map(async user => ({
                            username: user.username,
                            score: await UserRepo.calcScore(user),
                            badge: await UserRepo.userPurchase(user, 'badge'),
                            property: await UserRepo.userPurchase(user, 'property'),
                            created_at: user.created_at,
                        })))
                    .then(promises => Promise.all(promises))
                    .then(users => _.orderBy(users, 'score', 'desc'))
                    .then(async function (users) {
                        const topUsers = [];
                        await users.forEach(async function (user) {
                            var userday = moment(moment()).diff(user.created_at, 'days') + 1;
                            if (userday > 21) {
                                userday = Math.trunc(Math.abs(userday / 21))
                            }
                            if (userday <= shiftDay) {
                                topUsers.push(user);
                            }
                        });
                        return await Promise.all(topUsers).then(users)
                    });
                const res = _.take(users, request.input('limit', 10));
                response.ok(null, res);
            } else {
                response.badRequest(__('Invalid User', antl), null);
            }
        } catch (err) {
            console.log(err);
            response.badRequest(__(null, antl), null);
        }
    }

    async userProfile({ auth, transform, response, antl }) {
        try {
            const userInfo = await auth.getUser();
            if (userInfo.id) {
                let newData = '';
                const user = await User.findOrFail(userInfo.id)
                if (user) {
                    const transactions = await user.accounts()
                        .fetch()
                        .then(({ rows }) => orderBy(rows, ['created_at', 'label']))
                        .then(async function (accounts) {
                            const trpromises = [];
                            await accounts.forEach(async function (account) {
                                account.accountType().fetch()
                                    .then(async accountType => {
                                        if (accountType.is_default == 1) {
                                            account.label = accountType.value;
                                        }
                                    });
                                const promise = account.transactions().fetch()
                                    .then(transactions => Object.defineProperty(account, 'transactions', { value: transactions }))
                                trpromises.push(promise)
                            })
                            return Promise.all(trpromises).then(accounts => transform.include('id')
                                .collection(accounts, AccountTransformer))
                        })

                    const accounts = await Account.query().where({ 'user_id': user.id }).with('accountType')
                        .fetch()
                        .then(({ rows }) => orderBy(rows, ['created_at', 'label']))
                        .then(async function (accounts) {
                            const promises = []
                            for (const account of accounts) {
                                account.accountType().fetch()
                                    .then(async accountType => {
                                        if (accountType.is_default == 1) {
                                            account.label = accountType.value;
                                        }
                                    });
                                account.balance = await account.transactions().sum('amount as total').then(r => Number(r[0].total));
                                if(account.type == 'deposit') {
                                    const withCapitalizationRunningFalg = await account.capitalizationRunning(user.id, 1) ? true : false;
                                    const withoutCapitalizationRunningFalg = await account.capitalizationRunning(user.id, 2) ? true : false;
                                    account.capitalizationRunning = {
                                        'with': withCapitalizationRunningFalg,
                                        'without':withoutCapitalizationRunningFalg }
                                    
                                }
                                promises.push(account);
                            }
                            return await Promise.all(promises).then(accounts)
                        });

                    const purchase = await user.orders()
                        .fetch()
                        .then(({ rows }) => orderBy(rows, ['created_at']))
                        .then(orders => {
                            const promises = []
                            orders.forEach(order => {
                                if (order.badge_id) {
                                    const promise = order.badges().fetch()
                                        .then(rows => {
                                            const promisesone = [];
                                            if (rows['icon']) {
                                                rows['icon'] = rows['icon'];
                                            }
                                            return Promise.all(promisesone).then(() => rows);
                                        })
                                    promises.push(promise)
                                }
                            })
                            return Promise.all(promises).then(orders)
                        });

                    const property = await user.orders()
                        .fetch()
                        .then(({ rows }) => orderBy(rows, ['created_at']))
                        .then(orders => {
                            const promises = []
                            orders.forEach(order => {
                                if (order.property_id) {
                                    const promise = order.property().fetch()
                                        .then(rows => {
                                            const promisesone = [];
                                            if (rows['icon']) {
                                                rows['icon'] = rows['icon'];
                                            }
                                            return Promise.all(promisesone).then(() => rows);
                                        })
                                    promises.push(promise)
                                }
                            })
                            return Promise.all(promises).then(orders)
                        });

                    let myPurchase = {}
                    myPurchase.badge = purchase;
                    myPurchase.property = property;
                    user.my_badges = myPurchase;
                    user.accounts_transactions = transactions;
                    user.accounts = accounts;
                    response.ok(null, user);
                }
                else {
                    response.badRequest(__('User not found', antl), null);
                }
            } else {
                response.badRequest(__('User not found', antl), null);
            }
        } catch (error) {
            Logger.error(error.message, error)
            response.badRequest(__('Invalid User', antl), null);
        }
    }

    async testTransaction({ auth, request, response, antl }) {
        try {
            const rules = {
                day: 'required',
            }
            const parameter = request.only(['day']);
            const validation = await validate(request.all(), rules, request.VaildateMessage)

            if (validation.fails()) {
                response.badRequest(__('Validation Error', antl), validation.messages());
            } else {
                const userInfo = await auth.getUser();
                if (userInfo.id) {
                    const helper = new ShiftHelper({});
                    helper.newScenarioTest(parameter.day, userInfo.id);
                    response.ok(null, 'done');
                } else {
                    response.badRequest(__('User not found', antl), null);
                }
            }
        } catch (error) {
            Logger.error(error.message, error)
            response.badRequest(__('Invalid login credentials', antl), null);
        }

    }
}