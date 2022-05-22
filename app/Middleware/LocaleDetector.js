'use strict'
//const Antl = use('Antl')

class LocaleDetector {
	async handle({ request, antl }, next) {
		const language = request.header('Accept-Language')
		const langs = ['en', 'ru']
		if (langs.indexOf(language) > -1) {
			//In the array!
			antl.switchLocale(language)
			await next()
		} else {
			//Not in the array
			antl.switchLocale('en')
			await next()
		}
	}
}

module.exports = LocaleDetector