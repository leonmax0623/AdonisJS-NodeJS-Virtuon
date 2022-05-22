'use strict'

const AccountType = use("App/Models/AccountType");
const Account = use('App/Models/Account')
const Hash = use('Hash')

const UserHook = module.exports = {}

/**
 * Hash using password as a hook.
 *
 * @method
 *
 * @param  {Object} userInstance
 *
 * @return {void}
 */
UserHook.hashPassword = async (userInstance) => {
  if (userInstance.dirty.password) {
    userInstance.password = await Hash.make(userInstance.password)
  }
}

UserHook.createAccount = async (user) => {
  await AccountType.query().where({ 'is_default': 1 }).fetch()
    .then(({ rows }) => rows)
    .then(types => {
      types.forEach(async type => {
        if (type.name != 'dream') {
          await Account.create({ 'user_id': user.id, 'label': type.value, type: type.name });
        }
      })
    });
}

UserHook.changeAccountLabel = async (accounts) => {
  accounts.forEach(async account => {
    const accnt = await Account.query().where({ 'id': account.id }).with('accountType').first();
    const acc = accnt.toJSON();
    if (acc.accountType.is_default == 1) {
      account.label = acc.accountType.value;
    }
  });
}

UserHook.changeAccountLabelBeforeSave = async (account) => {
  const accType = await AccountType.query().where({ 'name': account.type }).first();
  if (accType.is_default == 1) {
    account.label = accType.value;
  }
}
