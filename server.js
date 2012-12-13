var express = require('express');
var ts = require('./modules/timesheet');
var libs = require('./modules/libs');
//var AM = require('./modules/account-manager');

var app = express();
var dev = false;

process.argv.forEach(function (val, index, array) {
    if(val == 'dev') {
        dev = true;
        return;
    }
});

app.configure(function () {
    app.use(express.logger('dev'));     /* 'default', 'short', 'tiny', 'dev' */
    app.use(express.bodyParser());
    app.use(express.cookieParser());
    app.use(express.session({ secret: 'allez-la-le-secret' }));
    app.use(express.methodOverride());
    app.use(express.static(dev ? __dirname+'/client' : __dirname+'/build/output'));
    app.use(express.errorHandler({ dumpExceptions:true, showStack:true }));
});

//INIT (must be remove later)
app.get('/init', ts.init);


// AUTHENTICATION
app.get('/connect', function(req, res){
    console.log("Hello there "+req.cookies);
    // check if the user's credentials are saved in a cookie //
    if (!req.cookies || req.cookies.user == undefined || req.cookies.pass == undefined){
        console.log('autologin failed');
        res.send('Hello - Please Login To Your Account');
    }	else{
        /*
        AM.autoLogin(req.cookies.user, req.cookies.pass, function(o){
            if (o != null){
                console.log('autologin ok '+req.cookies.user);
                req.session.user = o;
                res.redirect('/home');
            }	else{
                console.log('autologin failed -> wrong cookie');
                res.send('Hello - Please Login To Your Account');
            }
        });
        */
    }
});
app.post('/connect', function(req, res){
    console.log("Manual login : "+req.param('user'));
    /*
    AM.manualLogin(req.param('user'), req.param('pass'), function(e, o){
        if (!o){
            res.send(e, 400);
        }	else{
            req.session.user = o;
            if (req.param('remember-me') == 'true'){
                res.cookie('user', o.user, { maxAge: 900000 });
                res.cookie('pass', o.pass, { maxAge: 900000 });
            }
            res.send(o, 200);
        }
    });
    */
});

// index.html
app.set('view engine', 'html');
app.engine('html', require('hbs').__express);
app.set('views', __dirname + '/client/html');
app.get('/index', function(req, res){
    res.render('index', {'dev': dev});
});

// timesheet CRUD
app.get('/ts', ts.findAll);

app.get('/ts/:id', ts.findById);
app.post('/ts', ts.addTimesheet);
app.put('/ts/:id', ts.updateTimesheet);
app.delete('/ts/:id', ts.deleteTimesheet);
// timesheet EXTENDED
app.get('/ts/project/:project', ts.findByProject);
app.get('/ts/project/:project/stat', ts.aggregByProject);
app.get('/ts/user/:user', ts.findByUser);
// user CRUD
app.get('/user', ts.allUsers);
app.post('/user', ts.addUser);
app.get('/user/:id', ts.findUserById);
app.put('/user/:id', ts.updateUser);
app.delete('/user/:id', ts.deleteUser);
// project CRUD
app.get('/project', ts.allProjects);
app.get('/project/:id', ts.findProjectById);
app.post('/project', ts.addProject);
app.put('/ts/:id', ts.updateProject);
app.delete('/project/:id', ts.deleteProject);

// 3rd party libs
libs.init(app);

var port = process.env.PORT || 3000;
app.listen(port);
console.log('Listening on port '+port);
