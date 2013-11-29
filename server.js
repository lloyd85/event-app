
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var bcrypt = require('bcrypt')

var nodemailer = require('nodemailer')
var emailTemplates = require('email-templates-windows')
var templatesDir = path.resolve(__dirname, 'templates');


var mongo = require('mongodb');
var monk = require('monk');
var db = monk('localhost:27017/nodetest1');

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

app.get('/eventlist', checkAuth, routes.eventlist(db));
app.get('/newevent', checkAuth, routes.newevent);
app.post('/addevent', routes.addevent(db));
app.post('/deleteevent', checkAuth, routes.addevent(db));
app.put('/updateevent/:id', checkAuth, routes.updateevent(db));

app.put('/subscribe/:id', routes.subscribe(db, emailTemplates, templatesDir, nodemailer));
app.put('/unsubscribe/:id', routes.unsubscribe(db, emailTemplates, templatesDir, nodemailer));

app.post('/invite/:id', checkAuth, routes.invite(db, emailTemplates, templatesDir, nodemailer));

app.post('/deleteattendee/:id/:attendee_id', checkAuth, routes.deleteattendee(db, emailTemplates, templatesDir, nodemailer));

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
