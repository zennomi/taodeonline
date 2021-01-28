const Test = require("../models/test.model");
const Question = require("../models/question.model");

module.exports.index = (req, res) => {
    Test.find({}).exec((err, tests) => {
        if (err) return res.send("Error.");

        res.render('tests/index', {tests});
    })
}

module.exports.view = (req, res) => {
    let retryTimes = req.cookies.retryTimes ? Number(req.cookies.retryTimes)+1 : 1;
    res.cookie('retryTimes', retryTimes, { expires: new Date(Date.now() + 7 * 24 * 3600), httpOnly: true });
    Test.findById(req.params.id).populate('questions').exec((err, test) => {
        if (err || !test) return res.send('Error');
        test.questions.forEach(q => {
            q.question = toInlineElement(q.question);
            q.choices.forEach(a => {
                a.content = toInlineElement(a.content);
            })
            q.maxLengthAnswer = Math.max(...q.choices.map(a => a.content.length));
        });
        res.render('tests/view', {test, link: `${req.hostname}${req.originalUrl}`, retryTimes});
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
    matchedQuestions.sort((a,b) => ids.indexOf(a._id.toString()) - ids.indexOf(b._id.toString()))
    res.render('tests/create', { matchedQuestions });
}

module.exports.autoCreate = (req, res) => {
    res.render('tests/auto-create.pug')
}

module.exports.postAutoCreate = async (req, res) => {
    console.log(req.body);
    let numberOfGroups = req.body.numberOfQuestions.length;
    let matchedQuestions = [];
    for (let i = 0; i < numberOfGroups; i++) {
        let questions = await Question.find({
            _id: {$nin: matchedQuestions.map(q => q._id)},
            level: {$lt: Number(req.body.max_level[i]), $gt: Number(req.body.min_level[i])},
            main_tags: { $elemMatch: { value: {$in: JSON.parse(req.body.tags[i]).map(e => e.value)} } }
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
    res.cookie('questions', { ids: [...matchedQuestions.sort((a,b) => a.level - b.level).map(q => q._id)] }, { expires: new Date(Date.now() + 7 * 24 * 3600), httpOnly: true });
    res.redirect('/tests/create');
}

function toInlineElement(ele) {
    // ele = ele.split("");
    // ele.splice(0, 3);
    // ele.splice(ele.length - 4, 4);
    // return ele.join("");
    return ele.replace(/<p>(.*)<\/p>/, "$1");
}