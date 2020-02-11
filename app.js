let createError = require('http-errors');
let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let morgan = require('morgan');
let winston = require('./config/winston');

let indexRouter = require('./routes/index');
let roomsRouter = require('./routes/rooms');
let metaTypesRouter = require('./routes/metaTypes');

let cras = require('./public/javascripts/cras');
let app = express();
let cors = require('cors');

//const {loggers} = require('winston')
//const logger = loggers.get('appLogger');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(morgan('combined', {stream: winston.stream}));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// use it before all route definitions
app.use(cors({origin: '*'}));

app.use('/', indexRouter);
app.use('/rooms', roomsRouter);
app.use('/metaTypes', metaTypesRouter);

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

//Starte Application
cras.init();  //Set Debug State

module.exports = app;
