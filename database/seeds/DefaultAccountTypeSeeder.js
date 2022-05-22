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
const AccountType = use('App/Models/AccountType')
const Database = use('Database')

class DefaultAccountTypeSeeder {

  async run() {
    const accType = [
      {
        name: 'common',
        value: 'Основной',
        icon: '',
        description: 'description',
        status: '1',
        is_default: 1,
        type_id: '1'
      },
      {
        name: 'podushka',
        value: 'Подушка',
        icon: '',
        description: 'description',
        status: '1',
        is_default: 1,
        type_id: '2'
      },
      {
        name: 'dream',
        value: 'Мечта',
        icon: '',
        description: 'description',
        status: '1',
        is_default: 1,
        type_id: '4'
      },
      {
        name: 'credit',
        value: 'Кредит',
        icon: '',
        description: 'description',
        status: '1',
        is_default: 0,
        type_id: '5'
      },
      {
        name: 'deposit',
        value: 'Вклад',
        icon: '',
        description: 'description',
        status: '1',
        is_default: 0,
        type_id: '6'
      },
      {
        name: 'wallet',
        value: 'Кошелёк',
        icon: '',
        description: 'description',
        status: '1',
        is_default: 0,
        type_id: '7'
      },
      {
        name: 'investment',
        value: 'Инвестиционный',
        icon: '',
        description: 'description',
        status: '1',
        is_default: 0,
        type_id: '8'
      },

    ]
    await Database.raw('TRUNCATE account_types CASCADE')
    for (let i = 0; i < accType.length; i++) {
      await AccountType.create({
        ...accType[i],
      })
    }
  }
}

module.exports = DefaultAccountTypeSeeder
