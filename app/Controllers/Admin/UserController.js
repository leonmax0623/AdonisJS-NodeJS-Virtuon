'use strict'

const { pickBy, orderBy } = require('lodash')
const User = use('App/Repo/User')
const Account = use('App/Models/Account')
const Dream = use('App/Models/Dream')
const DreamUsers = use('App/Models/DreamUsers')
const AccountType = use('App/Models/AccountType')

const UserTransformer = use('App/Transformers/UserTransformer')
const TransactionTransformer = use('App/Transformers/TransactionTransformer')
const DreamTransformer = use('App/Transformers/DreamTransformer')
const { validate, validateAll, sanitize } = use('Validator');

const getTransactions = (transform, accounts = []) => {
    const promises = []

    accounts.forEach(account => {
        const promise = account.transactions()
            .fetch()
            .then(({ rows }) => rows)

        promises.push(promise)
    })

    return Promise.all(promises)
        .then(transactions => orderBy(transactions, 'created_at'))
        .then(transactions => transform.include('id')
            .collection(transactions, TransactionTransformer))
}

module.exports = class UserController {
    async index({ transform, view }) {
        const users = await User.model.query().where({'is_admin' : false})
            .orderBy('created_at')
            .fetch()
            .then(users => transform
                .include('id,total_balance')
                .collection(users, UserTransformer))
        return view.render('admin.users.index', { users })
    }

    async view({ params: { id }, transform, view }) {
        const user = await User.model.findOrFail(id)
        const accounts = await user.accounts()
            .fetch()
            .then(({ rows }) => orderBy(rows, ['created_at', 'label']))
            .then(accounts => {
                const promises = []

                accounts.forEach(account => {
                    const promise = account.balance()
                        .then(balance => Object.defineProperty(account, 'balance', { value: balance }))

                    promises.push(promise)
                })

                return Promise.all(promises)
                    .then(() => accounts)
            })

        return view.render('admin.users.view', { user, accounts })
    }

    async edit({ params: { id }, transform, view, request, response }) {
        const method = request.method();
        if (method == "GET") {
            const user = await User.model.findOrFail(id)
            const accType = await AccountType.query().fetch().then(({ rows }) => rows);
            const accounts = await user.accounts()
                .fetch()
                .then(({ rows }) => orderBy(rows, ['created_at', 'label']))
                .then(accounts => {
                    const promises = []

                    accounts.forEach(account => {
                        const promise = account.balance()
                            .then(balance => Object.defineProperty(account, 'balance', { value: balance }))

                        promises.push(promise)
                    })

                    return Promise.all(promises)
                        .then(() => accounts)
                })
            const transactions = await user.accounts()
                .fetch()
                .then(({ rows }) => orderBy(rows, ['created_at', 'label']))
                .then(async function (accounts) {
                    const trpromises = [];
                    await accounts.forEach(async function (account) {
                        const promise = account.transactions().fetch()
                            .then(({ rows }) => orderBy(rows, ['created_at']))
                            .then(transactions => Object.defineProperty(account, 'transactions', { value: transactions }))
                        trpromises.push(promise)
                    })
                    return Promise.all(trpromises)
                        .then(() => accounts)
                })
            const dreams = await Dream.query()
                .fetch()
                .then(dreams => transform
                    .collection(dreams, DreamTransformer))
            const userdreams = await DreamUsers.query().where({ 'user_id': id }).first()
            return view.render('admin.users.view', { user, accounts, accType, transactions, dreams, userdreams })
        }
        if (method == "POST") {
            const user = await User.model.findOrFail(id)
            const attributes = pickBy(request.only([
                'password',
                'email',
                'username'
            ]), v => (!['null', '', 'undefined', undefined].includes(v)))
            user.merge(attributes)
            await user.save()
            response.redirect('/admin/users')
        }
    }

    async revoke({ params: { id }, request, response }) {
        await User.model.findOrFail(id)
            .then(user => {
                return user.shifts()
                    .detach([request.input('shift_id')])
            })

        response.redirect(request.header('referer'))
    }

    async toggle({ params: { id }, request, response }) {
        await User.model.findOrFail(id)
            .then(user => {
                user.status = (user.status === '0')
                    ? '1'
                    : '0'

                return user.save()
            })

        response.redirect(request.header('referer'))
    }

    async delete({ params: { id }, request, response }) {
        await User.model.findOrFail(id)
            .then(user => user.delete())

        response.redirect(request.header('referer'))
    }

    // Add New Account
    async addAccount({ params: { id }, request, response, view, session }) {
        const method = request.method();
        if (method == 'POST') {
            const rules = {
                accname: 'required',
                acctype: 'required'
            }
            const parameter = request.only(['accname', 'acctype']);
            const validation = await validateAll(request.all(), rules, request.VaildateMessage)
            if (validation.fails()) {
                session
                    .withErrors(validation.messages())
                    .flashExcept(['password'])

                return response.redirect('back')
            } else {
                const account = await Account.query().where({ user_id: id, type: parameter.acctype }).first();
                if (account) {
                    return response.redirect('back')
                } else {
                    const account = new Account();
                    account.user_id = id;
                    account.label = parameter.accname;
                    account.type = parameter.acctype;
                    await account.save()
                    response.redirect(request.header('referer'))
                }
            }
        }
    }

    // Add Dream
    async addDream({ params: { id }, request, response, view, session }) {
        const method = request.method();
        if (method == 'POST') {
            const dream = await Dream.findOrFail(request.input('dream_id'))
            if (dream) {
                await DreamUsers.query().where({ 'user_id': id }).update({ dream_id: request.input('dream_id'), dreamName: dream.name, dreamCost: request.input('cost') })
            }
            return response.redirect('back')
        }
    }
}
