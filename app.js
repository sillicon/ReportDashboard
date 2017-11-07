var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var MongoClient = require('mongodb').MongoClient;

//var index = require('./routes/index');
//var users = require('./routes/users');
var uploadReport = require('./routes/uploadReport');
var queryReports = require('./routes/queryReports');
var getTestName = require('./routes/getTestName');
var deployPath = process.env.deployPath || "";

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
app.use(deployPath, favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json({
    limit: '50mb'
}));
app.use(bodyParser.urlencoded({
    limit: '50mb',
    extended: false
}));
app.use(cookieParser());
app.use(deployPath, express.static(path.join(__dirname, 'public')));

//app.use('/', index);
//app.use('/users', users);

app.use(deployPath, uploadReport);
app.use(deployPath, queryReports);
app.use(deployPath, getTestName);

app.get(deployPath, function (req, res) {
    res.sendFile(path.join(__dirname, 'public', 'home.html'));
});
app.get(deployPath + "/ReadReport", function (req, res) {
    res.sendFile(path.join(__dirname, 'public', 'ReadReport.html'));
});
app.get(deployPath + "/UploadReport", function (req, res) {
    res.sendFile(path.join(__dirname, 'public', 'UploadReport.html'));
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Page Not Found');
    err.status = 404;
    next(err);
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