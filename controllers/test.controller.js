const Test = require("../models/test.model");
const Question = require("../models/question.model");

module.exports.index = (req, res) => {
    Test.find({}).exec((err, tests) => {
        if (err) return res.send("Error.");

        res.render('tests/index', {tests});
    })
}

module.exports.view = (req, res) => {
    Test.findById(req.params.id).populate('questions').exec((err, test) => {
        if (err || !test) return res.send('Error');
        console.log()
        res.render('tests/view', {test});
    })
}

module.exports.create = async (req, res) => {
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
    res.render('tests/create', { matchedQuestions });
}