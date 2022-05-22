'use strict'

//const Antl = use('Antl')

module.exports = (message,antl) => {
	try {
	  return antl.formatMessage('app.' + message)
	} catch(error) {
	  return message
	}
}