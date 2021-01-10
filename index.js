require('dotenv').config();

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const TeXToMML = require("tex-to-mml");

const port = process.env.PORT ? process.env.PORT : 8080;
app.set('views', './views');
app.set('view engine', 'pug');
app.use(express.static('public'));
app.use(express.static('node_modules/@wiris/mathtype-ckeditor4'));

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true
}).then(() => {
  console.log('Connected to MongoDB Atlas.');
}).catch((err) => {
  console.log('Error occurred connecting to MongoDB Atlas');
});

const Question = require('./models/question.model');
const Test = require('./models/test.model');
const questionRoutes = require('./routes/questions');
const testRoutes = require('./routes/tests.js');

app.get('/', (req, res) => {
  res.render('index');
})
app.get('/test', (req, res) => {
  // Handle query
  let handledQuery = {
    query: req.query.query ? req.query.query : "",
    grade: req.query.grade ? req.query.grade : "",
    tags: req.query.tags ? req.query.tags : "",
    sort: req.query.sort ? req.query.sort : ""
  }
  const fs = require("fs");
  const sourceFile = "./test/3_150.json";
  console.log('Hello');
  fs.readFile(sourceFile, 'utf8', function (err, sourceData) {
    if (err) return console.log(err);
    sourceData = JSON.parse(sourceData)
    let questions = sourceData.map(e => {
      return {
        question: e.questionContent,
        choices: e.answerList.map(a => { return { content: a } }),
        main_tags: e.tags.map(e => {return {value: e}}),
        side_tags: []
      }
    })
    res.render('questions/index', {
      questions: questions,
      numberOfQuestions: req.cookies.questions ? req.cookies.questions.ids.length : 0,
      currentPage: 1,
      maxPage: 1,
      handledQuery: handledQuery
    });
  });
})

app.use('/questions', questionRoutes);
app.use('/tests', testRoutes);

app.post('/api/add-question', (req, res) => {
  let response = { status: 200 };
  if (!req.cookies.questions) {
    res.cookie('questions', { ids: [req.body.questionId] }, { expires: new Date(Date.now() + 7 * 24 * 3600), httpOnly: true });
    response.message = "Thêm câu hỏi thành công! Đang có 1 câu hỏi trong bộ nhớ";
    res.json(response);
    return;
  }
  if (req.cookies.questions.ids.indexOf(req.body.questionId) > -1) {
    response.message = "Câu hỏi này đã có trong bộ nhớ.";
    response.status = 201;
    res.json(response);
    return;
  }
  req.cookies.questions.ids.push(req.body.questionId)
  res.cookie('questions', { ids: req.cookies.questions.ids }, { expires: new Date(Date.now() + 7 * 24 * 3600), httpOnly: true })
  response.message = `Thêm câu hỏi thành công! Đang có ${req.cookies.questions.ids.length} câu hỏi trong bộ nhớ`;
  res.json(response);
})

app.post('/api/remove-question', (req, res) => {
  let response = { status: 200 };
  if (req.cookies.questions.ids.indexOf(req.body.questionId) > -1) {
    res.cookie('questions', { ids: req.cookies.questions.ids.filter(id => id != req.body.questionId) }, { expires: new Date(Date.now() + 7 * 24 * 3600), httpOnly: true })
    response.message = `Xóa câu hỏi thành công! Đang có ${req.cookies.questions.ids.length - 1} câu hỏi trong bộ nhớ`;
    res.json(response);
    return;
  }
  if (!req.cookies.questions) {
    response.message = "Không tồn tại câu hỏi nào trong cookie.";
    response.status = 201;
    res.json(response);
    return;
  }
  response.status = 201;
  response.message = `Không có câu hỏi này trong cookie.`;
  res.json(response);
})

app.post('/api/order-question', (req, res) => {
  let response = { status: 200 };
  res.cookie('questions', { ids: req.body.order ? req.body.order : [] }, { expires: new Date(Date.now() + 7 * 24 * 3600), httpOnly: true })
  res.json(response);
  return;
})

app.post('/api/tests/save', (req, res) => {
  let response = { status: 200 };
  let newTest = new Test({
    questions: req.body.order,
    time: req.body.time,
    name: req.body.name
  });
  newTest.save((err, newTest) => {
    if (err) {
      response.status = 201;
      console.log(err);
      res.json(response);
      return;
    }
    response.idNewTest = newTest._id;
    res.json(response);
    return;
  })
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})