const Test = require("../models/test.model");
const Question = require("../models/question.model");
const Result = require("../models/result.model");
const shuffle = require('shuffle-array');
const groupArray = require('group-array');

module.exports.index = async (req, res) => {
    let tests, results = [];

    // Pagination
    const perPage = 10;
    let indexPage = req.query.p ? Number(req.query.p) - 1 : 0;
    let maxPage = await Test.countDocuments();
    maxPage = Math.ceil(maxPage / perPage);

    try {
        tests = await Test.find({}).limit(perPage).skip(indexPage * perPage).sort({ _id: -1 });
        results = req.user ? await Result.find({ "user.facebook_id": req.user.id }) : [];
    } catch (err) {
        return res.send(err);
    }
    tests.forEach(t => {
        t.count = results.filter(r => String(r.test_id) == String(t._id)).length;
    })
    res.render('tests/index', {
        tests, currentPage: indexPage + 1,
        maxPage: maxPage
    });
}

module.exports.do = (req, res) => {
    let config = {};
    let hour = (new Date()).getHours();
    if (hour > 22 || hour < 5) config.darkmode = 'on';
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
            if (test.isShuffled) q.choices = shuffle(q.choices);
        });
        // shuffle
        if (test.isSorted) test.questions.sort((a, b) => a.level - b.level);
        if (test.isShuffled) {
            questionGroups = groupArray(test.questions, 'level');
            test.questions = [];
            for (const level in questionGroups) {
                questionGroups[level] = shuffle(questionGroups[level]);
                test.questions.push(...questionGroups[level])
            }
        }
        Result.find({ "user.facebook_id": req.user.id, test_id: test._id }).exec((err, results) => {

            res.render('tests/premium/do', { test, link: `${req.hostname}${req.originalUrl}`, results, config });
        })
    })
}

module.exports.pdf = (req, res) => {
    let config = {};
    let hour = (new Date()).getHours();
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
            if (test.isShuffled) q.choices = shuffle(q.choices);
        });
        // shuffle
        if (test.isSorted) test.questions.sort((a, b) => a.level - b.level);
        if (test.isShuffled) {
            questionGroups = groupArray(test.questions, 'level');
            test.questions = [];
            for (const level in questionGroups) {
                questionGroups[level] = shuffle(questionGroups[level]);
                test.questions.push(...questionGroups[level])
            }
        }

        res.render('tests/pdf', { test, link: `${req.hostname}${req.originalUrl}`, config });
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
    let trueChoiceIds = [],
        trueChoices = [];
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

    if (matchedTest.isSorted) matchedTest.questions.sort((a, b) => a.level - b.level);

    matchedResults.forEach(result => {
        let mark = 0;
        let earliest = 0;
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



module.exports.table = async (req, res) => {
    let matchedTest = await Test.findById(req.params.id).populate('questions');
    let trueChoiceIds = [],
        trueChoices = [];
    matchedTest.questions.forEach((q, i) => {
        trueChoices.push(...q.getTrueChoiceArray().map(q => { return { id: q, index: i } }));
    });
    trueChoiceIds = trueChoices.map(c => String(c.id));
    let matchedResults = await Result.find({ test_id: req.params.id });
    matchedResults.forEach(result => {
        let mark = 0;
        let earliest = 0;
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
    res.render('tests/table', { test: matchedTest, results: matchedResults });
}

module.exports.edit = (req, res) => {
    Test.findById(req.params.id).exec((err, test) => {
        if (err) return res.send(err);
        // if (test.deadline) test.deadline = new Date(test.deadline.getTime() + 7 * 24 * 3600);
        res.render('tests/edit', { test });
    })
}

module.exports.postEdit = (req, res) => {
    Test.findById(req.params.id).exec((err, test) => {
        if (err) return res.send(err);
        test.name = req.body.name;
        test.link_pdf = req.body.link_pdf;
        test.link_fb_live = req.body.link_fb_live;
        test.time = req.body.time;
        test.grade = req.body.grade || undefined;
        if (req.body.deadline) test.deadline = new Date(req.body.deadline);
        test.isPublic = req.body.isPublic == 'on';
        test.isPremium = req.body.isPremium == 'on';
        test.isShuffled = req.body.isShuffled == 'on';
        test.isSorted = req.body.isSorted == 'on';
        test.note = req.body.note;
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
        if (result.user.facebook_id != req.user.id && !req.user.isAdmin) throw new Error('Cấm.');
    } catch (err) {
        return res.status(404).send(err);
    }
    let trueChoiceIds = [],
        selectedChoiceIds = result.choices.map(c => String(c.choice_id)),
        falseChoiceIds = [];
    result.test_id.questions.forEach(q => {
        trueChoiceIds.push(...q.getTrueChoiceArray());
        falseChoiceIds.push(...q.getFalseChoiceArray());
    })
    res.render('tests/view-result', { result, trueChoiceIds, selectedChoiceIds });
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