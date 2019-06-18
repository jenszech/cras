var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var morgan = require('morgan');
var winston = require('./config/winston');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var roomsRouter = require('./routes/rooms');

const {DateTime} = require("ews-javascript-api");
var cras = require('./public/javascripts/cras');
var exchConn = require('./public/javascripts/exchangeConnector');
var app = express();

const {loggers} = require('winston')
const logger = loggers.get('appLogger');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(morgan('combined', {stream: winston.stream}));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

var cors = require('cors');
// use it before all route definitions
app.use(cors({origin: '*'}));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/rooms', roomsRouter);

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

//Starte Application
cras.init();  //Set Debug State

//Test Stuff
// var ews = require('ews-javascript-api');
// var attendee =[ new ews.AttendeeInfo("j.zech@thalia.de")];
// exchConn.GetRoomLists();
// exchConn.GetRooms("V_TDE_B_Raumliste@tde.thalia.de");
//
// exchConn.FindAppointments(DateTime.Now.Add(-1, "week"), DateTime.Now);

module.exports = app;
