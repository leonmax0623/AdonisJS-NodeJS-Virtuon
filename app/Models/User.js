'use strict'

const Model = use('Model')
const { raw } = use('Database')
const { sum } = use('lodash')

class User extends Model {

  static boot() {
    super.boot()

    /**
     * A hook to bash the user password before saving
     * it to the database.
     *
     * Look at `app/Models/Hooks/User.js` file to
     * check the hashPassword method
     */

    this.addHook('beforeCreate', 'User.hashPassword')
    this.addHook('beforeUpdate', 'User.hashPassword')
    this.addHook('afterCreate', 'User.createAccount')
  }

  static get primaryKey() {
    return 'id'
  }

  static get hidden() {
    return ['password']
  }

  static get dates() {
    return super.dates.concat(['last_login'])
  }

  accounts() {
    return this.hasMany('App/Models/Account', 'id', 'user_id')
  }


  dreams() {
    return this.belongsToMany('App/Models/Dream', 'user_id', 'dream_id').pivotTable('dreams_users').pivotPrimaryKey(null)
  }

  dreamusers() {
    return this.hasMany('App/Models/DreamUsers', 'id', 'user_id')
  }

  transactions() {
    return this.manyThrough('App/Models/Account', 'transactions')
  }

  userdeposites() {
    return this.hasMany('App/Models/UserDeposites', 'id', 'user_id')
  }

  orders() {
    return this.hasMany('App/Models/UserOrders', 'id', 'user_id')
  }

  // transactions() {
  //   return this.hasMany('App/Models/Transaction', 'id', 'user_id')
  // }

  shift() {
    return this.shifts()
      .where('end', '>=', raw('now()'))
      .orderBy('begin')
      .first()
  }


  shifts() {
    return this.belongsToMany('App/Models/Shift', 'user_id', 'shift_id')
      .pivotTable('shifts_users')
      .withTimestamps()
  }

  balance(account) {
    return this.accounts()
      .where(builder => {
        if (account) {
          builder.where('type', account)
        }
      })
      .fetch()
      .then(({ rows }) => {
        const balances = []

        rows.forEach(account => balances.push(account.balance()))

        return Promise.all(balances)
      })
      .then(sum)
  }

  tokens() {
    return this.hasMany('App/Models/User/Token', 'id', 'user_id')
  }

  async ratioOne() {
    const balance = await this.balance('dream')
    const ratio = balance / this.target

    return Number.isFinite(ratio) ? ratio : 0
  }

  async ratioTwo() {
    const [balanceSweets, balancePodushka] = await Promise.all([
      this.balance('wallet'),
      this.balance('podushka'),
    ])

    // const ratio = (balancePodushka / balanceSweets) / 3
    const success = (balanceSweets > 0)
      ? (balancePodushka >= (balanceSweets * 3))
      : false

    // return Number.isFinite(ratio) ? ratio : 0
    return success ? 0.25 : 0
  }
}

module.exports = User
