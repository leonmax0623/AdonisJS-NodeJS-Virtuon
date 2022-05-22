'use strict'

const BumblebeeTransformer = use('Bumblebee/Transformer')

module.exports = class DreamTransformer extends BumblebeeTransformer {
    transform(model) {
        return {
            id: model.id,
            name: model.name,
            value: model.value,
        }
    }
}
