'use strict'

const Event = use('Event')
const TransactionListener = use('App/Listeners/TransactionListener')
const TrapListener = use('App/Listeners/TrapListener')
const ScenarioListener = use('App/Listeners/ScenarioListener')

Event.on('transaction::created', TransactionListener.created)
Event.on('trap::issue', TrapListener.issue)
Event.on('scenario::videoMessage', ScenarioListener.videoMessage)
Event.on('scenario::mailMessage', ScenarioListener.mailMessage)
Event.on('scenario::assignementQuestion', ScenarioListener.assignementQuestion)


