const Test = require("../models/test.model");
const Question = require("../models/question.model");
const Result = require("../models/result.model");
const shuffle = require('shuffle-array');
const groupArray = require('group-array');

module.exports.index = (req, res) => {
    Test.find({}).exec((err, tests) => {
        if (err) return res.send("Error.");

        res.render('tests/index', { tests });
    })
}

module.exports.do = (req, res) => {
    let retryTimes = req.cookies.retryTimes ? Number(req.cookies.retryTimes) + 1 : 1;
    Test.findById(req.params.id).populate('questions').exec((err, test) => {
        if (err || !test) return res.send('Error');
        if (!test.time) test.time = 40;
        test.questions.forEach(q => {
            q.question = toInlineElement(q.question);
            q.choices.forEach(a => {
                a.content = toInlineElement(a.content);
            })
            q.maxLengthAnswer = Math.max(...q.choices.map(a => a.content.length));
            if (!q.level) q.level = 11;
            q.choices = shuffle(q.choices);
        });
        // shuffle
        test.questions.sort((a, b) => a.level - b.level);
        questionGroups = groupArray(test.questions, 'level');
        test.questions = [];
        for (const level in questionGroups) {
            questionGroups[level] = shuffle(questionGroups[level]);
            test.questions.push(...questionGroups[level])
        }
        res.render('tests/do', { test, link: `${req.hostname}${req.originalUrl}` });
    })
}

module.exports.create = async (req, res) => {
    let ids = req.cookies.questions ? req.cookies.questions.ids : [];

    let matchedQuestions = await Question.find({ _id: { $in: ids } });
    matchedQuestions.forEach(q => {
        q.question = toInlineElement(q.question);
        q.choices.forEach(a => {
            a.content = toInlineElement(a.content);
        })
        q.maxLengthAnswer = Math.max(...q.choices.map(a => a.content.length));
    });
    matchedQuestions.sort((a, b) => ids.indexOf(a._id.toString()) - ids.indexOf(b._id.toString()))
    res.render('tests/create', { matchedQuestions });
}

module.exports.autoCreate = (req, res) => {
    res.render('tests/auto-create.pug')
}

module.exports.postAutoCreate = async (req, res) => {
    let numberOfGroups = req.body.numberOfQuestions.length;
    let matchedQuestions = [];
    for (let i = 0; i < numberOfGroups; i++) {
        let questions = await Question.find({
            _id: { $nin: matchedQuestions.map(q => q._id) },
            level: { $lt: Number(req.body.max_level[i]), $gt: Number(req.body.min_level[i]) },
            main_tags: { $elemMatch: { value: { $in: JSON.parse(req.body.tags[i]).map(e => e.value) } } }
        }).limit(Number(req.body.numberOfQuestions[i]));
        matchedQuestions.push(...questions);
    }
    matchedQuestions.forEach(q => {
        q.question = toInlineElement(q.question);
        q.choices.forEach(a => {
            a.content = toInlineElement(a.content);
        })
        q.maxLengthAnswer = Math.max(...q.choices.map(a => a.content.length));
    });
    res.cookie('questions', { ids: [...matchedQuestions.sort((a, b) => a.level - b.level).map(q => q._id)] }, { expires: new Date(Date.now() + 7 * 24 * 3600), httpOnly: true });
    res.redirect('/tests/create');
}

module.exports.view = async (req, res) => {
    let matchedTest = await Test.findById(req.params.id).populate('questions');
    let trueChoiceIds = [], trueChoices = [];
    matchedTest.questions.forEach((q, i) => {
        trueChoices.push(...q.getTrueChoiceArray().map(q => { return { id: q, index: i } }));
    });
    trueChoiceIds = trueChoices.map(c => String(c.id));
    let matchedResults = await Result.find({ test_id: req.params.id });

    matchedTest.questions.forEach(q => {
        q.question = toInlineElement(q.question);
        q.choices.forEach(a => {
            a.content = toInlineElement(a.content);
        }),
            q.trueTimes = 0;
    });
    matchedResults.forEach(result => {
        let mark = 0;
        let earliest = 0;
        console.log(result.choices);
        if (result.choices.length > 0) earliest = Math.min(...result.choices.map(c => c.moment ? c.moment.getTime() : 0));
        result.choices.forEach(c => {
            let index = trueChoiceIds.indexOf(String(c.choice_id));
            if (index > -1) {
                mark++;
                matchedTest.questions[trueChoices[index].index].trueTimes++;
            }
            c.moment = c.moment ? c.moment.getTime() - earliest : 0;
        })
        result.mark = mark / trueChoiceIds.length * 10;
    })
    res.render('tests/view', { test: matchedTest, results: matchedResults });
}

module.exports.edit = (req, res) => {
    Test.findById(req.params.id).exec((err, test) => {
        if (err) return res.send(err);
        if (test.deadline) test.deadline = new Date(test.deadline.getTime() + 7 * 24 * 3600);
        res.render('tests/edit', { test });
    })
}

module.exports.postEdit = (req, res) => {
    Test.findById(req.params.id).exec((err, test) => {
        if (err) return res.send(err);
        test.name = req.body.name;
        test.time = req.body.time;
        if (req.body.deadline) test.deadline = new Date(req.body.deadline);
        test.save((err, test) => {
            if (err) return res.send(err);
            res.redirect('/tests/' + test._id + '/view');
        })
    })
}

module.exports.delete = (req, res) => {
    Test.findById(req.params.id).exec((err, test) => {
        if (err) return res.send(err);
        res.render('tests/delete', { test });
    })
}

module.exports.viewResult = async (req, res) => {
    let result;
    try {
        result = await Result.findById(req.params.resultId).populate({ path: 'test_id', populate: { path: 'questions' } });
        if (!result.test_id) throw new Error('Not Found Test');
    } catch (err) {
        return res.status(404).send(err);
    }
    let trueChoiceIds = [], selectedChoiceIds = result.choices.map(c => c.choice_id);
    result.test_id.questions.forEach(q => {
        trueChoiceIds.push(...q.getTrueChoiceArray());
    })
    res.render('tests/view-result', {result, trueChoiceIds, selectedChoiceIds});
}

module.exports.postDelete = async (req, res) => {
    await Test.findByIdAndDelete(req.params.id);
    await Result.deleteMany({ test_id: req.params.id });
    res.redirect('/tests')
}

module.exports.guide = (req, res) => {
    res.render('tests/guide');
}

function toInlineElement(ele) {
    // ele = ele.split("");
    // ele.splice(0, 3);
    // ele.splice(ele.length - 4, 4);
    // return ele.join("");
    return ele.replace(/<p>(.*)<\/p>/, "$1");
}