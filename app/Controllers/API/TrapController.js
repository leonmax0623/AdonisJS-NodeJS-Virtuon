'use strict'

const ScenarioTrap = use('App/Models/ScenarioTrap')
const User = use('App/Repo/User')
const __ = use('App/Helpers/string-localize');

module.exports = class TrapController {
    async apply({ params: { id }, auth, request, response, antl }) {
        try {
            const trap = await ScenarioTrap.find(id);
            if (trap) {
                let amount = 0;
                if (request.input('result') == 'yes') {
                    amount = trap.yes_amount
                } else {
                    amount = trap.no_amount
                }
                // const amount = request.input('result') === 'no'? trap.reward: trap.penalty * -1

                let message
                switch (true) {
                    case (amount > 0):
                        message = `Вы не попались в ловушку «${trap.name}»`
                        break

                    case (amount < 0):
                        message = `Вы попались в ловушку «${trap.name}» :(`
                        break
                }

                if ((amount !== 0) && message) {
                    await User.charge(auth.user.id, 'common', amount, message)
                }
                response.ok(null, 'done');

            } else {
                response.badRequest(__('Invalid Trap', antl), null);

            }
            // response.status(202)
            //     .send()
        } catch (err) {
            console.log(err);
        }
    }
}
