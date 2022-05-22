'use strict'
const moment = use('moment')
const Logger = use('Logger')
const User = use('App/Models/User');
const UserRepo = use('App/Repo/User');
const { orderBy } = require('lodash');
module.exports = class Common {
    static async PropertyReward() {
        try {
            await User.query().fetch().then(({ rows }) => orderBy(rows, ['created_at']))
                .then(async function (users) {
                    await users.forEach(async function (user) {
                        user.orders().where('type', 'property').fetch().then(({ rows }) => rows)
                            .then(async function (userOrders) {
                                await userOrders.forEach(async function (orders, i) {
                                    let property = '';
                                    await orders.property().fetch()
                                        .then(rows => {
                                            property = rows;
                                        })
                                    const daysFromBegin = moment(orders.created_at)
                                        .diff(moment(), 'days')
                                    let remainDays = Math.abs(daysFromBegin % 18) + 1
                                    if (orders.remaining_days >= remainDays) {
                                        await UserRepo.charge(user.id, "common", orders.daily_reward, "Reward of " + property.name);
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
