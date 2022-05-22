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
const User = use('App/Repo/User')
const Database = use('Database')

class DefaultAdminSeeder {
  async run() {
    await Database.raw('TRUNCATE users CASCADE')
    await User.model.create({
      username: 'admin',
      password: 'admin',
      email: 'admin@gmail.com',
      is_admin: true,
      status: '1',
    })
  }
}

module.exports = DefaultAdminSeeder
