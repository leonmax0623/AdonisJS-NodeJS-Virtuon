'use strict'

const Model = use('Model')

module.exports = class Financial extends Model {


    static TYPE = {
        loan_amount: 'LOAN_AMOUNT',
        loan_period: 'LOAN_PERIOD',
        credit_rate: 'CREDIT_RATE',
        deposit_period: 'DEPOSIT_PERIOD',
        deposit_rate: 'DEPOSIT_RATE',
        cap_deposit_period: 'CAP_DEPOSIT_PERIOD',
        cap_deposit_rate: 'CAP_DEPOSIT_RATE',
        wallet_transfer: 'WALLET_TRANSFER',
        dream_transfer: 'DREAM_TRANSFER',
        financial_safety_transfer: 'FINANCIAL_SAFETY_TRANSFER',
        cushion_number: 'CUSHION_NUMBER'
    }

    static boot() {
        super.boot()
    }

    static async setting(type) {
        if (Object.keys(this.TYPE).includes(type)) {
            const setting = await Financial.query().fetch().then(({ rows }) => rows);
            const value = await setting.find(setObj => setObj.key === type) ? setting.find(setObj => setObj.key === type).value : process.env[this.TYPE[type]];
            return value;
        } else {
            return `Unknown type: ${type}`;
        }
    }

    accounttype() {
        return this.belongsTo('App/Models/AccountType', 'type_id', 'type_id')
    }

}


