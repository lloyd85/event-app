/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var bcrypt = require('bcryptjs')

var nodemailer = require('nodemailer')
var emailTemplates = require('email-templates')
//var emailTemplates = require('email-templates-windows')
var templatesDir = path.resolve(__dirname, 'templates');

var mongo = require('mongodb');
var monk = require('monk');
var mongoUri = 'localhost:27017/nodetest1' || process.env.MONGOLAB_URI ||
    process.env.MONGOHQ_URL ||
    'mongodb://heroku_app19923930:lm24dtlpr0e4q7ik9iu2essm2@ds053188.mongolab.com:53188/heroku_app19923930';

var db = monk(mongoUri);

var app = express();

// all environments
app.set('port', process.env.PORT || 8000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

/*// development only
 if ('development' == app.get('env')) {
 app.use(express.errorHandler());
 }*/

app.get('/', routes.index);

app.get('/userlist', checkAuth, routes.userlist(db));
app.get('/newuser', routes.newuser);
app.post('/adduser', routes.adduser(db, bcrypt));

app.get('/login', routes.login);
app.post('/loginuser', routes.loginuser(db, bcrypt));
app.get('/logout', routes.logout);

app.get('/welcome', checkAuth, routes.welcome(db));
app.get('/mydetails', checkAuth, routes.mydetails(db));
app.put('/updatemydetails/:id', checkAuth, routes.updatemydetails(db));
app.get('/deletemydetails/:id', checkAuth, routes.deletemydetails(db));

app.get('/eventlist', routes.eventlist(db));
app.get('/myevents', checkAuth, routes.myevents(db));
app.get('/events', checkAuth, routes.events(db));
app.get('/event/:id', routes.event(db));
app.get('/newevent', checkAuth, routes.newevent);
app.post('/addevent', routes.addevent(db));
app.get('/deleteevent/:id', routes.deleteevent(db));
app.put('/updateevent/:id', checkAuth, routes.updateevent(db));

app.put('/subscribe/:id', routes.subscribe(db, emailTemplates, templatesDir, nodemailer));
app.put('/unsubscribe/:id', routes.unsubscribe(db, emailTemplates, templatesDir, nodemailer));

app.post('/invite/:id', checkAuth, routes.invite(db, emailTemplates, templatesDir, nodemailer));

function checkAuth(req, res, next) {
    if (!req.session.user_id) {
        res.send('You are not authorized to view this page');
    } else {
        next();
    };
};

http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});
