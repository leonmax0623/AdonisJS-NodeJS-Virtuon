'use strict'

const { pickBy, orderBy } = require('lodash');
const Financial = use('App/Models/Financial');
const Transaction = use('App/Models/Transaction');
const { raw } = use('Database')
const __ = use('App/Helpers/string-localize');
const Account = use('App/Models/Account')
const User = use('App/Models/User')
const UserCredits = use('App/Models/UserCredits')
const UserCreditTransaction = use('App/Models/UserCreditTransaction')
const UserRepo = use('App/Repo/User')
const { validate } = use('Validator');
const AccountTransformer = use('App/Transformers/AccountTransformer')
const AccountTypeTransformer = use('App/Transformers/AccountTypeTransformer')
const AccountTypeDetailsTransformer = use('App/Transformers/AccountTypeDetailsTransformer')
const AccountType = use('App/Models/AccountType')
const TransactionTransformer = use('App/Transformers/TransactionTransformer')
const Env = use('Env')
const UserDeposites = use('App/Models/UserDeposites');

module.exports = class AccountController {

    async type({ auth, response, request, antl, transform }) {
        try {
            let data = {};
            const userInfo = await auth.getUser();
            if (userInfo.id) {
                const user = await User.findOrFail(userInfo.id)
                if (user) {
                    const accType = await AccountType.query().where({ is_default: 0, status: 1 }).fetch().then(({ rows }) => orderBy(rows, ['type_id']))
                        .then(accounttypes => {
                            const atpromises = []
                            accounttypes.forEach(aType => {
                                const atpromise = aType.financials().fetch()
                                    .then(({ rows }) => orderBy(rows, ['created_at']))
                                    .then(financials => Object.defineProperty(aType, 'financials', { value: financials }))
                                atpromises.push(atpromise)
                            })
                            return Promise.all(atpromises)
                                .then(accounttypes => transform.include('id')
                                    .collection(accounttypes, AccountTypeTransformer))
                        });
                    const userCreditExist = await UserRepo.userCreditExist(userInfo.id, transform);
                    if (userCreditExist) {
                        const availableCredit = await UserRepo.availableCredit(userInfo.id, transform);
                        data.available_credit = availableCredit.availableCredit;
                    } else {
                        data.available_credit = 0;
                    }
                    data.account_types = accType;
                    response.ok(null, data);
                }
            }
        } catch (err) {
            console.log(err)
        }

    }

    async accType({ auth, response, request, antl, transform }) {
        try {
            let data = {};
            const userInfo = await auth.getUser();
            if (userInfo.id) {
                const user = await User.findOrFail(userInfo.id)
                if (user) {
                    const availableCreditData = await UserRepo.availableCredit(userInfo.id, transform);
                    const accType = await AccountType.query().where({ is_default: 0, status: 1 }).fetch().then(({ rows }) => orderBy(rows, ['type_id']))
                        .then(function (accounttypes) {
                            const atpromises = []
                            accounttypes.forEach(aType => {
                                const Account = aType;
                                const atpromise = aType.financials().fetch()
                                    .then(({ rows }) => orderBy(rows, ['created_at']))
                                    .then(financials => {
                                        if (Account.name == 'deposit') {
                                            Account.with_capital = { 'first_value': 0, 'second_value': 0 };
                                            Account.without_capital = { 'first_value': 0, 'second_value': 0 };
                                            financials.forEach(finance => {
                                                Account.with_capital.first_value = finance.key == 'deposit_period' ? Number(finance.value) : Account.with_capital.first_value;
                                                Account.with_capital.second_value = finance.key == 'deposit_rate' ? Number(finance.value) : Account.with_capital.second_value;
                                                Account.without_capital.first_value = finance.key == 'cap_deposit_period' ? Number(finance.value) : Account.without_capital.first_value;
                                                Account.without_capital.second_value = finance.key == 'cap_deposit_rate' ? Number(finance.value) : Account.without_capital.second_value;
                                            })
                                        }
                                    }).then(financials => Object.defineProperty(aType, 'financials', { value: financials }))
                                atpromises.push(atpromise)
                                if (aType.name == 'credit') {
                                    aType.first_value = availableCreditData.availableCredit;
                                    aType.second_value = availableCreditData.totalEmi;
                                    aType.third_value = availableCreditData.remainingDays;
                                }
                            })
                            return Promise.all(atpromises)
                                .then(accounttypes => transform.include('id')
                                    .collection(accounttypes, AccountTypeDetailsTransformer))
                        });
                    data.account_types = accType;
                    response.ok(null, data);
                }
            } else {
                response.badRequest(__('User not found', antl), null);
            }
        } catch (err) {
            console.log(err)
        }

    }

    // Add New Account
    async index({ auth, response, request, antl, transform }) {
        const method = request.method();
        if (method == 'GET') {
            const userInfo = await auth.getUser();
            if (userInfo.id) {
                const user = await User.findOrFail(userInfo.id)
                if (user) {
                    try {
                        const accounts = await Account.query().where({'user_id' : user.id}).with('accountType')
                            .fetch()
                            .then(({ rows }) => orderBy(rows, ['created_at', 'label']))
                            .then(async function (accounts) {
                                const promises = []
                                for (const account of accounts) {
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
                        // console.log(accounts);
                        response.ok(null, accounts);
                    }
                    catch (err) {
                        console.log(err);
                    }
                }
                else {
                    response.badRequest(__('User not found', antl), null);
                }
            } else {
                response.badRequest(__('User not found', antl), null);
            }
        }

        if (method == 'POST') {
            try {
                const userInfo = await auth.getUser();
                if (userInfo.id) {
                    const rules = {
                        name: 'required',
                        type: 'required'
                    }
                    const parameter = request.only(['name', 'type']);
                    const validation = await validate(request.all(), rules, request.VaildateMessage)
                    if (validation.fails()) {
                        response.badRequest(__('Validation Error', antl), validation.messages());
                    } else {
                        const account = await Account.query().where({ user_id: userInfo.id, type: parameter.type }).first();
                        if (account && parameter.type != 'credit' && parameter.type != 'deposit') {
                            response.badRequest(__('Account is already exist', antl), null);
                        } else {
                            if (parameter.type == 'credit') {
                                const userCreditExist = await UserRepo.userCreditExist(userInfo.id);
                                if (userCreditExist) {
                                    const availableCredit = await UserRepo.createCreditAccount(userInfo.id, transform, parameter);
                                    if (availableCredit) {
                                        response.ok(null, availableCredit);
                                    } else {
                                        response.badRequest(__('No credit limit', antl), null);
                                    }
                                } else {
                                    response.badRequest(__('No credit limit', antl), null);
                                }
                            } else if (parameter.type == 'deposit') {
                                const parameter = request.only(['name', 'type', 'amount', 'deposit_type']);
                                const validation = await validate(request.all(), rules, request.VaildateMessage)
                                if (validation.fails()) {
                                    response.badRequest(__('Validation Error', antl), validation.messages());
                                } else {
                                    const depositeAccount = await UserRepo.createDepositeAccount(userInfo.id, transform, parameter);
                                    if (depositeAccount.status) {
                                        response.ok(__(depositeAccount.message, antl), depositeAccount.data);
                                    } else {
                                        response.ok(__(depositeAccount.message, antl), null);
                                    }
                                }
                            } else {
                                const newAccount = new Account();
                                newAccount.user_id = userInfo.id;
                                newAccount.label = parameter.name;
                                newAccount.type = parameter.type;
                                await newAccount.save();
                                if (newAccount.id) {
                                    response.ok(__('Account create successfully', antl), null);
                                    //await UserRepo.charge(userInfo.id, parameter.type, availableCredit);
                                } else {
                                    response.badRequest(__('Not able to create account. Please try again', antl), null);
                                }
                            }
                        }
                    }
                } else {
                    response.badRequest(__('Invalid User', antl), null);
                }
            } catch (error) {
                Logger.error(error.message, error)
                response.badRequest(__('Invalid User', antl), null);
            }
        }

    }


    async transaction({ params: { account_id }, response, transform }) {
        try {
            const transaction = await Transaction.query().where({ account_id: account_id }).fetch()
                .then(transactions => transform.include('id')
                    .collection(transactions, TransactionTransformer))
            response.ok(null, transaction);
        } catch (error) {
            Logger.error(error.message, error)
            response.badRequest(__('No Transaction Found', antl), null);
        }
    }
}