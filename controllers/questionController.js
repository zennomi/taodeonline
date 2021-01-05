const Question = require("../models/question.model");
const texToMathML = require('../ultils/mathml').texToMathML;

module.exports.create = (req, res) => {
    res.render('questions/create');
}

module.exports.postCreate = async (req, res) => {
    let question = new Question({
        question: texToMathML(req.body.question_content),
        choices: [],
        answer: texToMathML(req.body.detailed_answer)
    })

    let truthyChoices = req.body.answer_true.map(a => Number(a));
    req.body.answer_content.forEach((ans, i) => {
        question.choices[i] = {};
        question.choices[i].content = texToMathML(ans);
        if (truthyChoices.indexOf(i) > -1) question.choices[i].isTrue = true;
        else question.choices[i].isTrue = false;
    })
    await question.save();
    res.redirect('/questions/' + question._id);
}

module.exports.index = (req, res) => {
    let indexPage = req.query.p ? Number(req.query.p)-1 : 0;
    
    Question.find({}, null, function (err, questions) {

        res.render('questions/index', {
            questions: questions,
            numberOfQuestions: req.cookies.questions ? req.cookies.questions.ids.length : 0,
            currentPage: indexPage
        });
    }).limit(10).skip(indexPage*10);
}

module.exports.export = async (req, res) => {

    let ids = req.cookies.questions ? req.cookies.questions.ids : [];

    function toInlineElement(ele) {
        // ele = ele.split("");
        // ele.splice(0, 3);
        // ele.splice(ele.length - 4, 4);
        // return ele.join("");
        return ele.replace(/<p>(.*)<\/p>/, "$1");
    }

    let matchedQuestions = await Question.find({ _id: { $in: ids } });
    matchedQuestions.forEach(q => {
        q.question = toInlineElement(q.question);
        q.choices.forEach(a => {
            a.content = toInlineElement(a.content);
        })
        q.maxLengthAnswer = Math.max(...q.choices.map(a => a.content.length));
    });
    let unmatchedQuestions = await Question.find({ _id: { $nin: ids } });
    unmatchedQuestions.forEach(q => {
        q.question = toInlineElement(q.question);
        q.choices.forEach(a => {
            a.content = toInlineElement(a.content);
        })
        q.maxLengthAnswer = Math.max(...q.choices.map(a => a.content.length));
    });
    res.render('questions/export', { matchedQuestions, unmatchedQuestions });
}

module.exports.view = (req, res) => {
    Question.findById(req.params.id, null, function (err, question) {
        res.render('questions/view', { question })
    })
}

module.exports.edit = (req, res) => {
    Question.findById(req.params.id, null, function (err, question) {
        res.render('questions/edit', { question });
    })
}

module.exports.postEdit = async (req, res) => {
    let question = await Question.findById(req.params.id);
    question.question = texToMathML(req.body.question_content);
    question.answer = texToMathML(req.body.detailed_answer);
    let truthyChoices = req.body.answer_true.map(a => Number(a));
    req.body.answer_content.forEach((ans, i) => {
        question.choices[i] = {};
        question.choices[i].content = texToMathML(ans);
        if (truthyChoices.indexOf(i) > -1) question.choices[i].isTrue = true;
        else question.choices[i].isTrue = false;
    })
    await question.save();
    res.redirect('/questions/' + question._id);
}

module.exports.delete = (req, res) => {
    Question.findByIdAndDelete(req.params.id, null, function (err, question) {
        res.redirect('/questions');
    })
}

