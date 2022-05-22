'use strict'

const { pickBy, orderBy } = require('lodash')

const Dream = use('App/Models/Dream')
const DreamTransformer = use('App/Transformers/DreamTransformer')
const TransactionTransformer = use('App/Transformers/TransactionTransformer')
const { validate } = use('Validator');
const __ = use('App/Helpers/string-localize');


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
        .then(transactions => transform
            .include('id')
            .collection(transactions, TransactionTransformer))
}

module.exports = class DreamController {

    async index({ transform, view }) {
        const dreams = await Dream.query()
            .orderBy('created_at')
            .fetch()
            .then(dreams => transform
                .include('id,total_balance')
                .collection(dreams, DreamTransformer))
        return view.render('admin.dreams.index', { dreams })
    }

    async add({ transform, view }) {
        return view.render('admin.dreams.view')
    }

    async edit({ params: { id }, transform, view }) {
        const dream = await Dream.findOrFail(id)
        return view.render('admin.dreams.view', { dream })
    }

    async store({ request, response, antl }) {
        const rules = {
            name: 'required',
            value: 'required|number'
        }
        const parameter = request.only(['name', 'value', 'id']);
        if (parameter.id) {
            let id = parameter.id;
            const dream = await Dream.findOrFail(id)
            const attributes = pickBy(request.only([
                'name',
                'value',
            ]), v => (!['null', '', 'undefined', undefined].includes(v)))
            dream.merge(attributes);
            await dream.save()
            return response.redirect('/admin/dreams')
        } else {

            // const validation = await validate(request.all(), rules, request.VaildateMessage)
            // if (validation.fails()) {
            //     return
            //     response.badRequest(__('Validation Error', antl), validation.messages());
            // } else {
            const dream = new Dream();
            dream.name = parameter.name;
            dream.value = parameter.value;
            dream.status = '1';
            await dream.save()
            return response.redirect('/admin/dreams')
            // }
        }

    }


    /*
    async revoke({ params: { id }, request, response }) {
        await Dream.model.findOrFail(id)
            .then(user => {
                return user.shifts()
                    .detach([request.input('shift_id')])
            })
    
        response.redirect(request.header('referer'))
    }
    */

    /*
    async toggle({ params: { id }, request, response }) {
        await Dream.model.findOrFail(id)
            .then(user => {
                user.status = (user.status === 'inactive')
                    ? 'active'
                    : 'inactive'
    
                return user.save()
            })
        response.redirect(request.header('referer'))
    }
    */

    async delete({ params: { id }, request, response }) {
        await Dream.findOrFail(id).then(dream => dream.delete())
        response.redirect(request.header('referer'))
    }
}
