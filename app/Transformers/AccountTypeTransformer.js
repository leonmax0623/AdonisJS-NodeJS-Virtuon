'use strict'

const BumblebeeTransformer = use('Bumblebee/Transformer')
const Account = use('App/Models/Account')

module.exports = class AccountTypeTransformer extends BumblebeeTransformer {
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
            name: model.name || '',
            value: model.value || '',
            icon: model.icon || '',
            description: model.description || '',
            status: model.status || '',
            type_id: model.type_id || '',
            is_default: model.is_default || '',
            financials: model.financials || '',
            created_at: model.toJSON().created_at || '',
            updated_at: model.toJSON().updated_at || '',
        }
    }


    includeId(model) {
        return model.id
    }
}
