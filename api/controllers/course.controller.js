const Test = require("../../models/test.model");
const Result = require("../../models/result.model");
const Question = require("../../models/question.model");
const Course = require("../../models/course.model");

function Response(path, status, error, message){
        this.timestamp = new Date(),
        this.status = status || 200,
        this.error = error || "No error to show",
        this.message = message || "No message available",
        this.path = path
};



module.exports = {
    //------------------------CRUD---------------------------//
    index: async (req,res) => {
        Course.find({}, (err, courses) => {
            let response = new Response("/api/course", 400, err, "Error Occurred");
            if(err || !courses){
                response.status = 400;
                response.message = "Error occurred";
                console.log(response);
                return res.status(400).json({response});
            };
            return res.status(200).json({courses: courses})
        });
    },

    create: async (req,res) => {
        let response = new Response("/api/course/" + req.params.id + "/create");
        try{
            let course = new Course({
                name: req.body.name,
                grade: req.body.grade,
                test_ids: req.body.test_ids || [],
                description: req.body.description,
                note: req.body.note,
                original_price: req.body.original_price,
                public_price: req.body.public_price,
                img_link: req.body.img_link || undefined,
                logged_user_ids: []
            });
            await course.save();
        }catch(err){
            response.status = 400;
            response.error = err;
            console.log(response);
            return res.status(200).json({response});
        };
        response.message = "Created Successfully";
        return res.status(201).json({response, createdCourse: course});
    },

    edit: async (req,res) => {
        let response = new Response("/api/course/" + req.params.id + "/edit");
        let course = await Course.findById(req.params.id, (err, course) => {
            if(err || !course){
                response.status = 400;
                response.message = (course) ? "Error occurred" : "Course not found";
                console.log(response);
                res.status(400).json({response});
                return;
            };
        });
        if(!course) return;
        try{
            if(req.body.name){course.name = req.body.name}
            if(req.body.grade){course.grade = req.body.grade}
            if(req.body.test_ids){course.test_ids = req.body.test_ids}
            if(req.body.description){course.description = req.body.description;}
            if(req.body.note){course.note = req.body.note;}
            if(req.body.original_price){course.original_price = req.body.original_price;}
            if(req.body.public_price){course.public_price = req.body.public_price;}
            if(req.body.logged_user_ids){course.logged_user_ids = req.body.logged_user_ids.split(";").map(id => id.trim());}
            course.img_link = (req.body.img_link) ? req.body.img_link : undefined;
            await course.save();
        }catch(err){
            response.status = 401;
            response.error = err;
            console.log(response);
            res.status(400).json({response});
            return;
        };
        response.message = "Edited Successfully";
        res.status(200).json({response, editedCourse: course});
        return;
    },

    delete: (req,res) => {
        let response = new Response("/api/course/" + req.params.id + "/delete");
        try{
            Course.findOneAndDelete(req.params.id)
        }catch(err){
            response.status = 400;
            response.error = err;
            return res.status(response.status).json({response});
        }
        response.message = "Deleted Successfully";
        return res.status(200).json({response});
    },

    //=========================================================================//
    //----------------ADD STUDENT------------------//
    addStudent: async (req,res) => {
        let response = new Response("/api/course/" + req.params.id + "/add-student");
        await Course.findByIdAndUpdate(req.params.id, (err, course) => {
            if(err || !course){
                response.status = 400;
                response.error = err;
                response.message = (course) ? "Error occurred" : "Course not found";
                console.log(response);
                res.status(400).json({error: response});
                return;
            };
            try{
                course.logged_user_ids.push(req.body.studentId);
                course.save();
                response.message = "Added Successfully";
            }catch(err){
                response.message = "Error occurred";
                response.error = err;
                response.status = 400;
                res.status(400).json({error: response});
                return;
            };
        });
        return res.status(200).json({response});
    },

    //------------------VIEW-------------------//
    view: async (req,res) => {
        let response = new Response("/api/course/" + req.params.id + "/view");
        let course;
        course = await Course.findById(req.params.id, (err, course) => {
            if(err || !course){
                response.status = 400;
                response.error = err;
                response.message = (course) ? "Error occurred" : "Course not found";
                console.log(response);
                return res.status(400).json({error: response});
            };
        }).populate('test_ids');
        if(!course){
            response.status = 204;
            return;   
        }
        try{
            results = req.user ? await Result.find({ "user.facebook_id": req.user.id }) : [];
            course.test_ids.forEach(t => {
                t.count = results.filter(r => String(r.test_id) == String(t._id)).length;
            });
        }catch(err){
            response.message = "Error occurred";
            response.error = err;
            response.status = 400;
            res.status(400).json({error: response});
            return;
        };
        return res.status(200).json({response})
    }
};
