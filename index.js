const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const TeXToMML = require("tex-to-mml");

const port = 8080;
app.set('views', './views');
app.set('view engine', 'pug');
app.use(express.static('public'));
app.use(express.static('node_modules/@wiris/mathtype-ckeditor4'));

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://new-user_01:25112001@cluster0.nxm48.mongodb.net/vlsn_2020?retryWrites=true&w=majority', {
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

app.get('/', (req, res) => {
  res.render('index');
})
app.get('/test', (req, res) => {
  res.render('test');
})

app.get('/questions/create', (req, res) => {
  res.render('questions/create');
});

app.post('/questions/create', async (req, res) => {
  let question = new Question({
    question: texToMathML(req.body.question_content),
    choices: [],
    answer: texToMathML(req.body.detailed_answer),
    grade: req.body.grade ? req.body.grade : undefined
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
});

app.get('/questions', (req, res) => {
  Question.find({}, null, function (err, questions) {
    res.render('questions/index', {
      questions: questions,
      numberOfQuestions: req.cookies.questions ? req.cookies.questions.ids.length : 0
    });
  })
})

app.get('/questions/export', async (req, res) => {

  let ids = req.cookies.questions ? req.cookies.questions.ids : [];

  function toInlineElement(ele) {
    // ele = ele.split("");
    // ele.splice(0, 3);
    // ele.splice(ele.length - 4, 4);
    // return ele.join("");
    return ele.replace(/<p>(.*)<\/p>/, "$1");
  }

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
})

app.get('/questions/:id', (req, res) => {
  Question.findById(req.params.id, null, function (err, question) {
    res.render('questions/view', { question })
  })
})

app.get('/questions/:id/edit', (req, res) => {
  Question.findById(req.params.id, null, function (err, question) {
    res.render('questions/edit', { question });
  })
})

app.post('/questions/:id/edit', async (req, res) => {
  let question = await Question.findById(req.params.id);
  question.question = texToMathML(req.body.question_content);
  question.answer = texToMathML(req.body.detailed_answer);
  question.grade = req.body.grade ? req.body.grade : undefined;
  let truthyChoices = req.body.answer_true.map(a => Number(a));
  req.body.answer_content.forEach((ans, i) => {
    question.choices[i] = {};
    question.choices[i].content = texToMathML(ans);
    if (truthyChoices.indexOf(i) > -1) question.choices[i].isTrue = true;
    else question.choices[i].isTrue = false;
  })
  await question.save();
  res.redirect('/questions/' + question._id);
});

app.get('/questions/:id/delete', (req, res) => {
  Question.findByIdAndDelete(req.params.id, null, function (err, question) {
    res.redirect('/questions');
  })
})

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
  console.log(req.cookies.questions);
  let response = { status: 200 };
  res.cookie('questions', { ids: req.body.order ? req.body.order : [] }, { expires: new Date(Date.now() + 7 * 24 * 3600), httpOnly: true })
  res.json(response);
  return;
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

function texToMathML(string) {
  return string.replace(/\$([^$]*)\$/g, (match, m1) => {
    return TeXToMML(m1).replace(/\n/g, "").replace(/ {2,}/g, "").replace('display="block"', "");
  })
  .replace(/\\\[([^[]*)\\\]/g, (match, m1) => {
    return TeXToMML(m1).replace(/\n/g, "").replace(/ {2,}/g, "").replace('display="block"', "");
  }).replace(/<p>&nbsp;<\/p>/g, "");
}