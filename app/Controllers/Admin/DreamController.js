'use strict'

const { pickBy, orderBy } = require('lodash')

const Dream = use('App/Models/Dream')
const DreamTransformer = use('App/Transformers/DreamTransformer')
const __ = use('App/Helpers/string-localize');
const { validate, validateAll, sanitize } = use('Validator');

module.exports = class DreamController {

    // Dream Listing
    async index({ transform, view }) {
        const dreams = await Dream.query()
            .fetch()
            .then(dreams => transform
                .collection(dreams, DreamTransformer))

        return view.render('admin.dreams.index', { dreams })
    }

    // Add New Dream
    async add({ request, response, view, session }) {
        const method = request.method();
        if (method == 'GET') {
            const actionUrl = "{{ route('admin.dream.add') }}";
            return view.render('admin.dreams.view', actionUrl)
        }
        if (method == 'POST') {
            const rules = {
                name: 'required',
                value: 'required|number'
            }
            const parameter = request.only(['name', 'value']);
            const validation = await validateAll(request.all(), rules, request.VaildateMessage)
            if (validation.fails()) {
                session
                    .withErrors(validation.messages())
                    .flashExcept(['password'])

                return response.redirect('back')
            } else {
                const dream = new Dream();
                dream.name = parameter.name;
                dream.value = parameter.value;
                dream.status = '1';
                await dream.save()
                return response.redirect('/admin/dreams')
            }
        }
    }

    // Edit Dream
    async edit({ params: { id }, view, request, response, session }) {
        const method = request.method();
        try {
            if (method == 'GET') {
                const dream = await Dream.findOrFail(id)
                const actionUrl = "{{ route('admin.dreams.edit')}}";
                return view.render('admin.dreams.view', { dream, actionUrl })
            }
            if (method == 'POST') {
                const dream = await Dream.findOrFail(request.only(['id']).id)
                const rules = {
                    name: 'required',
                    value: 'required|number'
                }
                const parameter = request.only(['name', 'value']);
                const validation = await validateAll(request.all(), rules, request.VaildateMessage)
                if (validation.fails()) {
                    session
                        .withErrors(validation.messages())
                        .flashExcept(['password'])

                    return response.redirect('back')
                } else {
                    const attributes = pickBy(parameter, v => (!['null', '', 'undefined', undefined].includes(v)))
                    dream.merge(attributes);
                    await dream.save()
                    return response.redirect('/admin/dreams')
                }
            }
        } catch (error) {
            return response.redirect('/admin/dreams')
        }

    }

    // Store Dream
    async delete({ params: { id }, request, response }) {
        await Dream.findOrFail(id).then(dream => dream.delete())
        response.redirect(request.header('referer'))
    }
}
