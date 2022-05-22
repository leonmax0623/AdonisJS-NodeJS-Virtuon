'use strict'

const BumblebeeTransformer = use('Bumblebee/Transformer')

module.exports = class FinancialTransformer extends BumblebeeTransformer {
    transform(model) {
        return {
            id: model.id,
            key: model.key,
            value: model.value,
            status: model.status,
            created_at: model.toJSON().created_at,
            updated_at: model.toJSON().updated_at,
        }
    }
}
