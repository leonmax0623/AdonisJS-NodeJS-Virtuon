'use strict'
// 
/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URLs and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.0/routing
|
*/

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')

Route.get('/', () => {
  return `
  <html>
    <head>
      <link rel="stylesheet" href="/style.css" />
    </head>
    <body>
      <section>
        <div class="logo"></div>
        <div class="title"></div>
        <div class="subtitle">
          <p>AdonisJs simplicity will make you feel confident about your code</p>
          <p>
            Don't know where to start? Read the <a href="https://adonisjs.com/docs">documentation</a>.
          </p>    
      </div>
      </section>
    </body>
  </html>
  `
})

Route
  .get('health', async ({ response }) => {
    const Logger = use('Logger')
    const Transaction = use('App/Models/Transaction')
    await Transaction.query()
      .count()
      .then(result => Logger.debug({ result }))

    response.status(200)
      .send()
  })

Route
  .group(() => {
    Route.get('/', 'App/Controllers/API/UserController.info')
      .middleware('auth')

    Route.post('signup', 'App/Controllers/API/UserController.signUp')
    Route.post('signin', 'App/Controllers/API/UserController.signIn')

    Route
      .get('transactions', 'App/Controllers/API/UserController.transactions')
      .middleware('auth')

    Route
      .post('tokens', 'App/Controllers/API/User/TokenController.create')
      .middleware('auth')

    Route
      .delete('tokens/:id?', 'App/Controllers/API/User/TokenController.delete')
      .middleware('auth')
  })
  .prefix('api/user')

Route
  .group(() => {
    Route
      .post('transactions', 'App/Controllers/API/TransactionController.create')

    // Route
    //   .get('rating', 'App/Controllers/API/UserController.rating')
  })
  .prefix('api')
  .middleware('auth')



Route
  .group(() => {
    Route.get('/', 'App/Controllers/Admin/AuthController.signIn')
    Route.post('/', 'App/Controllers/Admin/AuthController.signIn')
  })
  .prefix('admin/auth')
  .middleware('guest')

Route
  .group(() => {
    Route
      .get('/', ({ view }) => {
        return view.render('admin.dashboard')
      })
      .as('admin.dashboard')

    Route
      .get('signout', 'App/Controllers/Admin/AuthController.signOut')
      .as('admin.signout')

    // Управление сменами
    Route
      .get('shifts', 'App/Controllers/Admin/ShiftController.index')
      .as('admin.shift.list')

    Route
      .get('shifts/:id', 'App/Controllers/Admin/ShiftController.view')
      .as('admin.shift.view')

    Route
      .post('shifts/:id', 'App/Controllers/Admin/ShiftController.update')
      .as('admin.shift.update')

    Route
      .get('shifts/:id/invite', 'App/Controllers/Admin/ShiftController.select')
      .as('admin.shift.invite.select')

    Route
      .post('shifts/:id/invite', 'App/Controllers/Admin/ShiftController.invite')
      .as('admin.shift.invite.do')

    Route
      .post('shifts/:id/charge', 'App/Controllers/Admin/ShiftController.charge')
      .as('admin.shift.charge')

    Route
      .post('shifts/:id/scenario', 'App/Controllers/Admin/ShiftController.applyScenario')
      .as('admin.shift.scenario')

    Route
      .get('shifts/:id/event/:event', async ({ params: { id, event }, request, response }) => {
        const ShiftHelper = use('App/Helpers/ShiftHelper')
        const ShiftModel = use('App/Models/Shift')
        const Shift = new ShiftHelper(await ShiftModel.findOrFail(id))

        await Shift[event](request.input('amount'))

        return response.redirect(request.header('referer'))
      })
      .as('admin.shift.event')

    Route
      .get('shifts/:id/trap/:trap_id', async ({ params: { id, trap_id }, request, response }) => {
        const ShiftHelper = use('App/Helpers/ShiftHelper')
        const ShiftModel = use('App/Models/Shift')

        const helper = await ShiftModel.findOrFail(id)
          .then(shift => (new ShiftHelper(shift)))

        await helper.trap(trap_id)

        return response.redirect(request.header('referer'))
      })
      .as('admin.shift.trap')

    // Управление пользователями

    Route
      .get('users/:id/revoke', 'App/Controllers/Admin/UserController.revoke')
      .as('admin.user.revoke-shift')

    Route
      .get('users/:id/toggle', 'App/Controllers/Admin/UserController.toggle')
      .as('admin.user.status-toggle')

    Route
      .get('users/:id/delete', 'App/Controllers/Admin/UserController.delete')
      .as('admin.user.delete')

    Route
      .post('users/:id/charge', 'App/Controllers/Admin/UserController.charge')
      .as('admin.user.charge')

    Route
      .post('accounts/charge', 'App/Controllers/Admin/AccountController.charge')
      .as('admin.account.charge')

    Route
      .get('accounts/:account_id/transactions', ({ response }) => response.send('not implemented'))
      .as('admin.account.transactions')

    // Управление транзакциями
    Route
      .get('transactions/:id/delete', 'App/Controllers/Admin/TransactionController.delete')
      .as('admin.transaction.delete')

  })
  .prefix('admin')
  .middleware(['admin', 'auth:session'])

// Admin Route
Route.group(() => {
  Route.any('/users', 'App/Controllers/Admin/UserController.index').as('user.list');
  Route.any('/users/edit/:id', 'App/Controllers/Admin/UserController.edit').as('user.edit');
  Route.any('/users/account/add/:id', 'App/Controllers/Admin/UserController.addAccount').as('user.account.add');
  Route.any('/users/dream/add/:id', 'App/Controllers/Admin/UserController.addDream').as('user.dream.add');

  Route.any('/dreams', 'App/Controllers/Admin/DreamController.index').as('dream.list');
  Route.any('/dreams/add', 'App/Controllers/Admin/DreamController.add').as('dream.add');
  Route.any('/dreams/edit/:id', 'App/Controllers/Admin/DreamController.edit').as('dream.edit');
  Route.any('/dreams/delete/:id', 'App/Controllers/Admin/DreamController.delete').as('dream.delete');

  Route.any('/financial', 'App/Controllers/Admin/FinancialController.index').as('financial.list');
  Route.any('/financial/edit/:id', 'App/Controllers/Admin/FinancialController.edit').as('financial.edit');

  Route.any('/badges', 'App/Controllers/Admin/StoreController.badges').as('badges.list');
  Route.any('/badges/add', 'App/Controllers/Admin/StoreController.badgesAdd').as('badges.add');
  Route.any('/badges/edit/:id', 'App/Controllers/Admin/StoreController.badgesEdit').as('badges.edit');
  Route.any('/badges/delete/:id', 'App/Controllers/Admin/StoreController.badgesDelete').as('badges.delete');

  Route.any('/property', 'App/Controllers/Admin/StoreController.property').as('property.list');
  Route.any('/property/add', 'App/Controllers/Admin/StoreController.propertyAdd').as('property.add');
  Route.any('/property/edit/:id', 'App/Controllers/Admin/StoreController.propertyEdit').as('property.edit');
  Route.any('/property/delete/:id', 'App/Controllers/Admin/StoreController.propertyDelete').as('property.delete');

  Route.any('/assignments', 'App/Controllers/Admin/AssignmentsController.assignmentList').as('assignments');
  Route.any('/assignments/add', 'App/Controllers/Admin/AssignmentsController.assignmentAdd').as('assignments.add');
  Route.any('/assignments/edit/:id', 'App/Controllers/Admin/AssignmentsController.assignmentEdit').as('assignments.edit');
  Route.any('/assignments/delete/:id', 'App/Controllers/Admin/AssignmentsController.assignmentDelete').as('assignments.delete');
  Route.any('/assignments/question/add/:id', 'App/Controllers/Admin/AssignmentsController.assignmentQuestionAdd').as('assignments.question.add');
  Route.any('/assignments/question/delete/:id/:assignmentId', 'App/Controllers/Admin/AssignmentsController.assignmentQuestionDelete').as('assignments.question.delete');

  Route.any('/scenario', 'App/Controllers/Admin/ScenarionController.index').as('scenario.list');
  Route.any('/scenario/edit/:day', 'App/Controllers/Admin/ScenarionController.edit').as('scenario.edit');
  Route.any('/scenario/update/:type', 'App/Controllers/Admin/ScenarionController.update').as('scenario.update');
  Route.any('/scenario/trap/delete/:id/:day', 'App/Controllers/Admin/ScenarionController.deleteTrap').as('scenario.update');
})
  .prefix('admin')
  .middleware(['adminresponse', 'admin', 'auth:session'])
  .as('admin')
//nelson 20211203
const addPrefixToGroup = (group) => {
  group.prefix('/api/v1').middleware(['response'])
  return group
}

addPrefixToGroup(Route.group(() => {
  Route.post('signup', 'App/Controllers/API/UserController.signUp');
  Route.post('signin', 'App/Controllers/API/UserController.signIn');

}).prefix('/user'));


Route.group(() => {
  Route.get('dreams', 'App/Controllers/API/UserController.dreams');
  Route.get('accounts/types', 'App/Controllers/API/AccountController.accType');
}).prefix('/api/v1').middleware(['response'])


// API Route
Route.group(() => {
  Route.any('user-profile', 'App/Controllers/API/UserController.userProfile').as('user.profile');

  Route.any('accounts', 'App/Controllers/API/AccountController.index').as('user.account.add');
  Route.any('accounts/:account_id/transaction', 'App/Controllers/API/AccountController.transaction').as('user.account.transaction');

  Route.post('user/tokens', 'App/Controllers/API/User/TokenController.create').as('user.token.add')
  Route.delete('user/tokens', 'App/Controllers/API/User/TokenController.delete').as('user.token.delete')

  Route.post('transactions/list', 'App/Controllers/API/TransactionController.index')
  Route.post('transactions', 'App/Controllers/API/TransactionController.create')
  Route.get('transactions/credit', 'App/Controllers/API/TransactionController.credit')
  Route.get('transactions/deposit', 'App/Controllers/API/TransactionController.deposit')

  Route.get('badges', 'App/Controllers/API/StoreController.badgesList');
  Route.post('badges/purchase', 'App/Controllers/API/StoreController.purchaseBadges');

  Route.get('products', 'App/Controllers/API/StoreController.productsList');
  Route.post('products/purchase', 'App/Controllers/API/StoreController.purchaseBadges');

  Route.get('stores', 'App/Controllers/API/StoreController.storeList');
  Route.post('stores/purchase', 'App/Controllers/API/StoreController.storePurchase');

  Route.post('testTransaction', 'App/Controllers/API/UserController.testTransaction').as('user.testTransaction');

  Route.post('trap/:id', 'App/Controllers/API/TrapController.apply');

  Route.post('/assignments/submit', 'App/Controllers/API/AssignmentsController.apply');

  Route.post('/newUserScenario', 'App/Controllers/API/UserController.newUserScenario').as('user.newScenario');

  Route.post('/userNotificationInfo', 'App/Controllers/API/UserController.userNotificationInfo').as('user.userNotificationInfo');
  
  Route.get('/rating', 'App/Controllers/API/UserController.rating')
}).prefix('/api/v1').middleware(['response', 'auth'])

//nelson 20211203