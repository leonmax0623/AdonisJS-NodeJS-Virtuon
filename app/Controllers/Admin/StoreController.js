'use strict'

const { all } = require('@adonisjs/lucid/src/Lucid/Model')
const { orderBy } = require('lodash')
const Badges = use('App/Models/Badges')
const Helpers = use('Helpers')
const TransactionTransformer = use('App/Transformers/TransactionTransformer')
const { validateAll } = use('Validator');
const moment = require('moment')
const Property = use('App/Models/Property');

module.exports = class StoreController {
    async badges({ transform, view }) {
        const badges = await Badges.query()
            .orderBy('created_at')
            .fetch()
            .then(({ rows }) => rows)
        return view.render('admin.badges.index', { badges })
    }

    async view({ params: { id }, view }) {
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

    async badgesAdd({ view, request, response, session }) {
        const method = request.method();
        if (method == "GET") {
            const actionUrl = "/admin/badges/add";
            return view.render('admin.badges.view', { actionUrl })
        }
        if (method == "POST") {
            const rules = {
                name: 'required',
                color: 'required',
                value: 'required',
            }
            const validation = await validateAll(request.all(), rules, request.VaildateMessage)
            if (validation.fails()) {
                session
                    .withErrors(validation.messages())
                    .flashExcept(['password'])
                return response.redirect('back')
            } else {
                const parameter = request.all();
                try {
                    const badges = new Badges();
                    badges.name = parameter.name;
                    badges.color = parameter.color;
                    badges.value = parameter.value;
                    badges.status = parameter.status;
                    badges.icon = parameter.icon;
                    // const picture = request.file('icon', { types: ['image'] });
                    // if (picture) {
                    //     let imgName = moment().format('h_mm_s_DD_MM_YYYY') + '_' + picture.clientName;
                    //     await picture.move(Helpers.tmpPath('../public/img'), {
                    //         name: imgName,
                    //         overwrite: true
                    //     })
                    //     badges.icon = imgName;
                    // }
                    await badges.save();
                    return response.redirect('/admin/badges');
                } catch (err) {
                    console.log(err);
                }
            }
        }
    }

    async badgesEdit({ params: { id }, view, request, response, session }) {
        const method = request.method();
        if (method == "GET") {
            const badges = await Badges.findOrFail(id)
            const actionUrl = "/admin/badges/edit/" + badges.id;
            return view.render('admin.badges.view', { badges, actionUrl })
        }
        if (method == "POST") {
            const rules = {
                name: 'required',
                color: 'required',
                value: 'required'
            }
            const validation = await validateAll(request.all(), rules, request.VaildateMessage)
            if (validation.fails()) {
                session.withErrors(validation.messages()).flashExcept()
                return response.redirect('back')
            } else {
                try {
                    const parameter = request.all();
                    const badges = await Badges.findOrFail(id);
                    badges.name = parameter.name;
                    badges.color = parameter.color;
                    badges.value = parameter.value;
                    badges.status = parameter.status;
                    badges.icon = parameter.icon;
                    // const picture = request.file('icon', { types: ['image'] });
                    // if (picture) {
                    //     let imgName = moment().format('h_mm_s_DD_MM_YYYY') + '_' + picture.clientName;
                    //     await picture.move(Helpers.tmpPath('../public/img'), {
                    //         name: imgName,
                    //         overwrite: true
                    //     })
                    //     badges.icon = imgName;
                    // }
                    await badges.save();
                    return response.redirect('/admin/badges');
                } catch (err) {
                    console.log(err);
                }
            }
        }
    }

    async badgesDelete({ params: { id }, request, response }) {
        await Badges.findOrFail(id).then(row => row.delete())
        response.redirect(request.header('referer'))
    }

    async property({ view }) {
        try {
            const properties = await Property.query()
                .orderBy('created_at')
                .fetch()
                .then(({ rows }) => rows)
            return view.render('admin.property.index', { properties })
        } catch (err) {
            console.log(err);
        }
    }

    async propertyAdd({ view, request, response, session }) {
        const method = request.method();
        if (method == "GET") {
            const actionUrl = "/admin/property/add";
            return view.render('admin.property.view', { actionUrl })
        }
        if (method == "POST") {
            const rules = {
                name: 'required',
                value: 'required',
                color: 'required',
                per_day_value: 'required',
            }
            const validation = await validateAll(request.all(), rules, request.VaildateMessage)
            if (validation.fails()) {
                session
                    .withErrors(validation.messages())
                    .flashExcept(['password'])
                return response.redirect('back')
            } else {
                const parameter = request.all();
                try {
                    const property = new Property();
                    property.name = parameter.name;
                    property.value = parameter.value;
                    property.color = parameter.color;
                    property.per_day_value = parameter.per_day_value;
                    property.status = parameter.status;
                    // const picture = request.file('icon', { types: ['image'] });
                    // if (picture) {
                    //     let imgName = moment().format('h_mm_s_DD_MM_YYYY') + '_' + picture.clientName;
                    //     await picture.move(Helpers.tmpPath('../public/img'), {
                    //         name: imgName,
                    //         overwrite: true
                    //     })
                    //     property.icon = imgName;
                    // }
                    property.icon = parameter.icon;
                    await property.save();
                    return response.redirect('/admin/property');
                } catch (err) {
                    console.log(err);
                }
            }
        }
    }

    async propertyEdit({ params: { id }, view, request, response, session }) {
        const method = request.method();
        if (method == "GET") {
            const property = await Property.findOrFail(id)
            const actionUrl = "/admin/property/edit/" + property.id;
            return view.render('admin.property.view', { property, actionUrl })
        }
        if (method == "POST") {
            const rules = {
                name: 'required',
                value: 'required',
                color: 'required',
                per_day_value: 'required',
            }
            const validation = await validateAll(request.all(), rules, request.VaildateMessage)
            if (validation.fails()) {
                session
                    .withErrors(validation.messages())
                    .flashExcept(['password'])
                return response.redirect('back')
            } else {
                try {
                    const parameter = request.all();
                    const property = await Property.findOrFail(id);
                    property.name = parameter.name;
                    property.value = parameter.value;
                    property.color = parameter.color;
                    property.per_day_value = parameter.per_day_value;
                    property.status = parameter.status;
                    // const picture = request.file('icon', { types: ['image'] });
                    // if (picture) {
                    //     let imgName = moment().format('h_mm_s_DD_MM_YYYY') + '_' + picture.clientName;
                    //     await picture.move(Helpers.tmpPath('../public/img'), {
                    //         name: imgName,
                    //         overwrite: true
                    //     })
                    //     property.icon = imgName;
                    // }
                    property.icon = parameter.icon;
                    await property.save();
                    return response.redirect('/admin/property');
                } catch (err) {
                    console.log(err);
                }
            }
        }
    }

    async propertyDelete({ params: { id }, request, response }) {
        await Property.findOrFail(id).then(row => row.delete())
        response.redirect(request.header('referer'))
    }

}
