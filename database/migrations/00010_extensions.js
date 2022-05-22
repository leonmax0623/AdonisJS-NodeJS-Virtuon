'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

module.exports = class AuthItemsSchema extends Schema {
  up () {
    this.createExtensionIfNotExists('pgcrypto')
    this.createExtensionIfNotExists('uuid-ossp')
  }

  down () {
    //
  }
}
