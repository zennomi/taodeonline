const Test = require("../models/test.model");
const Result = require("../models/result.model");
const Question = require("../models/question.model");
const Course = require("../models/course.model");

const shuffle = require('shuffle-array');
const groupArray = require('group-array');
const { toInlineElement } = require("../ultils/handleFormat");

//----------------------------INDEX(/courses)------------------------------//
module.exports.index = async(req, res) => {

    var courses = await Course.find({})
    // var page = parseInt(req.query.page) || 1;
    // var perPage = 3;
    // var start = (page - 1) * perPage;
    // var end = start + perPage;
    res.render('courses/index', {
        courses: courses,
        // page: page
    });
}

//--------------------------------PURCHASED (/course/purchased)----------------------------//
module.exports.purchased = (req, res) => {

    var id = 11111
    Course.find({ logged_user_ids: id }).exec((err, courses) => {
        if (err) return res.send("Error.");

        res.render('courses/purchased', { courses: courses });
    })
}


// /courses/all-courses
module.exports.all = async(req, res) => {

    var courses = await Course.find({})
    res.render('courses/all', { courses: courses });
}


// /courses/:id/view
module.exports.courseView = async(req, res) => {
        let course, results;
        try {
            course = await Course.findById(req.params.id).populate('test_ids');
            if (!course) throw "not found"
            results = req.user ? await Result.find({ "user.facebook_id": req.user.id }) : [];
        } catch(err) {
            return res.send(err);
        }
        course.test_ids.forEach(t => {
            t.count = results.filter(r => String(r.test_id) == String(t._id)).length;
        })
        res.render('courses/view', { course, tests: course.test_ids });
    }
    // /courses/:id/enroll => Construction 
module.exports.courseEnroll = async(req, res) => {

    await Course.findById(req.params.id, null, function(err, course) {
        if (err || !course) return res.send("<h1 style=\"text-align:center;\">ERROR</h1>");
        res.render('courses/enroll', { course: course })
    })
}

//--------------------------------CREATE(/courses/create)------------------------------//

module.exports.courseCreate = async(req, res) => {

    Test.find({}).exec((err, tests) => {
        if (err) return res.send("Error.");

        res.render('courses/create', { tests: tests });
    })
}


module.exports.postCourseCreate = async(req, res) => {

    let course = new Course({
        name: req.body.name,
        grade: req.body.grade,
        test_ids: req.body.test_ids,
        description: req.body.description,
        note: req.body.note,
        original_price: req.body.original_price,
        public_price: req.body.public_price,
        img_link: req.body.img_link || undefined,
        logged_user_ids: []
    })

    await course.save();
    res.redirect('/courses/all-courses')
}

//--------------------------------FOR ADMIN(/courses/manage)-----------------------------------//

module.exports.manage = (req, res) => {

    Course.find({}).exec((err, courses) => {
        if (err) return res.send("Error.");

        res.render('courses/manage', { courses: courses })
    })
}

//courses/manage/:id/view
module.exports.manageView = async(req, res) => {

    let course = await Course.findById(req.params.id);
    let matchedCourse = await Course.findById(req.params.id).populate('test_ids')
    res.render('courses/admin-view', { course: course, tests: matchedCourse.test_ids })
}

//-----------------------------Add permission for students(/courses/manage/:id/add)-------------------//
module.exports.studentAdd = async(req, res) => {

    await Course.findByIdAndUpdate(req.params.id, function() {
        if (err || !course) return res.send("<h1 style=\"text-align:center;\">ERROR</h1>");
        course.logged_user_ids.push(req.body.studentId);
        course.save();
    })
    res.redirect('/courses/manage/' + req.params.id + "/view");
}


//--------------------------------EDIT(/courses/manage/:id/edit)--------------------------------------//

module.exports.courseEdit = async(req, res) => {

    await Course.findById(req.params.id, null, function(err, course) {
        if (err || !course) return res.send("<h1 style=\"text-align:center;\">ERROR</h1>");
        Test.find({}).exec((err, tests) => {
            if (err) return res.send("Error.");
            res.render('courses/edit', { course: course, tests: tests });
        })
    })
}

module.exports.postCourseEdit = async(req, res) => {
    let course;
    try {
        course = await Course.findById(req.params.id);
        if (!course) throw new Error('not found');
    } catch (err) {
        return res.send("<h1 style=\"text-align:center;\">ERROR</h1>");
    }
    course.name = req.body.name;
    course.grade = req.body.grade;
    course.test_ids = req.body.test_ids;
    course.description = req.body.description;
    course.note = req.body.note;
    course.original_price = req.body.original_price;
    course.public_price = req.body.public_price;
    course.logged_user_ids = req.body.logged_user_ids.split(";").map(id => id.trim());
    course.img_link = course.img_link || undefined;
    await course.save();
    res.redirect('/courses/manage/' + req.params.id + '/view')
}

//-------------------------------DELETE(/courses/manage/:id/delete)------------------------------//

module.exports.delete = (req, res) => {

    var id = req.params.id
    Course.findOneAndDelete(id, function(err) {
        if (err) return res.send("<h1 style=\"text-align:center;\">ERROR</h1>");
    });
    res.redirect('/courses/manage')
}

//--------------------------------do(/courses/:id/tests/:id/)--------------------------------------//

module.exports.viewTest = async(req, res) => {
    let course, test, results;
    try {
        course = await Course.findById(req.params.id);
        test = await Test.findById(req.params.testId).populate('questions');
        if (!course || !test) throw new Error("Không tim thấy bài test có id này.");
        if (!course.isOpenTo(req.user) || !(course.test_ids.includes(String(test._id)))) throw new Error("Sai ID.");
        results = await Result.find({ "user.facebook_id": req.user.id, test_id: test._id });
    } catch (err) {
        return res.send(err);
    }
    res.render('tests/premium/view', { course, test, results });
}

module.exports.doTest = async(req, res) => {
    let config = req.query;
    let course, test;
    try {
        course = await Course.findById(req.params.id);
        test = await Test.findById(req.params.testId).populate('questions');
        if (!course || !test) throw new Error("Không tim thấy bài test có id này.");
        if (!course.isOpenTo(req.user) || !(course.test_ids.map(id => String(id)).includes(String(test._id)))) throw new Error("Sai ID.");
    } catch (err) {
        return res.send(err);
    }
    test.questions = test.questions.filter(q => q.level == 11 || (q.level <= config.max && q.level >= config.min))
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
    res.render('tests/premium/do', { course, test, link: `${req.hostname}${req.originalUrl}`, config });
}

module.exports.pdfTest = async(req, res) => {
    let config = req.query || {};
    let course, test;
    try {
        course = await Course.findById(req.params.id);
        test = await Test.findById(req.params.testId).populate('questions');
        if (!course || !test) throw new Error("Không tim thấy bài test có id này.");
        if (!course.isOpenTo(req.user) || !(course.test_ids.map(id => String(id)).includes(String(test._id)))) throw new Error("Sai ID.");
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
    res.render('tests/pdf', { course, test, link: `${req.hostname}${req.originalUrl}`, config });
}