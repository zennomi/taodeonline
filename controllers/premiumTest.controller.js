const Test = require("../models/test.model");
const Question = require("../models/question.model");
const Result = require("../models/result.model");
const shuffle = require('shuffle-array');
const groupArray = require('group-array');

const {toInlineElement} = require("../ultils/handleFormat");

module.exports.view = async (req, res) => {
    let test, results;
    try {
        test = await Test.findById(req.params.id).populate('questions');
        if (!test) throw new Error("Không tim thấy bài test có id này.");
        results = await Result.find({ "user.facebook_id": req.user.id, test_id: test._id });
    } catch (err) {
        return res.send(err);
    }
    res.render('tests/premium/view', {test, results});
}

module.exports.do = async (req, res) => {
    let config = req.body;
    let test, results;
    try {
        test = await Test.findById(req.params.id).populate('questions');
        if (!test) throw new Error("Không tim thấy bài test có id này.");
        results = await Result.find({ "user.facebook_id": req.user.id, test_id: test._id });
    } catch (err) {
        return res.send(err);
    }
    test.questions.forEach(q => {
        q.question = toInlineElement(q.question);
        q.choices.forEach(a => {
            a.content = toInlineElement(a.content);
        })
        q.maxLengthAnswer = Math.max(...q.choices.map(a => a.content.length));
        if (!q.level) q.level = 11;
        if (config.shuffleOptions == 'on')
            q.choices = shuffle(q.choices);
    });
    if (config.time > 0 && config.time < 200) {
        test.time = config.time
    }
    test.questions.sort((a, b) => a.level - b.level);
    // shuffle
    if (config.shuffleQuestions == 'on') {
        questionGroups = groupArray(test.questions, 'level');
        test.questions = [];
        for (const level in questionGroups) {
            questionGroups[level] = shuffle(questionGroups[level]);
            test.questions.push(...questionGroups[level])
        }
    }
    res.render('tests/premium/do', { test, link: `${req.hostname}${req.originalUrl}`, results, config });
}