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
const handlebarHelpers = require('handlebars-helpers')();

// Database connection...
global.ObjectId = mongoose.Types.ObjectId;
global.db = require('./models/index')(mongoose);
// console.log(db.models.user);

// Firebase storage connection authentication
global.firebaseStorage = require('./firebase_storage').initialize();
var app = express();

const hbs = create({
  extname: '.hbs',
  helpers: { ...helpers, ...handlebarHelpers }
});
// view engine setup
app.engine('hbs', hbs.engine);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');


// peer object for peer connection in peer to peer video calling
var http = require('http');
var server = http.createServer(app);

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
      return done(null, user);
    }).catch(function (err) {
      console.log(err);
      return done(null, false)
    });
  }
));

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(async function (user, done) {
  try {
    done(null, user);
  } catch (err) {
    console.log(err);
  }
});

app.use('/', require('./routes/index'));

app.use(function (req, res, next) {
  if (req.isAuthenticated()) {
    res.locals.user = req.user;
    return next();
  }
  res.redirect('/');
})

app.use('/users', require('./routes/users'));
app.use('/users', require('./routes/followers'));
app.use('/users', require('./routes/notifications'));
app.use('/users', require('./routes/chat'));
app.use('/posts', require('./routes/posts'));
app.use('/posts', require('./routes/likes'));
app.use('/posts', require('./routes/comments'));
app.use('/reports', require('./routes/reports'));

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
