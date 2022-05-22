'use strict'

const { pickBy, orderBy } = require('lodash')

const Financial = use('App/Models/Financial')
const AccountType = use('App/Models/AccountType')
const FinancialTransformer = use('App/Transformers/FinancialTransformer')
const Helpers = use('Helpers')
const { validate, validateAll, sanitize } = use('Validator');
const moment = require('moment')

module.exports = class FinancialController {

    // Get Financials Settings
    async index({ transform, view, request }) {
        const financials = await Financial.query().orderBy('created_at')
            .fetch()
            .then(financials => transform
                .collection(financials, FinancialTransformer))

        const accType = await AccountType.query().orderBy('type_id').fetch().then(({ rows }) => rows);
        return view.render('admin.financials.index', { financials, accType })
    }

    // Update Financials Settings

    async edit({ params: { id }, request, response, view, transform, session }) {
        const method = request.method();
        if (method == "GET") {
            const accType = await AccountType.query().where({ id: id }).first();
            const financials = await Financial.query().where({ type_id: accType.type_id }).orderBy('created_at')
                .fetch()
                .then(financials => transform
                    .collection(financials, FinancialTransformer))
            return view.render('admin.financials.edit', { financials, accType })
        }
        if (method == "POST") {
            const rules = {
                acctype: 'required',
                accname: 'required'
            }
            const validation = await validateAll(request.all(), rules, request.VaildateMessage)
            if (validation.fails()) {
                session
                    .withErrors(validation.messages())
                    .flashExcept(['password'])
                return response.redirect('back')
            } else {
                const parameter = request.all();
                const accType = await AccountType.query().where({ id: parameter.id }).first();
                let accRules = {}
                let key = [];
                let value = [];
                if (accType.type_id == 5) {
                    accRules = {
                        loan_amount: 'required|number',
                        loan_period: 'required|number',
                        credit_rate: 'required|number'
                    }
                    key = ['loan_amount', 'loan_period', 'credit_rate'];
                    value = [parameter.loan_amount, parameter.loan_period, parameter.credit_rate];
                }
                if (accType.type_id == 6) {
                    accRules = {
                        deposit_period: 'required|number',
                        deposit_rate: 'required|number',
                        cap_deposit_period: 'required|number',
                        cap_deposit_rate: 'required|number'
                    }
                    key = ['deposit_period', 'deposit_rate', 'cap_deposit_period', 'cap_deposit_rate'];
                    value = [parameter.deposit_period, parameter.deposit_rate, parameter.cap_deposit_period, parameter.cap_deposit_rate];
                }
                if (accType.type_id == 7) {
                    accRules = {
                        wallet_transfer: 'required|number'
                    }
                    key = ['wallet_transfer'];
                    value = [parameter.wallet_transfer];
                }
                if (accType.type_id == 4) {
                    accRules = {
                        dream_transfer: 'required|number'
                    }
                    key = ['dream_transfer'];
                    value = [parameter.dream_transfer];
                }
                if (accType.type_id == 2) {
                    accRules = {
                        financial_safety_transfer: 'required|number',
                        cushion_number: 'required|number'
                    }
                    key = ['financial_safety_transfer', 'cushion_number'];
                    value = [parameter.financial_safety_transfer, parameter.cushion_number];
                }

                const accValidation = await validateAll(request.all(), accRules, request.VaildateMessage)
                if (accValidation.fails()) {
                    session
                        .withErrors(accValidation.messages())
                        .flashExcept(['password']);
                    console.log(accValidation.messages());
                    return response.redirect('back')
                } else {
                    try {
                        accType.name = parameter.acctype;
                        accType.description = parameter.description;
                        accType.value = parameter.accname;
                        accType.status = parameter.status;
                        // const picture = request.file('icon', { types: ['image'] });
                        // if (picture) {
                        //     let imgName = moment().format('h_mm_s_DD_MM_YYYY') + '_' + picture.clientName;
                        //     await picture.move(Helpers.tmpPath('../public/img'), {
                        //         name: imgName,
                        //         overwrite: true
                        //     })
                        //     accType.icon = imgName;
                        // }
                        accType.icon = parameter.icon;
                        await accType.save();

                        await key.forEach(async function (k, index) {
                            await Financial.query().where({ 'key': k }).update({ 'value': value[index] });
                        })
                        return response.redirect('/admin/financial')
                    } catch (err) {
                        console.log(err);
                    }
                }
            }
        }
    }
}