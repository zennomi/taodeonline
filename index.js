require('dotenv').config();

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const TeXToMML = require("tex-to-mml");
const mongoose = require('mongoose');

const port = process.env.PORT ? process.env.PORT : 8080;

const fbAdminIds = process.env.FACEBOOK_ADMIN_IDS.split(",");

app.set('views', './views');
app.set('view engine', 'pug');
app.use(express.static('public'));
app.use(express.static('node_modules/@wiris/mathtype-ckeditor4'));

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET,
  key: 'sid',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 7*24*60*60*1000 }
}));
app.use(require('express-flash')());

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

const Test = require('./models/test.model');
const Question = require('./models/question.model');
const Result = require('./models/result.model');

const questionRoutes = require('./routes/questions');
const testRoutes = require('./routes/tests');
const authRoutes = require('./routes/auth');

const authMiddlewares = require('./middlewares/auth.middleware');


const passport = require('passport');
const Strategy = require('passport-facebook').Strategy;


// Configure Passport authenticated session persistence.
passport.serializeUser(function (user, cb) {
  cb(null, user);
});

passport.deserializeUser(function (obj, cb) {
  cb(null, obj);
});


// Configure the Facebook strategy for use by Passport.
passport.use(new Strategy({
  clientID: process.env['FACEBOOK_CLIENT_ID'],
  clientSecret: process.env['FACEBOOK_CLIENT_SECRET'],
  callbackURL: process.env['CALLBACK_URL']
},
  function (accessToken, refreshToken, profile, done) {
    process.nextTick(function () {
      if (fbAdminIds.indexOf(profile.id) > -1) {
        profile.role = 'admin';
        profile.isAdmin = true;
      }
      else profile.role = 'user';
      return done(null, profile);
    });
  }
));
app.use(passport.initialize());
app.use(passport.session());

app.use(function (req, res, next) {
  if (req.user) res.locals.user = req.user;
  else res.locals.user = undefined;
  next();
})

app.get('/', (req, res) => {
  res.render('index');
})


app.use('/questions', questionRoutes);
app.use('/tests', testRoutes);
app.use('/auth', authRoutes);

app.get('/user', authMiddlewares.authRequire, (req, res) => {
  res.render('users/profile');
})

app.get('/history', (req, res) => {
  console.log(req.cookies.history);
  if (req.flash().history) res.redirect(req.flash().history[0]);
  else if (req.cookies.history) res.redirect(req.cookies.history);
  else res.redirect('/');
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
    res.cookie('questions', { ids: [] }, { expires: new Date(Date.now() + 7 * 24 * 3600), httpOnly: true })
    response.idNewTest = newTest._id;
    res.json(response);
    return;
  })
})

app.post('/api/new-result', authMiddlewares.authRequire, (req, res) => {
  let response = { status: 200 };
  let newResult = new Result({
    test_id: req.body.testId,
    user: {
        facebook_id: req.user.id,
        display_name: req.user.displayName
    },
    leaves_area_times: 0,
    started_time: new Date()
});
newResult.save((err, result) => {
    if (err) {
      response.status = 201;
      return res.json(response);
    }
    response.resultId = result._id;
    return res.json(response);
})
})

app.post('/api/submit-choices', authMiddlewares.authRequire, async (req, res) => {
  let response = { status: 200 };
  let matchedResult = await Result.findById(req.body.resultId);
  
  if (!matchedResult) {
    response.status = 201;
    return res.json(response);
  }
  matchedResult.leaves_area_times = req.body.leavesAreaTimes;
  matchedResult.choices = [...req.body.choices];
  if (req.body.isFinished) matchedResult.finished_time = new Date();
  matchedResult.save((err, result) => {
    if (err) response.status = 201;
    res.json(response);
  })
  return;
})

app.get('/api/tests/:id/trueChoices', authMiddlewares.authRequire, async (req, res) => {
  let response = { status: 200 };
  let matchedTest = await Test.findById(req.params.id).populate('questions');
  if (!matchedTest) {
    response.status = 201;
    res.json(response);
    return;
  }
  response.result = matchedTest.questions.map(q => q.choices.filter(c => c.isTrue)[0]._id);
  res.json(response);
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})