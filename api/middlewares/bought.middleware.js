const Course = require('../models/course.model');

module.exports = {
    bought = async(req, res, next) => {
        let course;
        try {
            course = await Course.findById(req.params.id);
            if (!course) throw new Error("not found");
        } catch (err) {
            return res.send(err);
        }
        if (course.logged_user_ids.includes(res.locals.user)) {
            res.locals.user.bought = true;
        }
        next();
    }
}