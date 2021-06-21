const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy; 
const bcrypt = require('bcryptjs');
const flash = require('connect-flash');
 
const User = require('./models/user');

/** 
 * Add empty profile photo for clubs
 * Add error messages to login view
 * Convert time_stamp to Human Understandable time
 * Create Users page
 * 
*/

// dotenv config
require('dotenv').config();

// Routes
const indexRouter = require('./routes/index');
const clubRouter = require('./routes/club');

const app = express();

// setup mongoose connection
const mongoose = require('mongoose');
const demoMongoURL = 'mongodb+srv://demo:kAzd1HlKAh7dxaIn@cluster0.pvwff.mongodb.net/breddit-demo?retryWrites=true&w=majority';
mongoose.connect(process.env.MONGODB_URI || demoMongoURL, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, "MongoDB Connection Error: "));

// view engine setup
// add more paths for views in here 
app.set('views', [
  path.join(__dirname, 'views'), 
  path.join(__dirname, 'views', 'auth'), 
  path.join(__dirname, 'views', 'club'), 
  path.join(__dirname, 'views', 'post'),
]);
app.set('view engine', 'pug');

// for LogIn
passport.use('local',
  new LocalStrategy({ passReqToCallback: true }, function(req, username, password, done) {
    User.findOne({ "username": username }, (err, user) => {
      if (err) return done(err);

      if (!user) {        
        return done(null, false, req.flash('errorUsername', 'Incorrect Username'));
      }

      bcrypt.compare(password, user.password, (err, res) => {
        if (res) return done(null, user);
        req.flash('previousUsername', req.body.username);
        return done(null, false, req.flash('errorPassword', 'Incorrect Password'));
      })
    })
  })
);

// Use the LocalStrategy within Passport to register/"signup" users.
passport.use('signup', new LocalStrategy({
  passReqToCallback: true, 
  }, 
  function(req, username, password, done) {
    bcrypt.hash(password, 10, (err, hashedPass) => {
      if (err) return next(err);

      const user = new User({
          first_name: req.body.first_name, 
          last_name: req.body.last_name,
          username: username.toLowerCase(), 
          password: hashedPass
      });

      user.save(err => {
          if (err) return next(err);
          return done(null, user);
        });
    });
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  })
});

app.use(logger('dev'));
app.use(express.json());
app.use(session({ secret: "cats", resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(flash());
app.use(express.static(path.join(__dirname, 'public')));

// Pass current user to all the views
app.use((req, res, next) => {
  // console.log(req.user);
  if (req.user) { 
    res.locals.currUser = req.user;
  }
  next();
})

app.use('/', indexRouter);
app.use('/club', clubRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
