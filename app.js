'use strict';

//dependencies
var config = require('./config'),
    express = require('express'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    session = require('express-session'),
    mongoStore = require('connect-mongo')(session),
    http = require('http'),
    path = require('path'),
    passport = require('passport'),
    mongoose = require('mongoose'),
    helmet = require('helmet'),
    socket_io = require('socket.io'),
    csrf = require('csurf');

//create express app
var app = express();

//keep reference to config
app.config = config;

//setup the web server
app.server = http.createServer(app);

//setup socket.io

var io = socket_io.listen(app.server);

//setup mongoose
app.db = mongoose.createConnection(config.mongodb.uri);
app.db.on('error', console.error.bind(console, 'mongoose connection error: '));
app.db.once('open', function () {
  //and... we have a data store
});

//config data models
require('./models')(app, mongoose);

//settings
app.disable('x-powered-by');
app.set('port', config.port);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

//middleware
app.use(require('morgan')('dev'));
app.use(require('compression')());
app.use(require('serve-static')(path.join(__dirname, 'public')));
app.use(require('method-override')());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser(config.cryptoKey));
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: config.cryptoKey,
  store: new mongoStore({ url: config.mongodb.uri })
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(csrf({ cookie: { signed: true } }));
helmet(app);

//response locals
app.use(function(req, res, next) {
  res.cookie('_csrfToken', req.csrfToken());
  res.locals.user = {};
  res.locals.user.defaultReturnUrl = req.user && req.user.defaultReturnUrl();
  res.locals.user.username = req.user && req.user.username;
  res.locals.user.isTutor = req.user && req.user.isTutor;
  next();
});

//global locals
app.locals.projectName = app.config.projectName;
app.locals.copyrightYear = new Date().getFullYear();
app.locals.copyrightName = app.config.companyName;
app.locals.cacheBreaker = 'br34k-01';

//setup passport
require('./passport')(app, passport, express);

//setup routes
require('./routes')(app, passport);


//custom (friendly) error handler
app.use(require('./views/http/index').http500);


//setup utilities
app.utility = {};
app.utility.sendmail = require('./util/sendmail');
app.utility.slugify = require('./util/slugify');
app.utility.workflow = require('./util/workflow');

//listen up
app.server.listen(app.config.port, function(){
  //and... we're live
  console.log('Server is running on port ' + config.port);
});

var getUsersInRoomNumber = function(roomName, namespace) {
    if (!namespace) namespace = '/';
    var room = io.nsps[namespace].adapter.rooms[roomName];
    if (!room) return null;
    return Object.keys(room).length;
}

var fs = require('fs');

function handler (req, res) {
     fs.readFile(__dirname + '/index.html',
         function (err, data) {

             if (err) {
                 res.writeHead(500);
                 return res.end('Error loading index.html');
             }
             res.writeHead(200);
             res.end(data);
         });
}


io.sockets.on('connection', function (socket) {
socket.on('join room', function(data){
// check for SHA-1 string
if(data.room.match(/^[A-Za-z0-9]{40}$/) == null) {
socket.emit('user error', {error: 'invalid room', message:
'The server will disconnect now'});
socket.disconnect();
}
else if(getUsersInRoomNumber > 2){
socket.emit('user error', {error: 'too many users', message:
'The server will disconnect now'});
socket.disconnect();
}
else {
socket.room = data.room;
socket.join(socket.room);
socket.emit('user joined', {user_count:
Object.keys(io.nsps['/'].adapter.rooms[socket.room]).length, user: 'current'});
            socket.broadcast.to(socket.room).emit('user joined',
{user_count: Object.keys(io.nsps['/'].adapter.rooms[socket.room]).length, user: 'other'});
        }
}).on('disconnect', function(data){
socket.broadcast.to(socket.room).emit('user left', {data: 'left'});
}).on('webrtc', function(data) {
// if(socket.room == data.room) {
socket.broadcast.to(socket.room).emit('webrtc', data);
// }
});
});