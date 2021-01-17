const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const winston = require('./config/winston');

const indexRouter = require('./routes/index');
const roomsRouter = require('./routes/rooms');
const metaTypesRouter = require('./routes/metaTypes');
const loginRouter = require('./routes/login');

const cras = require('./src/javascripts/cras');
const app = express();
const cors = require('cors');
// const {loggers} = require('winston')
// const logger = loggers.get('appLogger');

app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded());
app.use(require('express-session')({ secret: 'top secret', resave: false, saveUninitialized: false }));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(morgan('combined', { stream: winston.stream }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors({ origin: '*' }));

// https://www.freecodecamp.org/news/learn-how-to-handle-authentication-with-node-using-passport-js-4a56ed18e81e/

// ---
const User = require('./src/javascripts/model/users');
const map = require('./src/javascripts/model/usersMap');
const user1 = new User(1, 'j.zech@thalia.de');
user1.setPassword('test123');
const user2 = new User(2, 'Conny');
user2.setPassword('Test456');
map.updateMap(user1);
map.updateMap(user2);
console.log(user1.id + ' ' + user1.email + ' ' + user1.validatePassword('Test123') + '\n' + user1.hash);
console.log(user2.id + ' ' + user2.email + ' ' + user2.validatePassword('Test456'));


// ---
app.use('/api/', indexRouter);
app.use('/api/rooms', roomsRouter);
app.use('/api/metaTypes', metaTypesRouter);
app.use('/api/login', loginRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
// noinspection JSUnusedLocalSymbols
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// Starte Application
cras.init(); // Set Debug State

module.exports = app;
