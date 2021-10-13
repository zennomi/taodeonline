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
// app.use(express.static('node_modules/@wiris/mathtype-ckeditor4'));

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
    secret: process.env.SESSION_SECRET,
    key: 'sid',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 }
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
const courseRoutes = require('./routes/courses');
const quesApiRoutes = require('./api/routes/question.route');
const testApiRoutes = require('./api/routes/test.route');
const resultApiRoutes = require('./api/routes/result.route');

const authMiddlewares = require('./middlewares/auth.middleware');




if (process.env['NODE_ENV'] != 'development') {

    // Configure Passport authenticated session persistence.
    const passport = require('passport');
    const Strategy = require('passport-facebook').Strategy;

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
                console.log(profile);
                if (fbAdminIds.indexOf(profile.id) > -1) {
                    profile.role = 'admin';
                    profile.isAdmin = true;
                } else profile.role = 'user';
                return done(null, profile);
            });
        }
    ));
    app.use(passport.initialize());
    app.use(passport.session());

} else {
    // init user for env dev
    app.use((req, res, next) => {
        req.user = {
            isAdmin: true,
            displayName: "Chàm Cẩm Vì Đề",
            id: "69696969"
        };
        next();
    })
}




app.use(function (req, res, next) {
    app.locals.basedir = './public';
    res.locals.domainName = process.env.DOMAIN_NAME;
    if (req.user) {
        res.locals.user = req.user;
        res.locals.user.software = req.get("User-Agent");
    } else res.locals.user = undefined;
    if (req.path != '/auth' && req.path != '/history') res.locals.history = req.originalUrl;
    next();
})

app.get('/history', (req, res) => {
    if (req.cookies.history) res.redirect(req.cookies.history);
    else res.redirect('/');
})

app.get('/', (req, res) => {
    res.render('index');
})

app.get('/privacy-policy', (req, res) => {
    res.render('privacy-policy');
})

app.use('/questions', questionRoutes);
app.use('/tests', testRoutes);
app.use('/courses', courseRoutes);
app.use('/auth', authRoutes);
app.use('/api/questions', quesApiRoutes);
app.use('/api/tests', testApiRoutes);
app.use('/api/results', resultApiRoutes);

// app.get('/user/me', authMiddlewares.authRequire, (req, res) => {

//     res.render('users/profile');
// })

app.get('/user/:id', authMiddlewares.authRequire, (req, res) => {
    Result.find({ "user.facebook_id": req.params.id }).populate({ path: 'test_id', populate: { path: 'questions' } }).exec((err, results) => {
        if (err) return res.send(err);
        results.forEach(r => {
            // console.log(r);
            let trueChoicesId = [];
            r.test_id.questions.forEach(q => trueChoicesId.push(...q.getTrueChoiceArray()));
            r.mark = r.choices.map(c => String(c.choice_id)).filter(c => trueChoicesId.includes(c)).length / r.test_id.questions.length * 10;
            // r.test_id.questions = undefined;
        })
        res.render('users/profile', { results });
    })
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

app.post('/api/result/view', authMiddlewares.authRequire, async (req, res) => {
    let result;
    try {
        result = await Result.findById(req.body.id).populate({ path: 'test_id', populate: { path: 'questions' } });
        if (!result) throw new Error('Not Found Result');
        if (!result.test_id) throw new Error('Not Found Test');
    } catch (err) {
        res.json({ status: 404 });
    }

    let topics = {};


    let trueChoices = [];
    let selectedChoices = result.choices.map(c => String(c.choice_id));

    result.test_id.questions.forEach(q => {
        let trueChoicesOfQues = q.getTrueChoiceArray().map(c => String(c));
        q.main_tags.forEach(tag => {
            tag = tag.value;
            if (!topics[tag]) topics[tag] = { count: 0, total: 0 };
            if (trueChoicesOfQues.some(c => selectedChoices.includes(c))) topics[tag].count += q.level;
            topics[tag].total += q.level
        })
        trueChoices.push(...trueChoicesOfQues);
    })
    let choices = result.choices.map(c => {
        return {
            moment: c.moment ? c.moment.getTime() : 0,
            isTrue: trueChoices.indexOf(String(c.choice_id)) > -1
        }
    });
    if (choices.length == 0) choices.push(0);
    let minTime = Math.min(...choices.map(c => c.moment));
    choices = choices.map((t, i) => {
        return {
            moment: Math.round((t.moment - minTime) / 60000 * 10) / 10,
            isTrue: t.isTrue,
            index: i + 1
        }
    });
    res.json({ status: 200, result, choices, topics });
})

app.get('*', function (req, res) {
    res.status(404).send('bon le bon not phao.');
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})