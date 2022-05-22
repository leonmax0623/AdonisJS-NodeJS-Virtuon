'use strict'

const Model = use('Model')
const Env = use('Env')

module.exports = class ScenarioVideo extends Model
{
    static boot() {
        super.boot();
        this.addHook('afterFetch', function (types) {
            types.forEach(type => {
                if(type.video != ''){
                    // type.video =   Env.get('IMG_URL') + '/img/' + type.video
                }
            });
        })
    }

    static get table() {
        return 'scenario_video'
    }
}
