
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var bcrypt = require('bcrypt');

var mongo = require('mongodb');
var monk = require('monk');
var db = monk('localhost:27017/nodetest1');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
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
app.get('/helloworld', checkAuth, routes.helloworld);
app.get('/welcome', checkAuth, routes.welcome);

app.get('/users', user.list);
app.get('/userlist', checkAuth, routes.userlist(db));
app.get('/newuser', routes.newuser);
app.post('/adduser', routes.adduser(db, bcrypt));

app.get('/login', routes.login);
app.post('/loginuser', routes.loginuser(db, bcrypt));
app.get('/logout', routes.logout);

app.get('/eventlist', checkAuth, routes.eventlist(db));
app.get('/event/:id',  checkAuth, routes.event(db));
app.get('/newevent', checkAuth, routes.newevent);
app.post('/addevent', routes.addevent(db));

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
