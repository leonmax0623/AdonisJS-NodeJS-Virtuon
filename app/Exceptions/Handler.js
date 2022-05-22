'use strict'

const BaseExceptionHandler = use('BaseExceptionHandler')
const Logger = use('Logger')
const __ = use('App/Helpers/string-localize')

/**
 * This class handles all exceptions thrown during
 * the HTTP request lifecycle.
 *
 * @class ExceptionHandler
 */
class ExceptionHandler extends BaseExceptionHandler {
  /**
   * Handle exception thrown during the HTTP lifecycle
   *
   * @method handle
   *
   * @param  {Object} error
   * @param  {Object} options.request
   * @param  {Object} options.response
   *
   * @return {void}
   */
  async handle(error, { request, response, antl }) {
    const language = request.header('Accept-Language')
    const langs = ['en', 'ru']
    if (langs.indexOf(language) > -1) {
      //In the array!
      antl.switchLocale(language)
    } else {
      //Not in the array
      antl.switchLocale('en')
    }

    var newResponse = {
      status: 400,
      message: __('Something went wrong. Please try again.', antl),
      data: {}
    }
    response.badRequest(newResponse)
  }

  /**
   * Report exception for logging or debugging.
   *
   * @method report
   *
   * @param  {Object} error
   * @param  {Object} options.request
   *
   * @return {void}
   */
  async report(error, { request }) {
  }
}

module.exports = ExceptionHandler
