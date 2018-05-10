var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require('body-parser');
var session = require('express-session');
var flash = require('connect-flash');
var MongoStore = require('connect-mongo')(session);
var pkg = require('./package');

var config = require('./config/config');
var routes = require('./routes/index');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    name: 'paprika',
    secret: 'paprika',
    cookie: {maxAge: 6000000},
    store:new MongoStore({url:config.mongodb}),
    resave: true,
    saveUninitialized: true
}));

app.use(flash());

routes(app);

app.locals.blog = {
    title: pkg.name,
    description: pkg.description
};

app.use(function(err, req, res, next) {
    res.locals.user = req.session.user;
    res.locals.success = req.flash('success').toString();
    res.locals.error = req.flash('error').toString();
    next()
});

const PORT = process.env.PORT || config.port;

app.listen(PORT, function(){
    console.log(`Express listening on port ${PORT}`);
});

module.exports = app;
