const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const TeXToMML = require("tex-to-mml");

const port = 3000;
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
const questionRoutes = require('./routes/questions');

app.get('/', (req, res) => {
  res.render('index');
})
app.get('/test', (req, res) => {
  res.render('test');
})

app.use('/questions', questionRoutes);

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