'use strict'
const fs = use('fs')
const __ = use('App/Helpers/string-localize')
class ResponseFormat {
	/**
	 * Purpose: Generic response middleware
	 * 
	 * @author Nelson Desai
	 * @since Dec 2021
	 * 
	 * @param {response} 
	 * @param {request} 
	 */
	async handle({ request, response, antl }, next) {
		// call next to advance the request
		request.VaildateMessage = {
			'email.required': __('Email is required', antl),
			'email.email': __('Email is invalid', antl),
			'email.unique': __('Email already used by another user', antl),
			'password.required': __('password is required', antl),
			'username.required': __('Username is required', antl),
			'username.unique': __('Username already used by another user', antl),
			'dream_id.required': __('Dream is required', antl),
			'name.required': __('Name is required', antl),
			'value.required': __('Dream Value is required', antl),
			'value.number': __('Dream Value must be number', antl),
			'description.required': __('Description is required', antl),
			'type.required': __('Type is required', antl),
			'dreamName.required_without_any': __('Dream Name Or Dream is required', antl),
			'dreamCost.required_if': __('Dream Cost is required', antl),
			'amount.required': __('Amount is required', antl),
			'amount.number': __('Amount must be number', antl),
			'id.required': __('id is requires', antl),
			'purchase_type.required': __('Purchase type is requires', antl),
			'question_id.required': __('Question Id is requires', antl),
			'option_id.required': __('Option Id is requires', antl),
		}

		await next()

		const existingResponse = response._lazyBody.content
		const method = response._lazyBody.method;
		const statusCode = response.response.statusCode;
		var messageSent = response._lazyBody.content
		if (statusCode == "200") {
			var newResponse = {
				status: 200,
				message: response._lazyBody.content || __('Operation is successfully executed', antl),
				data: response._lazyBody.args[0] || {}
			};
			response.send(newResponse);
		}
		if (statusCode == "400") {
			var newResponse = {
				status: 400,
				message: response._lazyBody.content || __('Operation is successfully executed', antl),
				data: response._lazyBody.args[0] || {}
			};
			response.send(newResponse);
		}
	}
}

module.exports = ResponseFormat
