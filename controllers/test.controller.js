const Test = require("../models/test.model");
const Question = require("../models/question.model");
const Result = require("../models/result.model");
const shuffle = require('shuffle-array');
const groupArray = require('group-array');



module.exports.index = async (req, res) => {
    let tests, results = [];

    let tagsList = req.query.tags ? JSON.parse(req.query.tags).map(t => t.value) : [];

    // Pagination
    const perPage = 10;
    let indexPage = req.query.p ? Number(req.query.p) - 1 : 0;
    let maxPage = await Test.countDocuments();
    maxPage = Math.ceil(maxPage / perPage);

    let searchOption = {
        grade: (req.query.grade == -1 && {$exists: false}) || req.query.grade || undefined,
        tags: req.query.tags ? { $elemMatch: { value: { $in: tagsList } } } : undefined
    }

    if (!req.query.grade) delete searchOption.grade;
    if (!req.query.tags) delete searchOption.tags;
    if(req.query){
        maxPage = Math.ceil(await Test.find(searchOption).countDocuments() / perPage);
    }
    try {
        tests = await Test.find(searchOption).limit(perPage).skip(indexPage * perPage).sort({ _id: -1 }).lean();
        results = req.user ? await Result.find({ "user.facebook_id": req.user.id }) : [];
    } catch (err) {
        return res.send(err);
    }
    if(req.query.name){
        tests = tests.filter((entry) => {
            return removeVNeseCharacters(entry.name.toLowerCase()).indexOf(removeVNeseCharacters(req.query.name.toLowerCase())) !== -1;
        })
    }

    tests.forEach(t => {
        t.count = results.filter(r => String(r.test_id) == String(t._id)).length;
    })

    let handledQuery = {
        name: req.query.name || "",
        grade: req.query.grade || "",
        tags: req.query.tags || ""
    }

    res.render('tests/index', {
        tests, currentPage: indexPage + 1,
        maxPage: maxPage,
        handledQuery: handledQuery
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
    res.render('tests/create', { matchedQuestions});
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
        test.tags = req.body.tags ? JSON.parse(req.body.tags) : undefined
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

module.exports.search = async (req,res) => {
    const name = req.query.name.toLowerCase();
    const allTest = await Test.find({});
    const result = allTest.filter((test) => {
        return test.name.toLowerCase().indexOf(name) !== -1;
    })

    return res.render('tests/index',{tests: result})
}

function toInlineElement(ele) {
    // ele = ele.split("");
    // ele.splice(0, 3);
    // ele.splice(ele.length - 4, 4);
    // return ele.join("");
    return ele.replace(/<p>(.*)<\/p>/, "$1");
}

function removeVNeseCharacters(str) {
    str = str.toLowerCase();
//     We can also use this instead of from line 11 to line 17
//     str = str.replace(/\u00E0|\u00E1|\u1EA1|\u1EA3|\u00E3|\u00E2|\u1EA7|\u1EA5|\u1EAD|\u1EA9|\u1EAB|\u0103|\u1EB1|\u1EAF|\u1EB7|\u1EB3|\u1EB5/g, "a");
//     str = str.replace(/\u00E8|\u00E9|\u1EB9|\u1EBB|\u1EBD|\u00EA|\u1EC1|\u1EBF|\u1EC7|\u1EC3|\u1EC5/g, "e");
//     str = str.replace(/\u00EC|\u00ED|\u1ECB|\u1EC9|\u0129/g, "i");
//     str = str.replace(/\u00F2|\u00F3|\u1ECD|\u1ECF|\u00F5|\u00F4|\u1ED3|\u1ED1|\u1ED9|\u1ED5|\u1ED7|\u01A1|\u1EDD|\u1EDB|\u1EE3|\u1EDF|\u1EE1/g, "o");
//     str = str.replace(/\u00F9|\u00FA|\u1EE5|\u1EE7|\u0169|\u01B0|\u1EEB|\u1EE9|\u1EF1|\u1EED|\u1EEF/g, "u");
//     str = str.replace(/\u1EF3|\u00FD|\u1EF5|\u1EF7|\u1EF9/g, "y");
//     str = str.replace(/\u0111/g, "d");
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    str = str.replace(/đ/g, "d");
    // Some system encode vietnamese combining accent as individual utf-8 characters
    str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, ""); // Huyền sắc hỏi ngã nặng 
    str = str.replace(/\u02C6|\u0306|\u031B/g, ""); // Â, Ê, Ă, Ơ, Ư
    return str;
}