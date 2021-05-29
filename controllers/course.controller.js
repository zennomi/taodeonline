const texToMathML = require('../ultils/mathml').texToMathML;
const entities = require("entities");
const Test = require("../models/test.model");
const Question = require("../models/question.model");
const Course = require("../models/course.model");

//----------------------------INDEX(/courses)------------------------------//
module.exports.index = async(req, res) => {

    var courses = await Course.find({})
    var page = parseInt(req.query.page) || 1;
    var perPage = 3;
    var start = (page - 1) * perPage;
    var end = start + perPage;
    res.render('courses/index', {
        courses: courses.slice(start, end),
        page: page
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
        let course = await Course.findById(req.params.id).populate('test_ids');
        res.render('courses/view', { course: course, tests: course.test_ids });
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