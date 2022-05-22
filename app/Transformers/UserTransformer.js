'use strict'

const BumblebeeTransformer = use('Bumblebee/Transformer')
const ShiftTransformer = use('App/Transformers/ShiftTransformer')
const User = use('App/Repo/User')

module.exports = class UserTransformer extends BumblebeeTransformer
{
    static get availableInclude () {
        return [
            'id',
            'accounts',
            'is_admin',
            'status',
            'total_balance',
            'progress',
            'score',
            'current_shift',
            'tokens',
        ]
    }

    transform (model) {
        return {
            username: model.username,
            firstname: model.firstname,
            lastname: model.lastname,
            email: model.email,
            about: model.about,
            target: model.target,
            last_login: model.toJSON().last_login,
            created_at: model.toJSON().created_at,
            updated_at: model.toJSON().updated_at,
        }
    }

    includeId (model) {
        return model.id
    }

    includeStatus (model) {
        return model.status
    }

    includeIsAdmin (model) {
        return model.is_admin
    }

    async includeAccounts (model) {
        return {
            dream: await model.balance('dream'),
            common: await model.balance('common'),
            wallet: await model.balance('wallet'),
            podushka: await model.balance('podushka'),
        }
    }

    includeTotalBalance (model) {
        return model.balance()
    }

    // async includeProgress (model) {
    //     return {
    //         case1: await model.ratioOne() * 100,
    //         case2: (await model.ratioTwo()) > 0,
    //     }
    // }

    // includeScore (model) {
    //     return User.calcScore(model)
    // }

    includeTokens (model) {
        return model.tokens()
            .orderBy('created_at', 'desc')
            .fetch()
            .then(({ rows }) => {
                return this.collection(rows, token => ({
                    id: token.id,
                    type: token.type,
                    label: token.label,
                    created_at: token.toJSON().created_at,
                }))
            })
    }
}
