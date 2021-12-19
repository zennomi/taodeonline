const Question = require("../../models/question.model");
const Test = require("../../models/test.model");
const texToMathML = require("../../ultils/mathml").texToMathML;

module.exports = {
    //--------------CRUD------------------//
    index: async(req,res) => {
        let response = new Response("/api/question");
        let tagsList = req.query.tags ? JSON.parse(req.query.tags).map(t => t.value) : [];
        let searchOption = {
            question: { $regex: (new RegExp(req.query.query, 'i')) }, // need to fix
            grade: (req.query.grade == -1 && {$exists: false}) || req.query.grade || undefined,
            main_tags: req.query.tags ? { $elemMatch: { value: { $in: tagsList } } } : undefined,
            answer: (Number(req.query.detailed_answer) == 1) ? { $regex: ".{10,}" } : {$not: { $regex: ".{10,}" }}
        }

        if (!req.query.query) delete searchOption.question;
        if (!req.query.grade) delete searchOption.grade;
        if (!req.query.tags) delete searchOption.main_tags;
        if (!req.query.detailed_answer || req.query.detailed_answer == "0") delete searchOption.answer;
        // Sort
        let sortOption;
        switch (Number(req.query.sort)) {
            case 2:
                sortOption = { _id: -1 };
                break;
            case 3:
                sortOption = { level: 1, _id: 1 };
                break;
            case 4:
                sortOption = { level: -1, _id: 1 };
                break;
            default:
                sortOption = { _id: 1 };
        }

        // Pagination
        const perPage = 10;
        let indexPage = req.query.p ? Number(req.query.p) - 1 : 0;
        let maxPage = await Question.countDocuments(searchOption);
        maxPage = Math.ceil(maxPage / perPage);

        // Handle query
        let handledQuery = {
            query: req.query.query || "",
            grade: req.query.grade || "",
            tags: req.query.tags || "",
            sort: req.query.sort || "",
            detailed_answer: req.query.detailed_answer || ""
        }

        // Main
        let questions = await Question.find(searchOption).sort(sortOption).limit(perPage).skip(indexPage * perPage);

        questions.forEach(q => {
            q.question = toInlineElement(q.question);
            q.choices.forEach(a => {
                a.content = toInlineElement(a.content);
            })
        });
        return res.json({
            response: response,
            questions: questions,
            numberOfQuestions: req.cookies.questions ? req.cookies.questions.ids.length : 0,
            currentPage: indexPage + 1,
            maxPage: maxPage,
            handledQuery: handledQuery
        });
    },

    view: (req,res) => {
        let response = new Response("/api/question/" + req.params.id + "/view");
        Question.findById(req.params.id, null, function(err, question) {
            if (err || !question){
                response.status = 400;
                response.error = err;
                response.message = (question) ? "Error occurred" : "Test not found";
            }
            if(!question){return res.status(response.status).json({error: response});};
            question.question = texToMathML(question.question);
            question.choices.forEach(a => {
                a.content = texToMathML(a.content);
            });
            question.maxLengthAnswer = Math.max(...question.choices.map(a => a.content.length));
            question.answer = texToMathML(question.answer);
            return res.json({
                response: response,
                question: question
            });
        });
    },
    
    create: async (req,res) => {
        let response = new Response("/api/question/create");
        let question = new Question({
            question: texToMathML(req.body.question_content),
            grade: req.body.grade ? req.body.grade : undefined,
            choices: [],
            answer: texToMathML(req.body.detailed_answer),
            main_tags: req.body.main_tags ? JSON.parse(req.body.main_tags) : undefined,
            side_tags: req.body.side_tags ? JSON.parse(req.body.side_tags) : undefined,
            level: req.body.level ? req.body.level : undefined
        });
        let truthyChoices = req.body.answer_true.map(a => Number(a)); //answer_true[] 
        req.body.answer_content.forEach((ans, i) => {
            question.choices[i] = {};
            question.choices[i].content = texToMathML(ans);
            if(truthyChoices.indexOf(i) > -1) question.choices[i].isTrue = true;
            else question.choices[i].isTrue = false;
        });
        await question.save();
        response.message = "Created Successfully"; 
        return res.status(200).json({
            response: response,
            question: question
        });
    },

    edit: async (req,res) => {
        let response = new Response("/api/question/" + req.params.id + "/edit");
        let question = await Question.findById(req.params.id);
        try {
            if(req.body.question_content){question.question = texToMathML(req.body.question_content);};
            if(req.body.detailed_answer){question.answer = texToMathML(req.body.detailed_answer);};
            if(req.body.grade){question.grade = req.body.grade;};
            if(req.body.main_tags){question.main_tags =  JSON.parse(req.body.main_tags);};
            if(req.body.side_tags){question.side_tags = JSON.parse(req.body.side_tags);};
            if(req.body.level){question.level = req.body.level;};
            // question.question = texToMathML(req.body.question_content);
            // question.answer = texToMathML(req.body.detailed_answer);
            // question.grade = req.body.grade ? req.body.grade : undefined;
            // question.main_tags = req.body.main_tags ? JSON.parse(req.body.main_tags) : undefined;
            // question.side_tags = req.body.side_tags ? JSON.parse(req.body.side_tags) : undefined;
            // question.level = req.body.level ? req.body.level : undefined;
        }catch(err){
            return res.status(201).json({error:err});
        };
        let truthyChoices = req.body.answer_true ? req.body.answer_true.map(a => Number(a)) : [];
        if(req.body.answer_content){
            req.body.answer_content.forEach((ans, i) => {
                question.choices[i] = question.choices[i] || {};
                question.choices[i].content = texToMathML(ans);
                if (truthyChoices.indexOf(i) > -1) question.choices[i].isTrue = true;
                else question.choices[i].isTrue = false;
            })
        }
        await question.save();
        response.message = "Edited Successfully"; 
        return res.status(200).json({
            response: response, 
            question: question
        });
    },

    delete: async (req,res) => {
        let response = new Response("/api/question/" + req.params.id + "/delete");
        let question, altQuestion, tests;
        try {
            if (req.params.id == req.body.altId) throw 'Duplicated ID'
            question = await Question.findById(req.params.id);
            if (!question) throw 'Not Found';
            if (req.body.altId) {
                altQuestion = await Question.findById(req.body.altId);
                if (!altQuestion) throw 'Not Found';
                await Test.updateMany({questions: req.params.id},{"$set": { "questions.$": req.body.altId }});
            }
            await Question.findByIdAndDelete(req.params.id);
        }catch(err) {
            response.status = 400;
            response.error = err;
            return res.status(response.status).json({error: response});
        };
        response.message = "Deleted Successfully";
        return res.json({response: response});
    },
    //------------------------------------//

    // CRUD Cookie
    getQuestionCookie: (req, res) => {
        let response = new Response("/api/test/" + req.params.id + "/cookie");
        let cookies = req.cookies;
        if(!cookies){
            response.status = 204;
            response.message = "No Content";
        };
        return res.status(200).json({
            response: response,
            cookies: cookies
        });
        // res.status(200).json({
        //     questionsIds: req.cookies.questions ? req.cookies.questions.ids : []
        // })
    },

    postQuestionCookie: (req, res) => {
        let response = new Response("questions/memory/");
        if (!req.cookies.questions) {
            response.ids = [req.body.questionId];
            res.cookie('questions', { ids: response.ids }, { expires: new Date(Date.now() + 7 * 24 * 3600 * 1000), httpOnly: true });
            response.message = "Thêm câu hỏi thành công! Đang có 1 câu hỏi trong bộ nhớ";
            res.status(200).json(response);
            return;
        }
        if (req.cookies.questions.ids.indexOf(req.body.questionId) > -1) {
            response.error = "Câu hỏi này đã có trong bộ nhớ.";
            res.status(200).json(response);
            return;
        }
        req.cookies.questions.ids.push(req.body.questionId);
        res.cookie('questions', { ids: req.cookies.questions.ids }, { expires: new Date(Date.now() + 7 * 24 * 3600 * 1000), httpOnly: true })
        response.message = `Thêm câu hỏi thành công! Đang có ${req.cookies.questions.ids.length} câu hỏi trong bộ nhớ`;
        response.ids = req.cookies.questions.ids;
        res.status(200).json(response);
    },

    deleteQuestionCookie: (req, res) => {
        let response = new Response("questions/memory/");
        if (!req.cookies.questions.ids) {
            return res.status(200).json({
                error: "Không có câu hỏi lưu trong bộ nhớ."
            })
        }
        let newQuesIds = req.cookies.questions.ids.filter(id => id != req.body.questionId);
        res.cookie('questions', { ids: newQuesIds }, { expires: new Date(Date.now() + 7 * 24 * 3600 * 1000), httpOnly: true })
        response.message = `Xóa câu hỏi thành công! Đang có ${newQuesIds.length} câu hỏi trong bộ nhớ.`;
        response.ids = newQuesIds;
        res.status(200).json(response);
        return;
    },

    postQuestionOrder: (req, res) => {
        let response = new Response("questions/memory/order");
        res.cookie('questions', { ids: req.body.order ? req.body.order : [] }, { expires: new Date(Date.now() + 7 * 24 * 3600 *1000), httpOnly: true })
        res.status(200).json(response);
        return;
    }
    //--------------------------------------//
}

function Response(path, status, error, message){
    this.timestamp = new Date(),
    this.status = status || 200,
    this.error = error || "No error to show",
    this.message = message || "No message available",
    this.path = path
};

function toInlineElement(ele) {
    // ele = ele.split("");
    // ele.splice(0, 3);
    // ele.splice(ele.length - 4, 4);
    // return ele.join("");
    return ele.replace(/<p>(.*)<\/p>/, "$1");
}

function isChoice(str) {
    return /<strong>.*[ABCD].*\..*<\/strong>/gi.test(str);
};

function isTrueChoice(str) {
    return /<u>.*[ABCD].*\..*<\/u>/gi.test(str);
};

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
            } else {
                let levelRegex = /<p>\s*\[&lt;level:(\d{1,})&gt;\]\s*<\/p>/g;
                if (levelRegex.test(p)) {
                    console.log(levelRegex.exec(p)); // dont delete this line
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
                };
                while (/<\w+>\s*<\/\w+>/g.test(c)) c = c.replace(/<\w+>\s*<\/\w+>/g, '');
                return {
                    content: c,
                    isTrue: isTrue
                };
            }),
            level: level || undefined,
            main_tags: [],
            side_tags: []
        };
    });
    return matchedQuestions;
};