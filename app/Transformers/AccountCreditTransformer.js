'use strict'

const BumblebeeTransformer = use('Bumblebee/Transformer')

module.exports = class AccountCreditTransformer extends BumblebeeTransformer {
    static get availableInclude() {
        return [
            'id',
            'user_id',
            'usercredits'
        ]
    }

    transform(model) {
        return {
            user_id: model.user_id || '',
            label: model.label || '',
            type: model.type || '',
            usercredits: model.usercredits || '',
            created_at: model.toJSON().created_at || '',
            updated_at: model.toJSON().updated_at || '',
        }
    }


    includeId(model) {
        return model.id
    }
}
