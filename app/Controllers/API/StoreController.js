'use strict'

const UserRepo = use('App/Repo/User')
const User = use('App/Models/User')
const Badges = use('App/Models/Badges')
const UserOrders = use('App/Models/UserOrders')
const Logger = use('Logger')
const __ = use('App/Helpers/string-localize');
const { validate } = use('Validator');
const Env = use('Env')
const moment = use('moment')
const Property = use('App/Models/Property')
const Shift = use('App/Models/Shift')


module.exports = class StoreController {
    async badgesList({ auth, response }) {
        try {
            const user = await auth.getUser();
            if (user.id) {
                const userDetails = await User.query().where({ id: user.id }).first();
                const balance = await userDetails.balance('common');
                const badges = await Badges.query().orderBy('created_at').fetch().then(({ rows }) => rows)
                    .then(async (badges) => {
                        const promises = [];
                        for (let badge of badges) {
                            const settlement = Number(badge.value) - balance;
                            const orderExist = await UserOrders.query().where({ badge_id: badge.id, user_id: user.id }).first();
                            if (balance >= Number(badge.value)) {
                                badge.canPurchase = 1
                            } else {
                                badge.canPurchase = 0;
                            }
                            if (orderExist) {
                                badge.alreadyPurchased = 1;
                                badge.canPurchase = 0;
                            } else {
                                badge.alreadyPurchased = 0;
                            }
                            if (badge.alreadyPurchased == 0 && settlement > 0) {
                                badge.needMoreVirtuon = settlement;
                            } else {
                                badge.needMoreVirtuon = 0;
                            }
                           
                            await promises.push(badge);
                        }
                        return Promise.all(promises).then(() => badges);
                    })
                response.ok(null, badges);
            }
        } catch (err) {
            console.log(err);
        }
    }

    async purchaseBadges({ request, auth, response, antl }) {
        try {
            const user = await auth.getUser();
            if (user.id) {
                const userDetails = await User.query().where({ id: user.id }).first();
                const balance = await userDetails.balance('common');
                const rules = {
                    id: 'required'
                }
                const validation = await validate(request.all(), rules, request.VaildateMessage)
                if (validation.fails()) {
                    response.badRequest(__('Validation Error', antl), validation.messages());
                } else {
                    const parameter = request.all();
                    const orderExist = await UserOrders.query().where({ badge_id: parameter.id, user_id: user.id }).first();
                    if (orderExist) {
                        response.badRequest(__('Already purachased', antl), null);
                    } else {
                        const badge = await Badges.findOrFail(parameter.id);
                        if (badge) {
                            if (balance >= Number(badge.value)) {
                                const newOrder = new UserOrders
                                newOrder.user_id = user.id;
                                newOrder.badge_id = badge.id;
                                newOrder.amount = badge.value;
                                newOrder.status = 1;
                                await newOrder.save();
                                await UserRepo.charge(user.id, 'common', badge.value * -1, "Purchase " + badge.name);

                            } else {
                                response.badRequest(__('Not enough balance to purchase', antl), null);
                            }
                        } else {
                            response.badRequest(__('Badges not found', antl), null);
                        }
                    }
                }
            }
        } catch (err) {
            console.log(err);
        }
    }

    async storeList({ auth, response }) {
        try {
            const user = await auth.getUser();
            if (user.id) {
                const userDay = await UserRepo.userDay(user.id);
                const storeValue = await UserRepo.storeIncDecsValue(userDay.day);
                const userDetails = await User.query().where({ id: user.id }).first();
                const balance = await userDetails.balance('common');
                const propertyData = await Property.query().orderBy('created_at').fetch().then(({ rows }) => rows)
                    .then(async (properties) => {
                        const promises = [];
                        for (let property of properties) {
                            const settlement = Number(property.value) - balance;
                            const orderExist = await UserOrders.query().where({ property_id: property.id, user_id: user.id }).first();
                            if (balance >= Number(property.value)) {
                                property.canPurchase = 1
                            } else {
                                property.canPurchase = 0;
                            }
                            if (orderExist) {
                                property.alreadyPurchased = 1;
                                property.canPurchase = 0;
                            } else {
                                property.alreadyPurchased = 0;
                            }
                            if (property.alreadyPurchased == 0 && settlement > 0) {
                                property.needMoreVirtuon = settlement;
                            } else {
                                property.needMoreVirtuon = 0;
                            }
                            property.value = await UserRepo.changeStorePrice(storeValue,property.value);
                            await promises.push(property);
                        }
                        return Promise.all(promises).then(() => properties);
                    })

                const badges = await Badges.query().orderBy('created_at').fetch().then(({ rows }) => rows)
                    .then(async (badges) => {
                        const promises = [];
                        for (let badge of badges) {
                            const settlement = Number(badge.value) - balance;
                            const orderExist = await UserOrders.query().where({ badge_id: badge.id, user_id: user.id }).first();
                            if (balance >= Number(badge.value)) {
                                badge.canPurchase = 1
                            } else {
                                badge.canPurchase = 0;
                            }
                            if (orderExist) {
                                badge.alreadyPurchased = 1;
                                badge.canPurchase = 0;
                            } else {
                                badge.alreadyPurchased = 0;
                            }
                            if (badge.alreadyPurchased == 0 && settlement > 0) {
                                badge.needMoreVirtuon = settlement;
                            } else {
                                badge.needMoreVirtuon = 0;
                            }
                            badge.value = await UserRepo.changeStorePrice(storeValue,badge.value);
                            await promises.push(badge);
                        }
                        return Promise.all(promises).then(() => badges);
                    })

                let store = {};
                store.badges = badges;
                store.property = propertyData;
                response.ok(null, store);
            }
        } catch (err) {
            console.log(err);
        }
    }

    async storePurchase({ request, auth, response, antl }) {
        try {
            const user = await auth.getUser();
            if (user.id) {
                const userDetails = await User.query().where({ id: user.id }).first();
                const balance = await userDetails.balance('wallet');
                const rules = {
                    id: 'required',
                    purchase_type: 'required'
                }
                const validation = await validate(request.all(), rules, request.VaildateMessage)
                if (validation.fails()) {
                    response.badRequest(__('Validation Error', antl), validation.messages());
                } else {
                    const parameter = request.all();
                    const type = parameter.purchase_type;
                    if (type == 'property' || type == 'badge') {
                        if (type == 'property') {
                            const orderExist = await UserOrders.query().where({ property_id: parameter.id, user_id: user.id }).first();
                            if (orderExist) {
                                response.badRequest(__('Already purachased', antl), null);
                            } else {
                                const property = await Property.find(parameter.id);
                                const userDay = await UserRepo.userDay(user.id);
                                const day = userDay.day
                                if (property) {
                                    if (balance >= Number(property.value)) {
                                        const newOrder = new UserOrders
                                        newOrder.user_id = user.id;
                                        newOrder.property_id = property.id;
                                        newOrder.type = type;
                                        newOrder.amount = property.value;
                                        newOrder.daily_reward = property.per_day_value;
                                        newOrder.remaining_days = day;
                                        newOrder.status = 1;
                                        await newOrder.save();
                                        await UserRepo.charge(user.id, 'wallet', property.value * -1, "Purchase Product : " + property.name);
                                    } else {
                                        response.badRequest(__('Not enough balance to purchase', antl), null);
                                    }
                                } else {
                                    response.badRequest(__('Product not found', antl), null);
                                }
                            }
                        }

                        if (type == 'badge') {
                            const orderExist = await UserOrders.query().where({ badge_id: parameter.id, user_id: user.id }).first();
                            if (orderExist) {
                                response.badRequest(__('Already purachased', antl), null);
                            } else {
                                const badge = await Badges.find(parameter.id);
                                if (badge) {
                                    if (balance >= Number(badge.value)) {
                                        const newOrder = new UserOrders
                                        newOrder.user_id = user.id;
                                        newOrder.badge_id = badge.id;
                                        newOrder.type = type;
                                        newOrder.amount = badge.value;
                                        newOrder.status = 1;
                                        await newOrder.save();
                                        await UserRepo.charge(user.id, 'wallet', badge.value * -1, "Purchase Badge : " + badge.name);
                                    } else {
                                        response.badRequest(__('Not enough balance to purchase', antl), null);
                                    }
                                } else {
                                    response.badRequest(__('Product not found', antl), null);
                                }
                            }
                        }
                    } else {
                        response.badRequest(__('Invalid Purachse Type', antl), null);
                    }
                }
            } else {
                response.badRequest(__('Invalid User', antl), null);
            }
        } catch (err) {
            console.log(err);
        }
    }

}