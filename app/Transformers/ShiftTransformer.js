'use strict'

const BumblebeeTransformer = use('Bumblebee/Transformer')
const moment = use('moment')

module.exports = class ShiftTransformer extends BumblebeeTransformer
{
    static get availableInclude () {
        return ['users_count']
    }

    transform (model) {
        return {
            id: model.id,

            name: model.name,
            description: model.description,

            begin: moment(model.begin).format('YYYY-MM-DD'),
            end: moment(model.end).format('YYYY-MM-DD'),

            charge_interval: model.charge_interval,
            charge_amount: model.charge_amount,
        }
    }

    async includeUsersCount (model) {
        const count = await model.users()
            .count('* as total')

        return Number(count[0].total)
    }
}
