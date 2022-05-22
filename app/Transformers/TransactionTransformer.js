'use strict'

const BumblebeeTransformer = use('Bumblebee/Transformer')
const { TYPE } = use('App/Models/Account')

module.exports = class TransactionTransformer extends BumblebeeTransformer
{
    static get availableInclude () {
        return ['id']
    }

    transform (model) {
        return {
            account: model.account,
            account_name: TYPE[model.account],
            amount: model.amount,
            description: model.description,
            account_type: model.account_type,
            created_at: model.toJSON().created_at,
            
        }
    }

    includeId (model) {
        return model.id
    }
}
