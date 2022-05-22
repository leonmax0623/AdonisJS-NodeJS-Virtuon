'use strict'

/*
|--------------------------------------------------------------------------
| DefaultAdminSeeder
|--------------------------------------------------------------------------
|
| Make use of the Factory instance to seed database with dummy data or
| make use of Lucid models directly.
|
*/

/** @type {import('@adonisjs/lucid/src/Factory')} */
const Factory = use('Factory')
const Financial = use('App/Models/Financial')

class DefaultFinancialSeeder {

  async run() {
    await Financial.truncate();
    const financials = [
      {
        key: 'name',
        value: 'Basic Setting',
        status: '1',
        type_id: 1
      },
      {
        key: 'description',
        value: 'description',
        status: '1',
        type_id: 1
      },
      {
        key: 'picture',
        value: 'user.png',
        status: '1',
        type_id: 1
      },
      {
        key: 'loan_amount',
        value: '80',
        status: '1',
        type_id: 5
      },
      {
        key: 'loan_period',
        value: '21',
        status: '1',
        type_id: 5
      },
      {
        key: 'credit_rate',
        value: '10',
        status: '1',
        type_id: 5
      },
      {
        key: 'deposit_period',
        value: '21',
        status: '1',
        type_id: 6
      },
      {
        key: 'deposit_rate',
        value: '10',
        status: '1',
        type_id: 6
      },
      {
        key: 'cap_deposit_period',
        value: '21',
        status: '1',
        type_id: 6
      },
      {
        key: 'cap_deposit_rate',
        value: '10',
        status: '1',
        type_id: 6
      },
      {
        key: 'wallet_transfer',
        value: '90',
        status: '1',
        type_id: 7
      },
      {
        key: 'dream_transfer',
        value: '90',
        status: '1',
        type_id: 4
      },
      {
        key: 'financial_safety_transfer',
        value: '90',
        status: '1',
        type_id: 2
      },
      {
        key: 'cushion_number',
        value: '2',
        status: '1',
        type_id: 2
      }
    ]

    for (let i = 0; i < financials.length; i++) {
      await Financial.create({
        ...financials[i],
      })
    }
  }
}

module.exports = DefaultFinancialSeeder
