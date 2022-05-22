'use strict'

const UserRepo = use('App/Repo/User')
const User = use('App/Models/User')
const Logger = use('Logger')
const __ = use('App/Helpers/string-localize');
const Transaction = use('App/Models/Transaction');

module.exports = class TransactionController {

    async index({ request, response, transform, auth, antl }) {
        try {
            const user = await auth.getUser();
            if (user) {
                let page = 1;
                let limit = 10;
                if (request.body.page) {
                    page = request.body.page;
                }
                const userTransaction = await User.query().where({ id: user.id })
                    .with('transactions', (builder) => {
                        builder.with('account');
                    }).first();
                let transaction = userTransaction.toJSON().transactions;
                let total = transaction.length,
                    start = page * limit - limit,
                    end = page * limit,
                    pages = transaction.length / limit;
                let tPage = Number((Math.round(pages * 100) / 100).toFixed(0));
                if (tPage <= 0) {
                    tPage = 1
                }
                transaction = transaction.slice(start, end);
                let data = {};
                data["page"] = Number(page);
                data["total_page"] = tPage;
                data["total_transaction"] = total;
                data["data"] = transaction;
                response.ok(__(null, antl), data);
            }
        } catch (error) {
            Logger.error(error.message, error)
            response.badRequest(__('No Transaction Found', antl), null);
        }
    }


    async create({ request, auth, response, antl }) {
        if (request.input('to_account') != 'credit') {
            const result = await UserRepo.charge(request.input('user_id', auth.user.id),
                request.input('to_account'), request.input('amount'),
                request.input('reason'), request.input('from_account'))
            // response.ok(null, await auth.generate(newUser));
            if (result.status == 1) {
                response.ok(__(result.message, antl), result.data);
            } else {
                response.badRequest(__(result.message, antl), result.data);
            }
        } else {
            response.badRequest(__('You cannot transfer to the credit account', antl), null);
        }
    }


    async credit({ response, transform, auth, antl }) {
        try {
            const user = await auth.getUser();
            if (user.id) {
                const creditEmiTransaction = await User.query().where({ id: user.id })
                    .with('accounts', (builder) => {
                        builder.where('type', 'credit').with('usercredits', (builder) => {
                            builder.with('credittransaction', (builder) => {
                                builder.where('status', 2)
                            })
                        })
                    }).first();
                if (creditEmiTransaction.toJSON() && creditEmiTransaction.toJSON().accounts[0]) {
                    const emiData = creditEmiTransaction.toJSON().accounts[0];
                    response.ok(null, emiData);
                } else {
                    response.ok(__('No Account Found', antl), null);
                }
            } else {
                response.ok(__('No User Found', antl), null);
            }
        } catch (error) {
            Logger.error(error.message, error)
            response.badRequest(__('No Transaction Found', antl), null);
        }

    }

    async deposit({ response, transform, auth, antl }) {
        try {
            const user = await auth.getUser();
            if (user.id) {
                const creditEmiTransaction = await User.query().where({ id: user.id })
                    .with('accounts', (builder) => {
                        builder.where('type', 'credit').with('usercredits', (builder) => {
                            builder.with('credittransaction', (builder) => {
                                builder.where('status', 2)
                            })
                        })
                    }).first();
                if (creditEmiTransaction.toJSON() && creditEmiTransaction.toJSON().accounts[0]) {
                    const emiData = creditEmiTransaction.toJSON().accounts[0];
                    response.ok(null, emiData);
                } else {
                    response.ok(__('No Account Found', antl), null);
                }
            } else {
                response.ok(__('No User Found', antl), null);
            }
        } catch (error) {
            Logger.error(error.message, error)
            response.badRequest(__('No Transaction Found', antl), null);
        }

    }
}
