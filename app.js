var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var path = require('path');

var routes = require('./routes/routes');

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var Datastore = require('nedb-promise');
var db = new Datastore({ filename: path.join(__dirname, 'users.db'), autoload: true });

var config = require('./public/js/config');

var bcrypt = require('bcryptjs');

var app = express();

app.set('db', db);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));

// i really doubt i need all three of these, fix later
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({ extended: false, limit: '50mb' }));

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

var session = require('express-session');

var NedbStore = require('nedb-session-store')(session);
app.set('sessionStore', new NedbStore({filename: path.join(__dirname, 'sessions.db')}));

// required for passport session
app.use(session({
  secret: config.expressSessionSecret,
  resave: false,
  saveUninitialized: false,
  store: app.get('sessionStore')
}));

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
  done(null, user.username);
});

passport.deserializeUser(function(username, done) {

  db.findOne({ username: username }).then((user)=>{
    if (!user) {
      return done(null, false, { message: 'User not found.' });
    }
    return done(null, {username: user.username});
  })
  .catch((err)=>{
    return done(err);
  });
    
});

passport.use(new LocalStrategy(function(username, password, done) {
  process.nextTick(function() {

    db.findOne({ username: username }).then((user)=>{
      
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }

      bcrypt.compare(password, user.passwordHash)
        .then((res)=>{
          if (res) {
            return done(null, user);
          }
          else {
            return done(null, false, { message: 'Incorrect password.' });
          }
        })
        .catch((err)=>{
          console.dir(err);
          return done(null, false, { message: 'An error occurred.' });
        });

    })
    .catch((err)=>{
      console.dir(err);
      return done(err);
    });

  });
}));

app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: err
  });
});

module.exports = app;