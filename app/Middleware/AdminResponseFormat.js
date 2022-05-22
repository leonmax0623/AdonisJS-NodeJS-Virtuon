'use strict'
const fs = use('fs')
const __ = use('App/Helpers/string-localize')
class AdminResponseFormat {
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
			'dream_id.required': __('Dream is required', antl),
			'name.required': __('Name is required', antl),
			'value.required': __('Dream Value is required', antl),
			'value.number': __('Dream Value must be number', antl),
			'description.required': __('Description is required', antl),
			'loan_amount.required': __('Loan Amount is required', antl),
			'loan_amount.number': __('Loan Amount must be number', antl),
			'credit_rate.required': __('Rate is required', antl),
			'credit_rate.number': __('Rate must be number', antl),
			'cap_deposit_period.required': __('Deposit Period is required', antl),
			'cap_deposit_period.number': __('Deposit Period must be number', antl),
			'cap_deposit_rate.required': __('Deposit Rate is required', antl),
			'cap_deposit_rate.number': __('Deposit Rate must be number', antl),
			'deposit_period.required': __('Deposit Period is required', antl),
			'deposit_period.number': __('Deposit Period must be number', antl),
			'deposit_rate.required': __('Deposit Rate must be number', antl),
			'deposit_rate.number': __('Deposit Rate is required', antl),
			'wallet_transfer.required': __('Wallet Amount is required', antl),
			'wallet_transfer.number': __('Wallet Amount must be number', antl),
			'dream_transfer.required': __('Dream Transfer Amount is required', antl),
			'dream_transfer.number': __('Dream Transfer Amount must be number', antl),
			'financial_safety_transfer.required': __('Financial safety cushion Amount is required', antl),
			'financial_safety_transfer.number': __('Financial safety cushion Amount must be number', antl),
			'cushion_number.required': __('Cushion Number is required', antl),
			'cushion_number.number': __('Cushion Number must be number', antl),
			'accname.required': __('Account Name is required', antl),
			'acctype.required': __('Account Type is required', antl),
			'question_title.required': __('Question Title is required', antl),

		}

		await next()
	}
}

module.exports = AdminResponseFormat
