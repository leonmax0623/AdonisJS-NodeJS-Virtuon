'use strict'

const { LogicalException } = require('@adonisjs/generic-exceptions')

module.exports = class ForbiddenException extends LogicalException
{
    status = 403
}
