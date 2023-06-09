require('custom-env').env('development');
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var { create } = require('express-handlebars');
const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const session = require('express-session');
const cookie_session = require('cookie-session');
const flash = require('connect-flash');
const md5 = require('md5');
const mongoose = require('mongoose');
const helpers = require('./helpers/helpers');
var handlebarHelpers = require('handlebars-helpers')();



// Database connection...
global.ObjectId = mongoose.Types.ObjectId;
global.db = require('./models/index')(mongoose);
// console.log(db.models.user);

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var postsRouter = require('./routes/posts');
var reportsRouter = require('./routes/reports');

var app = express();

const hbs = create({
  extname: '.hbs',
  helpers: {...helpers,...handlebarHelpers}
});
// view engine setup
app.engine('hbs', hbs.engine);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.resolve('./public')));

app.use(cookie_session({
  secret: "session",
  key: "abhH4re5Uf4Rd0KndsadgdsdfdSsdf05f3V",
}));

app.use(session({
  secret: 'asidjhpah137723kekwq', // Use a secret key to sign the session ID cookie
  saveUninitialized: true,
  resave: true,
  maxAge: Date.now() + 30 * 86400 * 1000,
  cookie: { secure: true }
}));

app.use(cookieParser());
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());


passport.use(new localStrategy({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true
},
  function (req, username, password, done) {
    db.models.user.findOne({ email: username }).then(user => {
      if (!user) {
        req.flash('info', 'The email or password entered is invalid !');
        return done(null, false);
      }
      if (password != user.password) {
        req.flash('info', 'The email or password entered is invalid !');
        return done(null, false);
      }
      console.log("authenticated");
      return done(null, user);
    }).catch(function (err) {
      console.log(err);
      return done(null, false)
    });
  }
));

passport.serializeUser(function (user, done) {
  console.log("in serialization");
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  try {
    console.log("in deserialization");
    done(null, user);
  } catch (err) {
    console.log(err);
  }
});

app.use('/', indexRouter);

app.use(function (req, res,next) {
  if (req.isAuthenticated()) {
    res.locals.user = req.user;
    return next();
  }
  res.redirect('/');
})


app.use('/users', usersRouter);
app.use('/posts', postsRouter);
app.use('/reports', reportsRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
