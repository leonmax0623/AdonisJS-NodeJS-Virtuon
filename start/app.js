'use strict'

/*
|--------------------------------------------------------------------------
| Providers
|--------------------------------------------------------------------------
|
| Providers are building blocks for your Adonis app. Anytime you install
| a new Adonis specific package, chances are you will register the
| provider here.
|
*/
const providers = [
  'adonis-scheduler/providers/SchedulerProvider',
  '@adonisjs/lucid/providers/LucidProvider',
  '@adonisjs/bodyparser/providers/BodyParserProvider',
  '@adonisjs/auth/providers/AuthProvider',
  'adonis-bumblebee/providers/BumblebeeProvider',
  '@adonisjs/framework/providers/AppProvider',
  '@adonisjs/session/providers/SessionProvider',
  '@adonisjs/framework/providers/ViewProvider',
  '@alt-point/notificator/providers/NotifyProvider',
  '@adonisjs/validator/providers/ValidatorProvider',
  '@adonisjs/antl/providers/AntlProvider'
]

/*
|--------------------------------------------------------------------------
| Ace Providers
|--------------------------------------------------------------------------
|
| Ace providers are required only when running ace commands. For example
| Providers for migrations, tests etc.
|
*/
const aceProviders = [
  '@adonisjs/lucid/providers/MigrationsProvider',
  'adonis-scheduler/providers/CommandsProvider',
  'adonis-bumblebee/providers/CommandsProvider',
]

/*
|--------------------------------------------------------------------------
| Aliases
|--------------------------------------------------------------------------
|
| Aliases are short unique names for IoC container bindings. You are free
| to create your own aliases.
|
| For example:
|   { Route: 'Adonis/Src/Route' }
|
*/
const aliases = {
  Scheduler: 'Adonis/Addons/Scheduler',
}

/*
|--------------------------------------------------------------------------
| Commands
|--------------------------------------------------------------------------
|
| Here you store ace commands for your package
|
*/
const commands = []

module.exports = { providers, aceProviders, aliases, commands }
