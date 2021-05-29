const Question = require("../models/question.model");
const texToMathML = require('../ultils/mathml').texToMathML;
const entities = require("entities");

function toInlineElement(ele) {
    // ele = ele.split("");
    // ele.splice(0, 3);
    // ele.splice(ele.length - 4, 4);
    // return ele.join("");
    return ele.replace(/<p>(.*)<\/p>/, "$1");
}

module.exports.create = (req, res) => {
    res.render('questions/create');
}

module.exports.postCreate = async (req, res) => {
    let question = new Question({
        question: texToMathML(req.body.question_content),
        grade: req.body.grade ? req.body.grade : undefined,
        choices: [],
        answer: texToMathML(req.body.detailed_answer),
        main_tags: req.body.main_tags ? JSON.parse(req.body.main_tags) : undefined,
        side_tags: req.body.side_tags ? JSON.parse(req.body.side_tags) : undefined,
        level: req.body.level ? req.body.level : undefined
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

module.exports.index = async (req, res) => {

    // Search
    let tagsList = req.query.tags ? JSON.parse(req.query.tags).map(t => t.value) : [];
    let optionSearch = {
        question: { $regex: (new RegExp(req.query.query, 'i')) },
        grade: req.query.grade ? req.query.grade : undefined,
        main_tags: req.query.tags ? { $elemMatch: { value: { $in: tagsList } } } : undefined
    }
    if (!req.query.query) delete optionSearch.question;
    if (!req.query.grade) delete optionSearch.grade;
    if (!req.query.tags) delete optionSearch.main_tags;

    // Sort
    let sortOption;
    switch (Number(req.query.sort)) {
        case 2:
            sortOption = { _id: -1 };
            break;
        case 3:
            sortOption = { level: 1 };
            break;
        case 4:
            sortOption = { level: -1 };
            break;
        default:
            sortOption = { _id: 1 };
    }

    // Pagination
    const perPage = 10;
    let indexPage = req.query.p ? Number(req.query.p) - 1 : 0;
    let maxPage = await Question.countDocuments(optionSearch);
    maxPage = Math.ceil(maxPage / perPage);

    // Handle query
    let handledQuery = {
        query: req.query.query ? req.query.query : "",
        grade: req.query.grade ? req.query.grade : "",
        tags: req.query.tags ? req.query.tags : "",
        sort: req.query.sort ? req.query.sort : ""
    }

    // Main
    let questions = await Question.find(optionSearch).limit(perPage).skip(indexPage * perPage).sort(sortOption);
    questions.forEach(q => {
        q.question = toInlineElement(q.question);
        q.choices.forEach(a => {
            a.content = toInlineElement(a.content);
        })
        q.maxLengthAnswer = Math.max(...q.choices.map(a => a.content.length));
    });
    res.render('questions/index', {
        questions: questions,
        numberOfQuestions: req.cookies.questions ? req.cookies.questions.ids.length : 0,
        currentPage: indexPage + 1,
        maxPage: maxPage,
        handledQuery: handledQuery
    });

}

module.exports.export = async (req, res) => {

    let ids = req.cookies.questions ? req.cookies.questions.ids : [];


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
        if (err || !question) return res.send('Error.');
        res.render('questions/view', { question })
    })
}

module.exports.edit = (req, res) => {
    Question.findById(req.params.id, null, function (err, question) {
        if (err || !question) return res.send('Error.');

        question.question = texToMathML(question.question);
        question.choices.forEach(a => {
            a.content = texToMathML(a.content);
        })
        question.maxLengthAnswer = Math.max(...question.choices.map(a => a.content.length));
        question.answer = texToMathML(question.answer);
        res.render('questions/edit', { question });
    })
}

module.exports.postEdit = async (req, res) => {
    let question = await Question.findById(req.params.id);
    question.question = texToMathML(req.body.question_content);
    question.answer = texToMathML(req.body.detailed_answer);
    question.grade = req.body.grade ? req.body.grade : undefined;
    question.main_tags = req.body.main_tags ? JSON.parse(req.body.main_tags) : undefined;
    question.side_tags = req.body.side_tags ? JSON.parse(req.body.side_tags) : undefined;
    question.level = req.body.level ? req.body.level : undefined;
    let truthyChoices = req.body.answer_true ? req.body.answer_true.map(a => Number(a)) : [];
    console.log(question.choices);
    req.body.answer_content.forEach((ans, i) => {
        question.choices[i] = question.choices[i] || {};
        question.choices[i].content = texToMathML(ans);
        if (truthyChoices.indexOf(i) > -1) question.choices[i].isTrue = true;
        else question.choices[i].isTrue = false;
    })
    await question.save();
    console.log(question.choices);
    res.redirect('/questions/' + question._id);
}

module.exports.delete = (req, res) => {
    Question.findByIdAndDelete(req.params.id, null, function (err, question) {
        res.redirect('/questions');
    })
}

module.exports.import = (req, res) => {
    res.render('questions/import');
}

module.exports.postImport = (req, res) => {
    let matchedQuestions = questionfy(req.body.content);

    res.render('tests/demo', { matchedQuestions });
}

module.exports.saveImportedQuestions = (req, res) => {
    let importQuestions = questionfy(req.body.content);
    console.log(req.cookies.questions);
    Question.insertMany(importQuestions, (err, questions) => {
        if (err) return res.send(err);
        if (req.body.addToMemory == 'on') {
            if (!req.cookies.questions) req.cookies.questions = { ids: [] }
            let ids = req.cookies.questions.ids || [];
            ids.push(...questions.map(q => q._id));
            res.cookie('questions', { ids: ids }, { expires: new Date(Date.now() + 7 * 24 * 3600), httpOnly: true });
        }
        res.render('tests/create', { matchedQuestions: questions });
    })
}

function isChoice(str) {
    return /<strong>.*[ABCD].*\..*<\/strong>/gi.test(str);
}

function isTrueChoice(str) {
    return /<u>.*[ABCD].*\..*<\/u>/gi.test(str);
}

function questionfy(content) {
    let quesStrArr = content
        .replace(/&nbsp;/g, ' ')
        .replace(/\s{3,}/g, '   ')
        .replace(/\s{3,}/g, '   ')
        .replace(/(<[^\/<>]+>)(\s+)/g, '$2$1')
        .split(/<p>\s*\[&lt;br&gt;\]\s*<\/p>/);
    let level;
    let matchedQuestions = quesStrArr.map((q, i) => {
        let parArr = Array.from(q.matchAll(/<p>.+?<\/p>/g), m => m[0]);
        let quesContent = [];
        let choiceList = [];

        parArr.forEach((p, j) => {
            if (isChoice(p)) {
                if (/\s{3,}/gi.test(p)) {
                    choiceList.push(...p.split(/\s{3,}/).filter(c => isChoice(c)));
                } else choiceList.push(p);
            }
            else {
                let levelRegex = /<p>\s*\[&lt;level:(\d{1,})&gt;\]\s*<\/p>/g;
                if (levelRegex.test(p)) {
                    console.log(levelRegex.exec(p));
                    level = Number([...levelRegex.exec(p)][1]);
                } else
                    quesContent.push(p);
            }
        })
        return {
            question: quesContent.join('\n'),
            choices: choiceList.map(c => {
                let isTrue = false;
                c = c.replace(/[ABCD]/i, '').replace(/\./, '');
                if (/<u>\s*<\/u>/g.test(c)) {
                    isTrue = true;
                }
                while (/<\w+>\s*<\/\w+>/g.test(c)) c = c.replace(/<\w+>\s*<\/\w+>/g, '');
                return {
                    content: c,
                    isTrue: isTrue
                }
            }),
            level: level || undefined,
            main_tags: [],
            side_tags: []
        }
    })
    return matchedQuestions;
}