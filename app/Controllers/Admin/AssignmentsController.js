'use strict'


const UserRepo = use('App/Repo/User')
const User = use('App/Models/User')
const Assignments = use('App/Models/Assignments')
const AssignmentQuestions = use('App/Models/AssignmentQuestions')
const AssignmentOptions = use('App/Models/AssignmentOptions')
const UserOrders = use('App/Models/UserOrders')
const Logger = use('Logger')
const __ = use('App/Helpers/string-localize');
const { validate } = use('Validator');
const Env = use('Env')
const moment = use('moment')
const Property = use('App/Models/Property')
const Shift = use('App/Models/Shift')
const { validateAll } = use('Validator');
const Helpers = use('Helpers')


module.exports = class ScholarshipController {
    async assignmentList({ view }) {
        try {
            const assignments = await Assignments.query()
                .orderBy('created_at')
                .fetch()
                .then(({ rows }) => rows)
            return view.render('admin.assignments.index', { assignments });
        } catch (err) {
            console.log(err);
        }
    }

    async assignmentAdd({ view, request, response, session }) {
        try {
            const method = request.method();

            if (method == "GET") {
                const actionUrl = "/admin/assignments/add";
                return view.render('admin.assignments.view', { actionUrl })
            }
            if (method == "POST") {
                const rules = {
                    title: 'required',
                    description: 'required'
                }
                const validation = await validateAll(request.all(), rules, request.VaildateMessage)
                if (validation.fails()) {
                    session
                        .withErrors(validation.messages())
                        .flashExcept(['password'])
                    return response.redirect('back')
                } else {
                    try {
                        const parameter = request.all();
                        const assignments = new Assignments;
                        assignments.title = parameter.title;
                        assignments.description = parameter.description;
                        assignments.file_type = parameter.file_type;
                        assignments.url = parameter.url;
                        const picture = request.file('video');
                        if (picture) {
                            let imgName = moment().format('h_mm_s_DD_MM_YYYY') + '_' + picture.clientName;
                            await picture.move(Helpers.tmpPath('../public/img'), {
                                name: imgName,
                                overwrite: true
                            })
                            assignments.file = imgName;
                        }
                        await assignments.save();
                        const assignments_id = assignments.id;
                        return response.redirect('/admin/assignments/edit/' + assignments_id);
                    } catch (err) {
                        console.log(err);
                    }
                }
            }
        } catch (err) {
            console.log(err);
        }
    }

    async assignmentEdit({ params: { id }, view, request, response, session }) {
        const method = request.method();
        if (method == "GET") {
            const assignment = await Assignments.query().where({ id: id })
                .with('assignmentquestions', (aquestions) => {
                    aquestions.with('assignmentoptions');
                }).first();
            var questions = '';
            if (assignment.toJSON() && assignment.toJSON().assignmentquestions) {
                questions = assignment.toJSON().assignmentquestions;
            }
            const actionUrl = "/admin/assignments/edit/" + assignment.id;
            const quetionActionUrl = "/admin/assignments/question/add/" + assignment.id;
            return view.render('admin.assignments.view', { assignment, actionUrl, questions, quetionActionUrl })
        }
        if (method == "POST") {
            const rules = {
                title: 'required',
                description: 'required'
            }
            const validation = await validateAll(request.all(), rules, request.VaildateMessage)
            if (validation.fails()) {
                session
                    .withErrors(validation.messages())
                    .flashExcept(['password'])
                return response.redirect('back')
            } else {
                try {
                    const parameter = request.all();
                    const assignments = await Assignments.find(id);
                    assignments.title = parameter.title;
                    assignments.description = parameter.description;
                    assignments.file_type = parameter.file_type;
                    assignments.url = parameter.url;
                    const picture = request.file('video');
                    if (picture) {
                        let imgName = moment().format('h_mm_s_DD_MM_YYYY') + '_' + picture.clientName;
                        await picture.move(Helpers.tmpPath('../public/img'), {
                            name: imgName,
                            overwrite: true
                        })
                        assignments.file = imgName;
                    }
                    await assignments.save();
                    const assignments_id = assignments.id;
                    return response.redirect('/admin/assignments');
                } catch (err) {
                    console.log(err);
                }
            }
        }
    }

    async assignmentDelete({ params: { id }, response }) {
        try {
            await AssignmentOptions.query().where({ 'assignment_id': id }).delete();
            await Assignments.query().where({ 'id': id }).delete();
            return response.redirect('/admin/assignments');
        } catch (err) {
            console.log(err);
        }

    }

    async assignmentQuestionDelete({ params: { id, assignmentId }, response }) {
        try {
            await AssignmentOptions.query().where({ 'questions_id': id }).delete();
            await AssignmentQuestions.query().where({ 'id': id }).delete();
            return response.redirect('/admin/assignments/edit/' + assignmentId);
        } catch (err) {
            console.log(err);
        }
    }


    async assignmentQuestionAdd({ params: { id }, view, request, response, session }) {
        try {
            const method = request.method();
            if (method == "POST") {
                const rules = {
                    question_title: 'required'
                }
                const validation = await validateAll(request.all(), rules, request.VaildateMessage)
                if (validation.fails()) {
                    session
                        .withErrors(validation.messages())
                        .flashExcept(['password'])
                    return response.redirect('back')
                } else {
                    try {
                        const parameter = request.all();
                        const aQuestions = new AssignmentQuestions;
                        aQuestions.assignment_id = id;
                        aQuestions.title = parameter.question_title;
                        aQuestions.status = 1;
                        await aQuestions.save();
                        const questions_id = aQuestions.id;
                        await parameter.option_title.forEach(async (options, index) => {
                            if ((parameter.option_title.length - 1) > index) {
                                const assignmentoptions = new AssignmentOptions();
                                assignmentoptions.questions_id = questions_id;
                                assignmentoptions.option_title = options;
                                assignmentoptions.reward = parameter.reward[index];
                                assignmentoptions.status = parameter.status[index];
                                await assignmentoptions.save();
                            }
                        });
                        return response.redirect('/admin/assignments/edit/' + id);
                    } catch (err) {
                        console.log(err);
                    }
                }
            }
        } catch (err) {
            console.log(err);
        }
    }
}