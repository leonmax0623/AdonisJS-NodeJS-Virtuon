'use strict'

const BumblebeeTransformer = use('Bumblebee/Transformer')

module.exports = class AccountTransformer extends BumblebeeTransformer
{
    static get availableInclude () {
        return [
            'id',
            'user_id',
            'transactions'
        ]
    }

    transform (model) {
        // console.log(model.toJSON());
        return {
            user_id: model.user_id || '',
            label: model.label || '',
            type: model.type || '',
            option: model.option || '',
            icon: model.icon || '',
            balance: model.balance || 0,
            deposite_type: model.deposite_type,
            transactions: model.transactions || '',
            created_at: model.toJSON().created_at || '',
            updated_at: model.toJSON().updated_at || '',
        }
    }


    includeId (model) {
        return model.id
    }
}
