'use strict'

const Transaction = use("App/Models/Transaction")
const Account = use("App/Models/Account")
const Financial = use("App/Models/Financial")
const Shift = use("App/Models/Shift")
const UserCredits = use('App/Models/UserCredits')
const UserDeposites = use('App/Models/UserDeposites')
const UserCreditTransaction = use('App/Models/UserCreditTransaction')
const UserDepositTransaction = use('App/Models/UserDepositTransaction')
const Database = use('Database')
const ForbiddenException = use('App/Exceptions/ForbiddenException')
const { TYPE } = use('App/Models/Account')
const AccountTransformer = use('App/Transformers/AccountTransformer')
const AccountCreditTransformer = use('App/Transformers/AccountCreditTransformer')
const BumblebeeTransformer = use('Bumblebee/Transformer')
const moment = use('moment')
const Logger = use('Logger')
const ScenarioAccount = use('App/Models/ScenarioAccount')

const UserOrders = use('App/Models/UserOrders')

const { pickBy, orderBy } = require('lodash');


const correctRatio = value => {
    switch (true) {
        case (value <= 0.25):
            value *= 1.5
            break

        case (value <= 0.5):
            value *= 1.4
            break

        case (value <= 0.75):
            value *= 1.3
            break

        case (value <= 0.9):
            value *= 1.2
            break

        case (value <= 0.95):
            value *= 1.1
            break
    }

    return value || 0
}

module.exports = class User {
    static get model() {
        return use('App/Models/User')
    }

    static async userDay(userId) {
        const user = await this.model.findOrFail(userId)
        var day = moment(moment()).diff(user.created_at, 'days') + 1;
        if (day > 21) {
            const userDay = Math.trunc(Math.abs(day / 21))
            day = userDay;
        }
        let data = { day: day, new_user: true }
        return data;
    }

    static async storeIncDecsValue(day, userId) {
        const accountScenario = await ScenarioAccount.query().where({ 'day': day }).fetch();
        const accountScenarioJson = accountScenario.toJSON();
        const valueArr = [];
        for (const scenario of accountScenarioJson) {
            if (!Object.keys(TYPE).includes(scenario.account)) {
                switch (scenario.account) {
                    case 'store':
                        valueArr.push(scenario)
                        break
                }
            }
        }
        return valueArr;
    }

    static async changeStorePrice(storeValue, value) {
        let newValue = value;
        storeValue.forEach(scenario => {
            if (scenario.type == 1) {
                newValue = Number(value) + Number(scenario.virtuon);
            } else if (scenario.type == 2) {
                if (scenario.virtuon > 0) {
                    let perValue = Number(value * scenario.virtuon / 100);
                    newValue = Number(value) + perValue
                } else {
                    let perValue = Number(value * scenario.virtuon / 100);
                    newValue = Number(value) - perValue
                }
            } else if (scenario.type == 3) {
                newValue = Number(value) * Number(scenario.virtuon);
            }
        });

        if (newValue > 0) {
            return Number(newValue);
        } else {
            return Number(value);
        }
    }

    static async charge(user_id, account, amount, reason, from_account, transaction, extra) {
        const user = await this.model.findOrFail(user_id)
        let needToCommitTransaction = false
        let description
        if (!transaction) {
            transaction = await Database.beginTransaction()
            needToCommitTransaction = true
        }

        // const isRestricted = await user.shift().then(shift => {
        //     if (!shift) {
        //         return true
        //     }
        //     return shift.eco_mode === 'sanctions'
        // })

        if (from_account) {
            const from_acc = await Account.query().where({ type: from_account, user_id: user_id }).first();
            const balance = await user.balance(from_account)
            if (balance < amount) {
                return { status: 0, message: `На счёте «${TYPE[from_account]}» недостаточно средств` }
            } else if (from_account === 'deposit') {
                const transaferBalance = await from_acc.deopsitBalance('without_capital');
                if (transaferBalance < amount) {
                    return { status: 0, message: `На счёте «${TYPE[from_account]}» недостаточно средств` }
                }
            }
            else if (from_account === 'common' && account != 'deposit') {
                switch (account) {
                    case 'podushka':
                        const financial_safety_transfer = await Financial.setting('financial_safety_transfer');
                        if (amount < balance * (financial_safety_transfer / 100)) {
                            return { status: 0, message: `сумма слишком мала` }
                        }
                        break
                    case 'wallet':
                        const wallet_transfer = await Financial.setting('wallet_transfer');
                        if (amount > balance * (wallet_transfer / 100)) {
                            return { status: 0, message: `сумма слишком большая` }
                        }
                        break
                    case 'dream':
                        const dream_transfer = await Financial.setting('dream_transfer');
                        if (amount > balance * (dream_transfer / 100)) {
                            return { status: 0, message: `сумма слишком большая` }
                        }
                        break
                    default:
                        return { status: 0, message: `сумма слишком большая` }
                }
            }else{
                return { status: 0, message: `нельзя перевести виртуальный «${TYPE[from_account]}» счет на «${TYPE[account]}» счет` }
            }
            // if (isRestricted && ['wallet', 'podushka'].includes(account)) {
            //     return { status: 0, message: `Переводы на счёт «${TYPE[account]}» запрещены` }
            // }

            description = reason ? reason : `Перевод на счёт «${TYPE[account]}»`

            if (from_acc) {
                if (from_account === 'deposit') {
                    const from_transaction = new Transaction();
                    from_transaction.account_id = from_acc.id;
                    from_transaction.amount = amount * -1;
                    from_transaction.description = description;
                    from_transaction.transaction_type = 'without_capital';
                    from_transaction.save();
                    user.userdeposites().where({ 'status': 1, 'type': 2 }).fetch().then(({ rows }) => rows)
                        .then(async function (userdeposites) {
                            await userdeposites.forEach(async function (userdeposite) {
                                const depositTransaction = new UserDepositTransaction();
                                depositTransaction.user_id = user.id;
                                depositTransaction.account_id = userdeposite.account_id;
                                depositTransaction.user_deposit_id = userdeposite.id;
                                depositTransaction.amount = amount * -1;
                                depositTransaction.status = '1';
                                await depositTransaction.save();
                            })
                        })
                } else {
                    const from_transaction = new Transaction();
                    from_transaction.account_id = from_acc.id;
                    from_transaction.amount = amount * -1;
                    from_transaction.description = description;
                    from_transaction.save();
                }
            }
        }

        if (!(description = reason)) {
            const direction = (amount > 0)
                ? 'Пополнеие счёта'
                : 'Списание со счёта'

            description = from_account
                ? `Перевод со счёта «${TYPE[from_account]}»`
                : `${direction} «${TYPE[account]}»`
        }

        const acc = await Account.query().where({ type: account, user_id: user_id }).first();

        if (acc) {
            if (account == 'credit') {
                const tra = new Transaction();
                tra.account_id = acc.id;
                tra.amount = amount;
                tra.description = description;
                tra.transaction_type = "loan_amount";
                tra.save();
            } else if (account == 'deposit') {
                const tra = new Transaction();
                tra.account_id = acc.id;
                tra.amount = amount;
                tra.description = description;
                tra.transaction_type = extra.deposit_type;
                tra.save();
            } else {
                const tra = new Transaction();
                tra.account_id = acc.id;
                tra.amount = amount;
                tra.description = description;
                tra.save();
            }
        }

        if (needToCommitTransaction) {
            await transaction.commit()
        }

        return {
            status: 1, message: `Успешно переведена сумма на "${TYPE[account]}"`, data: { balance: await user.balance(account) }
        }
    }

    static async chargebackup(user_id, account, amount, reason, from_account, transaction, extra) {
        const user = await this.model.findOrFail(user_id)
        let needToCommitTransaction = false
        let description
        if (!transaction) {
            transaction = await Database.beginTransaction()
            needToCommitTransaction = true
        }

        const isRestricted = await user.shift()
            .then(shift => {
                if (!shift) {
                    return true
                }
                return shift.eco_mode === 'sanctions'
            })

        if (from_account) {
            const from_acc = await Account.query().where({ type: from_account, user_id: user_id }).first();
            const balance = await user.balance(from_account)
            if (balance < amount) {
                return { status: 0, message: `На счёте «${TYPE[from_account]}» недостаточно средств` }
            } else if (from_account === 'deposit') {
                const transaferBalance = await from_acc.deopsitBalance('without_capital');
                if (transaferBalance < amount) {
                    return { status: 0, message: `На счёте «${TYPE[from_account]}» недостаточно средств` }
                }
            }
            else if (from_account === 'common' && account != 'deposit') {
                switch (account) {
                    case 'podushka':
                        const financial_safety_transfer = await Financial.setting('financial_safety_transfer');
                        if (amount < balance * (financial_safety_transfer / 100)) {
                            return { status: 0, message: `На счёт «${TYPE[account]}» нельзя переводить меньше «${financial_safety_transfer}»%` }
                        }
                        break
                    case 'wallet':
                        const wallet_transfer = await Financial.setting('wallet_transfer');
                        if (amount > balance * (wallet_transfer / 100)) {
                            return { status: 0, message: `На счёт «${TYPE[account]}» нельзя переводить больше «${wallet_transfer}»%` }
                        }
                        break
                    case 'dream':
                        const dream_transfer = await Financial.setting('dream_transfer');
                        if (amount > balance * (dream_transfer / 100)) {
                            return { status: 0, message: `На счёт «${TYPE[account]}» нельзя переводить больше ${dream_transfer} %` }
                        }
                        break
                    default:
                        return { status: 0, message: `На счёт «${TYPE[account]}» нельзя переводить больше ${dream_transfer} %` }
                }
            }
            if (isRestricted && ['wallet', 'podushka'].includes(account)) {
                return { status: 0, message: `Переводы на счёт «${TYPE[account]}» запрещены` }
            }

            description = reason
                ? reason
                : `Перевод на счёт «${TYPE[account]}»`

            if (from_acc) {
                if (from_account === 'deposit') {
                    const from_transaction = new Transaction();
                    from_transaction.account_id = from_acc.id;
                    from_transaction.amount = amount * -1;
                    from_transaction.description = description;
                    from_transaction.transaction_type = 'without_capital';
                    from_transaction.save();
                    user.userdeposites().where({ 'status': 1, 'type': 2 }).fetch().then(({ rows }) => rows)
                        .then(async function (userdeposites) {
                            await userdeposites.forEach(async function (userdeposite) {
                                const depositTransaction = new UserDepositTransaction();
                                depositTransaction.user_id = user.id;
                                depositTransaction.account_id = userdeposite.account_id;
                                depositTransaction.user_deposit_id = userdeposite.id;
                                depositTransaction.amount = amount * -1;
                                depositTransaction.status = '1';
                                await depositTransaction.save();
                            })
                        })
                } else {
                    const from_transaction = new Transaction();
                    from_transaction.account_id = from_acc.id;
                    from_transaction.amount = amount * -1;
                    from_transaction.description = description;
                    from_transaction.save();
                }
            }
        }

        if (!(description = reason)) {
            const direction = (amount > 0)
                ? 'Пополнеие счёта'
                : 'Списание со счёта'

            description = from_account
                ? `Перевод со счёта «${TYPE[from_account]}»`
                : `${direction} «${TYPE[account]}»`
        }

        const acc = await Account.query().where({ type: account, user_id: user_id }).first();

        if (acc) {
            if (account == 'credit') {
                const tra = new Transaction();
                tra.account_id = acc.id;
                tra.amount = amount;
                tra.description = description;
                tra.transaction_type = "loan_amount";
                tra.save();
            } else if (account == 'deposit') {
                const tra = new Transaction();
                tra.account_id = acc.id;
                tra.amount = amount;
                tra.description = description;
                tra.transaction_type = extra.deposit_type;
                tra.save();
            } else {
                const tra = new Transaction();
                tra.account_id = acc.id;
                tra.amount = amount;
                tra.description = description;
                tra.save();
            }
        }

        if (needToCommitTransaction) {
            await transaction.commit()
        }

        return {
            status: 1, message: `Успешно переведена сумма на "${TYPE[account]}"`, data: { balance: await user.balance(account) }
        }
    }

    static async calcScore(user) {
        const ratio = await Promise.all([
            user.ratioOne(),
            user.ratioTwo(),
        ])

        // return (correctRatio(ratio[0]) + correctRatio(ratio[1])) * (1/ratio.length)
        return (correctRatio(ratio[0]) * Math.abs(1 + ratio[1])) * 100
    }

    static async userPurchase(user, type = 'badge') {
        return await UserOrders.query().where({ user_id: user.id }).fetch().then(({ rows }) => orderBy(rows, ['created_at']))
        .then(orders => {
            const promises = []
            orders.forEach(order => {
                if(type == 'badge'){
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
                }
                if(type == 'property'){
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
                }
            })
            return Promise.all(promises).then(orders)
        });
    }


    static async availableCredit(user_id, transform) {
        let data = {
            availableCredit: 0,
            remainingDays: 0,
            creditRate: 0,
            interestAmount: 0,
            interestEmi: 0,
            loanEmi: 0,
            totalEmi: 0,
        };
        const userCreditExist = await this.userCreditExist(user_id, transform);
        if (userCreditExist) {
            const user = await this.model.findOrFail(user_id);
            const accounts = await user.accounts().whereIn('type', ['common', 'wallet', 'deposit', 'investment', 'podushka'])
                .fetch()
                .then(({ rows }) => orderBy(rows, ['created_at', 'label']))
                .then(accounts => {
                    const promises = []
                    accounts.forEach(account => {
                        const promise = account.balance()
                            .then(balance => Object.defineProperty(account, 'balance', { value: balance }))
                        promises.push(promise);
                    })
                    return Promise.all(promises).then(accounts => transform.include('id').collection(accounts, AccountTransformer))
                })
            const loan_amount = Number(await Financial.setting('loan_amount')) / 100;
            const totalBalanace = Number(accounts.reduce(function (sum, acc) {
                return sum + acc.balance;
            }, 0));

            const remainingDays = Number(await Financial.setting('loan_period'));
            
            const credit_rate = Number(await Financial.setting('credit_rate')) / 100;
            const interestAmount = (totalBalanace * loan_amount) * credit_rate * remainingDays;
            const totalEmi = (totalBalanace * loan_amount / remainingDays) + (interestAmount / remainingDays);
            data.availableCredit = totalBalanace * loan_amount;
            data.remainingDays = remainingDays;
            data.creditRate = credit_rate; // in %
            data.interestAmount = Number(interestAmount.toFixed(2)); // total intrest amount
            data.interestEmi = Number(interestAmount / remainingDays.toFixed(2)); // total intrest amount
            data.loanEmi = Number((totalBalanace * loan_amount / remainingDays).toFixed(2)); // total intrest amount
            data.totalEmi = Number(totalEmi.toFixed(2));
        }
        return data;
    }

    static async userCreditExist(user_id) {
        const creditAccount = await Account.query().where({ user_id: user_id, type: 'credit' })
            .with('usercredits', (builder) => {
                builder.where('status', 1)
            }).first();
        if (creditAccount != '' && creditAccount != undefined && creditAccount != null) {
            const newData = creditAccount.toJSON();
            if (newData.usercredits.length > 0) {
                return false
            } else {
                return true;
            }
        } else {
            return true;
        }
    }

    static async createCreditAccount(user_id, transform, parameter) {
        try {
            const availableCredit = await this.availableCredit(user_id, transform);
            const account = await Account.query().where({ user_id: user_id, type: 'credit' }).first();
            let creditAccount;
            let accountId;
            if (account) {
                accountId = account.id;
                creditAccount = account;
                await this.charge(user_id, parameter.type, availableCredit.availableCredit);
            } else {
                const newAccount = new Account();
                newAccount.user_id = user_id;
                newAccount.label = parameter.name;
                newAccount.type = parameter.type;
                await newAccount.save();
                if (newAccount.id) {
                    accountId = newAccount.id;
                    creditAccount = newAccount
                    await this.charge(user_id, parameter.type, availableCredit.availableCredit);
                }
            }

            const userCredit = new UserCredits();
            userCredit.user_id = user_id;
            userCredit.account_id = accountId;
            userCredit.loan_amount = availableCredit.availableCredit;
            userCredit.interest_rate = availableCredit.creditRate;
            userCredit.remaining_days = availableCredit.remainingDays;
            userCredit.interest_amount = availableCredit.interestAmount;
            userCredit.loan_emi = availableCredit.loanEmi;
            userCredit.interest_emi = availableCredit.interestEmi;
            userCredit.status = '1';
            await userCredit.save();

            if (userCredit.id) {
                const creditTransaction = new UserCreditTransaction();
                creditTransaction.user_id = user_id;
                creditTransaction.account_id = accountId;
                creditTransaction.user_credit_id = userCredit.id;
                creditTransaction.loan_amount = availableCredit.availableCredit * -1;
                creditTransaction.interest_amount = availableCredit.interestAmount * -1;
                creditTransaction.status = '1';
                await creditTransaction.save();
            }
            return creditAccount;
        } catch (err) {
            console.log(err)
            return false;
        }
    }


    static async createDepositeAccount(user_id, transform, parameter) {
        try {
            const user = await this.model.findOrFail(user_id)
            const balance = await user.balance('common');
            if (balance >= parameter.amount && parameter.amount > 0) {
                const depositAcc = await Account.query().where({ user_id: user_id, type: 'deposit' })
                    .with('userdeposites', (builder) => {
                        builder.where({ 'type': parameter.deposit_type, 'status': '1' })
                    }).first();

                let accountId = '';
                if (depositAcc != null && depositAcc != undefined) {
                    if (depositAcc.toJSON().userdeposites != undefined && depositAcc.toJSON().userdeposites != null && depositAcc.toJSON().userdeposites.length > 0) {
                        return { status: 0, message: 'Deposit account period is running' };
                    } else {
                        accountId = depositAcc.id;
                    }
                } else {
                    const newAccount = new Account();
                    newAccount.user_id = user_id;
                    newAccount.label = parameter.name;
                    newAccount.type = parameter.type;
                    await newAccount.save();
                    accountId = newAccount.id;
                }
                if (accountId) {

                    const cap_deposit_period = await Financial.setting('cap_deposit_period');
                    const cap_deposit_rate = await Financial.setting('cap_deposit_rate');
                    const deposit_period = await Financial.setting('deposit_period');
                    const deposit_rate = await Financial.setting('deposit_rate');

                    let expireDate = ''
                    let intrest_rate = 0;
                    let extra = { deposit_type: '' }
                    if (parameter.deposit_type == '1') {
                        expireDate = moment().add('days', Number(cap_deposit_period));
                        intrest_rate = cap_deposit_rate;
                        extra.deposit_type = 'with_capital'
                    }
                    if (parameter.deposit_type == '2') {
                        expireDate = moment().add('days', Number(deposit_period));
                        intrest_rate = deposit_rate;
                        extra.deposit_type = 'without_capital'
                    }

                    const userDeposites = new UserDeposites();
                    userDeposites.user_id = user_id;
                    userDeposites.account_id = accountId;
                    userDeposites.type = parameter.deposit_type;
                    userDeposites.amount = parameter.amount;
                    userDeposites.period = cap_deposit_period;
                    userDeposites.intrest_rate = intrest_rate;
                    userDeposites.period_expired = expireDate;
                    userDeposites.status = '1';
                    await userDeposites.save();

                    const depositTransaction = new UserDepositTransaction();
                    depositTransaction.user_id = user_id;
                    depositTransaction.account_id = accountId;
                    depositTransaction.user_deposit_id = userDeposites.id;
                    depositTransaction.amount = parameter.amount;
                    depositTransaction.status = '1';
                    await depositTransaction.save();



                    await this.charge(user_id, parameter.type, parameter.amount, '', 'common', '', extra);
                }
                const dAccount = await Account.findOrFail(accountId);
                dAccount.deposite_type = parameter.deposit_type == 1 ? 'Deposite - with capital' : 'Deposite - without capital';
                return { status: 1, message: 'Account create successfully', data: dAccount };
            } else {
                return { status: 0, message: 'Invalid amount' };
            }
        } catch (err) {
            console.log(err)
            return false;
        }
    }

    static async creditSettlement() {
        try {
            const creditusers = await this.model.query().fetch().then(result => (result.rows));
            creditusers.forEach(async (user) => {
                const userCreditExist = this.userCreditExist(user.id);
                if (userCreditExist) {
                    const creditAccount = await Account.query().where({ user_id: user.id, type: 'credit' })
                        .with('usercredits', (builder) => {
                            builder.where('status', 1)
                        }).first();
                    if (creditAccount) {
                        const newData = creditAccount.toJSON();
                        const usercredits = newData.usercredits[0];
                        if (usercredits) {
                            const creditTransaction = await UserCreditTransaction.query().where({ user_credit_id: usercredits.id, status: '2' }).fetch().then(({ rows }) => orderBy(rows, ['created_at'], 'desc'))
                            if (creditTransaction.length < usercredits.remaining_days) {
                                if (creditTransaction.length > 0) {
                                    const daysFromBegin = moment(creditTransaction[0].created_at).diff(moment(), 'days');
                                    if (daysFromBegin == 0) {
                                        Logger.info(` Loan Emi «${(creditTransaction.length + 1)}»`)
                                        const commonAccount = await Account.query().where({ user_id: user.id, type: 'common' }).first();
                                        if (commonAccount.id) {
                                            // Deposite Emi in Credit Account
                                            const creditNewTransaction = new UserCreditTransaction();
                                            creditNewTransaction.user_id = user.id;
                                            creditNewTransaction.account_id = creditAccount.id;
                                            creditNewTransaction.user_credit_id = usercredits.id;
                                            creditNewTransaction.loan_amount = usercredits.loan_emi;
                                            creditNewTransaction.interest_amount = usercredits.interest_emi;
                                            creditNewTransaction.status = '3';
                                            await creditNewTransaction.save();

                                            // Deduction from common Account
                                            const commonTransaction = [usercredits.loan_emi, usercredits.interest_emi];
                                            commonTransaction.forEach(async (amount, index) => {
                                                const newTransaction = new Transaction();
                                                newTransaction.account_id = commonAccount.id;
                                                newTransaction.amount = amount * -1;
                                                if (index == 0) {
                                                    newTransaction.description = 'Principal amount of Credit Account <' + (creditTransaction.length + 1) + '/' + usercredits.remaining_days + '> - ' + usercredits.id;
                                                } else {
                                                    newTransaction.description = 'Interest amount of Credit Account <' + (creditTransaction.length + 1) + '/' + usercredits.remaining_days + '> - ' + usercredits.id;
                                                }
                                                newTransaction.transaction_type = 'loan_emi';
                                                await newTransaction.save();
                                                if (index == 0) {
                                                    await UserCreditTransaction.query().update({ loan_transaction_id: newTransaction.id, status: '2' }).where({ id: creditNewTransaction.id });
                                                } else {
                                                    await UserCreditTransaction.query().update({ intrest_transaction_id: newTransaction.id, status: '2' }).where({ id: creditNewTransaction.id });
                                                }
                                            });
                                        } else {
                                            Logger.error('Deducted Account not found')
                                        }
                                    }
                                    if (daysFromBegin < 0) {
                                        Logger.error('Transaction Issue! EMI deduction issue since last ' + (daysFromBegin * -1) + ' day')
                                    }
                                } else {
                                    Logger.info(` Loan Emi «${(creditTransaction.length + 1)}»`)
                                    const commonAccount = await Account.query().where({ user_id: user.id, type: 'common' }).first();
                                    if (commonAccount.id) {
                                        // Deposite Emi in Credit Account
                                        const creditNewTransaction = new UserCreditTransaction();
                                        creditNewTransaction.user_id = user.id;
                                        creditNewTransaction.account_id = creditAccount.id;
                                        creditNewTransaction.user_credit_id = usercredits.id;
                                        creditNewTransaction.loan_amount = usercredits.loan_emi;
                                        creditNewTransaction.interest_amount = usercredits.interest_emi;
                                        creditNewTransaction.status = '3';
                                        await creditNewTransaction.save();

                                        // Deduction from common Account
                                        const commonTransaction = [usercredits.loan_emi, usercredits.interest_emi];
                                        commonTransaction.forEach(async (amount, index) => {
                                            const newTransaction = new Transaction();
                                            newTransaction.account_id = commonAccount.id;
                                            newTransaction.amount = amount * -1;
                                            if (index == 0) {
                                                newTransaction.description = 'Principal amount of Credit Account <' + (creditTransaction.length + 1) + '/' + usercredits.remaining_days + '> - ' + usercredits.id;
                                            } else {
                                                newTransaction.description = 'Interest amount of Credit Account <' + (creditTransaction.length + 1) + '/' + usercredits.remaining_days + '> - ' + usercredits.id;
                                            }
                                            newTransaction.transaction_type = 'loan_emi';
                                            await newTransaction.save();
                                            if (index == 0) {
                                                await UserCreditTransaction.query().update({ loan_transaction_id: newTransaction.id, status: '2' }).where({ id: creditNewTransaction.id });
                                            } else {
                                                await UserCreditTransaction.query().update({ intrest_transaction_id: newTransaction.id, status: '2' }).where({ id: creditNewTransaction.id });
                                            }
                                        });
                                    } else {
                                        Logger.error('Deducted Account not found')
                                    }
                                }
                            } else {
                                await UserCredits.query().update({ status: '0' }).where({ id: usercredits.id, status: '1' });
                            }
                        }
                    }
                }
            })
        } catch (error) {
            Logger.error(error.message, error)
        }
    }

    static async depositeSettlement() {
        try {
            await this.model.query().fetch().then(({ rows }) => orderBy(rows, ['created_at']))
                .then(async function (users) {
                    await users.forEach(async function (user) {
                        user.userdeposites().where('status', 1).fetch().then(({ rows }) => rows)
                            .then(async function (userdeposites) {
                                await userdeposites.forEach(async function (userdeposite, i) {
                                    const balance = await userdeposite.balance();
                                    const dailyIntrest = Number(balance) * Number(userdeposite.intrest_rate) / 100;
                                    const trasaction = await userdeposite.deposittransaction().whereIn('status', ['2', '3']).fetch().then(({ rows }) => orderBy(rows, ['created_at'], 'desc'));
                                    let makeTrasaction = true;
                                    if (trasaction.length > 0 && moment(trasaction[0].created_at).format('DD_MM_YYYY') >= moment().format('DD_MM_YYYY')) {
                                        makeTrasaction = false;
                                    }
                                    if (makeTrasaction) {
                                        if (userdeposite.type == '1') {
                                            if (moment(userdeposite.period_expired).format('YYYY-MM-DD') >= moment().format('YYYY-MM-DD')) {
                                                const tra = new Transaction();
                                                tra.account_id = userdeposite.account_id;
                                                tra.amount = dailyIntrest;
                                                tra.description = 'Interest of deposit account';
                                                tra.transaction_type = 'with_capital';
                                                await tra.save();
                                                const depositTransaction = new UserDepositTransaction();
                                                depositTransaction.user_id = user.id;
                                                depositTransaction.account_id = userdeposite.account_id;
                                                depositTransaction.user_deposit_id = userdeposite.id;
                                                depositTransaction.amount = dailyIntrest;
                                                depositTransaction.status = '2';
                                                await depositTransaction.save();
                                            }
                                        }

                                        if (userdeposite.type == '2') {
                                            const depositTransaction = new UserDepositTransaction();
                                            depositTransaction.user_id = user.id;
                                            depositTransaction.account_id = userdeposite.account_id;
                                            depositTransaction.user_deposit_id = userdeposite.id;
                                            depositTransaction.amount = dailyIntrest;
                                            depositTransaction.status = '2';
                                            await depositTransaction.save();
                                            if (moment(userdeposite.period_expired).format('YYYY-MM-DD') == moment().format('YYYY-MM-DD')) {
                                                const interest = await userdeposite.interest();
                                                const tra = new Transaction();
                                                tra.account_id = userdeposite.account_id;
                                                tra.amount = interest;
                                                tra.description = 'Total Interest of deposit account';
                                                tra.transaction_type = 'without_capital';
                                                tra.save();
                                            }
                                        }
                                    }

                                    if (moment(userdeposite.period_expired).format('YYYY-MM-DD') == moment().format('YYYY-MM-DD')) {
                                        if (userdeposite.type == '1') {
                                            const traFrom = new Transaction();
                                            traFrom.account_id = userdeposite.account_id;
                                            traFrom.amount = userdeposite.amount * -1;
                                            traFrom.description = 'Transafer deposite amout to common account';
                                            traFrom.save();

                                            const toAccount = await Account.query().where({ type: 'common', user_id: user.id }).first();

                                            const traTo = new Transaction();
                                            traTo.account_id = toAccount.id;
                                            traTo.amount = userdeposite.amount;
                                            traTo.description = 'Transafer deposite amout to common account';
                                            traTo.save();

                                            Logger.info('Transfer Amount from deposit to common', { dayNumber })
                                        }
                                        await UserDeposites.query().update({ status: '0' }).where({ id: userdeposite.id })
                                    }
                                })
                            });
                    });
                });
        } catch (error) {
            Logger.error(error.message, error)
        }
    }
}
