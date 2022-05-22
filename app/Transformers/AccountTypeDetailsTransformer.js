'use strict'

const BumblebeeTransformer = use('Bumblebee/Transformer')
const Account = use('App/Models/Account')
const Env = use('Env')


module.exports = class AccountTypeDetailsTransformer extends BumblebeeTransformer {
    static get availableInclude() {
        return [
            'id',
            'user_id',
            'transactions'
        ]
    }

    transform(model) {
        return {
            id: model.id || '',
            type: model.name || '',
            title: model.value || '',
            description: model.description || '',
            icon: model.icon || '',
            first_value: model.first_value,
            second_value: model.second_value,
            third_value: model.third_value,
            with_capital: model.with_capital,
            without_capital: model.without_capital,
        }
    }


    includeId(model) {
        return model.id
    }
}
