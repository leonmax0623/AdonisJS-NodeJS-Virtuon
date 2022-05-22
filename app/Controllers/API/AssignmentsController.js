'use strict'
const Assignments = use('App/Models/Assignments')
const AssignmentQuestions = use('App/Models/AssignmentQuestions')
const AssignmentOptions = use('App/Models/AssignmentOptions')
const UserAssignmentLogs = use('App/Models/UserAssignmentLogs')
const ScenarioDayAssignment = use('App/Models/ScenarioDayAssignment')
const User = use('App/Repo/User')
const __ = use('App/Helpers/string-localize');
const { validate } = use('Validator');
const moment = require('moment')


module.exports = class AssignmentsController {
    async apply({ auth, request, response, antl }) {
        try {
            const userInfo = await auth.getUser();
            if (userInfo) {
                const rules = {
                    assignment_id: 'required',
                    question_id: 'required',
                    option_id: 'required'
                }
                const parameter = request.all();
                const validation = await validate(request.all(), rules, request.VaildateMessage)
                if (validation.fails()) {
                    response.badRequest(__('Validation Error', antl), validation.messages());
                } else {
                    // Check assigment Is Valid Or Not
                    const assignment = await Assignments.find(parameter.assignment_id);
                    if (assignment) {
                        // Count User Current Day
                        var userDay = moment(moment()).diff(userInfo.created_at, 'days') + 1;
                        if (userDay > 21) {
                            // Change user day if register day is more than 21
                            const newDay = Math.trunc(Math.abs(userDay / 21))
                            userDay = newDay;
                        }
                        // Get assignment day
                        const assignmentDay = await ScenarioDayAssignment.query().where({
                            'assignment_id': parameter.assignment_id, 'day': userDay
                        }).first();
                        // Check assignment day and user day must be same for give question anwser
                        if (assignmentDay) {
                            const assignmentQuestion = await AssignmentQuestions.find(parameter.question_id);
                            if (assignmentQuestion) {
                                // Check Option Is Valid Or Not
                                const assignmentoptions = await AssignmentOptions.find(parameter.option_id);
                                if (assignmentoptions) {
                                    // Check User Already Submit Question
                                    const assignmentLogs = await UserAssignmentLogs.query().where({
                                        'user_id': userInfo.id, 'assignment_id': assignmentQuestion.assignment_id, 'question_id': parameter.question_id, 'day': userDay
                                    }).first();

                                    let submitAnswer = true;
                                    if (assignmentLogs) {
                                        // Count days of submit question
                                        var day = moment(moment()).diff(assignmentLogs.created_at, 'days') + 1;
                                        if (day < 22) {
                                            submitAnswer = false; // If question submit days less than 22 so user not submit this question
                                        }
                                    }
                                    if (submitAnswer) {
                                        // Create Question Anwser Log
                                        const newAssignmentLog = new UserAssignmentLogs();
                                        newAssignmentLog.user_id = userInfo.id;
                                        newAssignmentLog.assignment_id = assignmentQuestion.assignment_id;
                                        newAssignmentLog.question_id = parameter.question_id;
                                        newAssignmentLog.reward = assignmentoptions.reward;
                                        newAssignmentLog.day = userDay;
                                        await newAssignmentLog.save();
                                        // Check Option is right or wrong
                                        if (assignmentoptions.status == '1') {
                                            // Create transaction of question reward if option is write 
                                            await User.charge(auth.user.id, 'common', assignmentoptions.reward, 'Получить награду за задание');
                                            response.ok(__("Reward credited", antl), null);
                                        } else {
                                            //  throw error for Wrong Anwser
                                            response.badRequest(__('Wrong Answer', antl), null);
                                        }
                                    } else {
                                        response.badRequest(__('You have already submitted this question', antl), null);
                                    }

                                } else {
                                    response.badRequest(__('Invalid Option', antl), null);
                                }
                            } else {
                                response.badRequest(__('Invalid Question', antl), null);
                            }
                        } else {
                            // Throw error if assignment day and user day not same
                            response.badRequest(__('Assignment was expired', antl), null);
                        }
                    } else {
                        response.badRequest(__('Invalid Assignment', antl), null);
                    }
                }
            } else {
                response.badRequest(__('Invalid User', antl), null);
            }
        } catch (err) {
            console.log(err);
            response.badRequest(__('Something went wrong. Please try again.', antl), null);
        }
    }
}
