const Test = require("../../models/test.model");
const Question = require("../../models/question.model");
const Result = require("../../models/result.model");
const shuffle = require('shuffle-array');
const groupArray = require('group-array');


function Response(path, status, error, message){
    this.timestamp = new Date(),
    this.status = status || 200,
    this.error = error || "No error to show",
    this.message = message || "No message available",
    this.path = path
};

module.exports = {
    //-----------------------------CRUD---------------------------//
    index: async (req,res) => {
        let response = new Response("/api/tests/");
        let tests, results = [];
        let tagsList = req.query.tags ? JSON.parse(req.query.tags).map(t => t.value) : [];
    

        let handledQuery = {
            name: req.query.name || "",
            grade: req.query.grade || "",
            tags: req.query.tags || ""
        };

        // Pagination
        const perPage = 10;
        let indexPage = req.query.p ? Number(req.query.p) - 1 : 0;
        let maxPage = await Test.countDocuments();
        maxPage = Math.ceil(maxPage / perPage);
    
        let searchOption = {
            grade: (req.query.grade == -1 && {$exists: false}) || req.query.grade || undefined,
            tags: req.query.tags ? { $elemMatch: { value: { $in: tagsList } } } : undefined
        }
    
        if (!req.query.grade){delete searchOption.grade;};
        if (!req.query.tags){delete searchOption.tags;};
        if(req.query){
            maxPage = Math.ceil(await Test.find(searchOption).countDocuments() / perPage);
        }
        try {
            tests = await Test.find(searchOption).limit(perPage).skip(indexPage * perPage).sort({ _id: -1 }).lean();
            results = req.user ? await Result.find({ "user.facebook_id": req.user.id }) : [];
            if(req.query.name){
                tests = tests.filter((entry) => {
                    return removeVNeseCharacters(entry.name.toLowerCase()).indexOf(removeVNeseCharacters(req.query.name.toLowerCase())) !== -1;
                })
            };
            tests.forEach(t => {
                t.count = results.filter(r => String(r.test_id) == String(t._id)).length;
            })
        }catch (err) {
            response.message = "Error occurred";
            response.error = err;
            response.status = 400;
            res.status(400).json({error: response});
            return;
        };
    
        res.status(200).json({
            response,
            tests, 
            currentPage: indexPage + 1,
            maxPage: maxPage,
            handledQuery: handledQuery
        });
    },

    create: (req,res) => {
        let response = new Response("/api/tests/create");
        let test = new Test({
            questions: req.body.questions,
            tags: req.body.tags ? JSON.parse(req.body.tags) : undefined,
            time: req.body.time,
            name: req.body.name,
            grade: req.body.grade
        });
        test.save((err, test) => {
            if(err){
                response.error = err;
                response.message = "Failed";
                return res.status(400).json({response});
            };
            response.message = "Created Successfully";
            return res.status(200).json({response, editedTest: test});
        });
    },

    edit: (req,res) => {
        let response = new Response("/api/tests/" + req.params.id + "/edit");
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
                if(err){
                    response.error = err;
                    response.message = "Failed";
                    return res.status(400).json({response});
                };
                response.message = "Edited Successfully";
                return res.status(200).json({response, editedTest: test});
            });
        });
    },

    delete: async (req,res) => {
        let response = new Response("/api/tests/" + req.params.id + "/delete");
        try{
            await Test.findByIdAndDelete(req.params.id);
            await Result.deleteMany({
                test_id: req.params.id
            });
        }catch(err){
            response.status = 400;
            response.error = err;
            return res.status(response.status).json({error: response});
        };
        response.message = "Deleted Successfully";
        return res.status(response.status).json({response});
    },
    //=============================================================//

    view: async (req,res) => {
        let response = new Response("/api/tests/" + req.params.id + "/view");
        let trueChoiceIds = [], trueChoices = [];
        // Query
        let matchedTest = await Test.findById(req.params.id, (err, test) => {
            if(err || !test){
                response.status = 400;
                response.error = err;
                response.message = (test) ? "Error occurred" : "Test not found";
            };
        }).populate('questions');
        if(!matchedTest){return res.status(400).json({error: response});};
        let matchedResults = await Result.find({ test_id: req.params.id }, (err, results) => {
            if(err){
                response.status = 400;
                response.error = err;
            };
        });
        try{
            matchedTest.questions.forEach((q, i) => {
                trueChoices.push(...q.getTrueChoiceArray().map(q => { return { id: q, index: i } }));
            });
            trueChoiceIds = trueChoices.map(c => String(c.id));

            matchedTest.questions.forEach(q => {
                q.question = toInlineElement(q.question);
                q.choices.forEach(a => {
                    a.content = toInlineElement(a.content);
                }),
                    q.trueTimes = 0;
            });
            // sort via level
            if (matchedTest.isSorted){matchedTest.questions.sort((a, b) => a.level - b.level);};
        
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
        }catch(err){
            response.status = 400;
            response.error = err;
            return res.status(response.status).json({error: response});
        };

        res.status(200).json({
            response: response,
            test: matchedTest, 
            results: matchedResults 
        });
    },

    getDetail: async (req,res) => {
        let response = new Response("/api/tests/" + req.params.id + "/detail");
        let config = {}, test, results;
        let hour = (new Date()).getHours();
        if (hour > 22 || hour < 5){config.darkmode = 'on';};
        results = await Result.find({ "user.facebook_id": req.user.id, test_id: test._id }, (err,result) => {
            if (err || !result){
                response.status(204);
                response.error = err;
                response.message = (result) ? "Error occurred" : "Result not found";
                console.log(response);
                return;
            };
        });
        test = await Test.findById(req.params.id, (err,test) => {
            if (err || !test){
                response.status = 400;
                response.error = err;
                response.message = (test) ? "Error occurred" : "Test not found";
                console.log(response);
                return res.status(400).json({error: response});
            };
        }).populate('questions');
            if(!test){return;}
            if (!test.time){test.time = 40;};
            try{
                // alignment
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
                        test.questions.push(...questionGroups[level]);
                    };
                };
            }catch(err){
                response.status = 400;
                response.error = err;
                return res.status(response.status).json({error: response});
            };

        return res.status(200).json({
            response: response,
            test: test,
            link: `${req.hostname}${req.originalUrl}`,
            results: results,
            config: config
        });
    },

    autoCreate: async (req,res) => {
        let response = new Response("/api/tests/auto-create");
        let numberOfGroups = req.body.numberOfQuestions.length;
        let matchedQuestions = [];
        try{
            for (let i = 0; i < numberOfGroups; i++) {
                let questions = await Question.find({
                    _id: { $nin: matchedQuestions.map(q => q._id) },
                    level: { $lt: Number(req.body.max_level[i]), $gt: Number(req.body.min_level[i]) },
                    main_tags: { $elemMatch: { value: { $in: JSON.parse(req.body.tags[i]).map(e => e.value) } } }
                }).limit(Number(req.body.numberOfQuestions[i]));
                matchedQuestions.push(...questions);
            };
            matchedQuestions.forEach(q => {
                q.question = toInlineElement(q.question);
                q.choices.forEach(a => {
                    a.content = toInlineElement(a.content);
                })
                q.maxLengthAnswer = Math.max(...q.choices.map(a => a.content.length));
            });
            res.cookie('questions', { ids: [...matchedQuestions.sort((a, b) => a.level - b.level).map(q => q._id)] }, { expires: new Date(Date.now() + 7 * 24 * 3600), httpOnly: true });
        }catch(err){
            response.status = 400;
            response.error = err;
            return res.status(response.status).json({error: response});
        };

        response.message = "Auto-Created Successfully"
        res.status(200).json({
            response: response,
            questions: matchedQuestions
        });
    },

    getResult: async (req,res) => {
        let response = new Response("/api/tests/" + req.params.id + "/result");
        try{
            let matchedResult = await Result.find({test_id: req.params.id});
            return res.status(200).json({
                response: response,
                result: matchedResult});
        }catch(err){
            response.status = 400;
            response.error = err;
            return res.status(response.status).json({error: response});
        };
    },

    // getCorrectAnswer: async (req, res) => {
    //     let response = new Response("/api/tests/" + req.params.id + "/correct-answer");
    //     let matchedTest = await Test.findById(req.params.id).populate('questions');
    //     if (!matchedTest) {
    //       res.status(404).json({error: 'Không thấy bài kiểm tra tương ứng.'});
    //       return;
    //     };
        
    //     let trueChoicesIds = [];
    //     matchedTest.questions.map(q => q.choices.filter(c => c.isTrue)).forEach(c => trueChoicesIds.push(...c.map(i => i._id)));
    //     res.status(200).json({
    //         result: trueChoicesIds,
    //         isPublic: matchedTest.isPublic
    //     });
    // }
};

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