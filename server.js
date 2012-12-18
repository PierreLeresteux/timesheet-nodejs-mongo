var express = require('express');
var ts = require('./modules/timesheet');
var libs = require('./modules/libs');
var exec = require('child_process').exec;
var app = express();
var dev = false;

process.argv.forEach(function (val, index, array) {
    if(val == 'dev') {
        dev = true;
        return;
    }
});

if(!dev) {
    var callback = function(error, stdout, stderr){
        console.log(stdout);
        console.log(stderr);
        if(error !== null){
            console.log('Error: ' + error);
        }
    };
    exec('chmod ug+x build.sh', callback);
    exec('./build.sh', callback);
}

app.configure(function () {
    app.use(express.logger('dev'));     /* 'default', 'short', 'tiny', 'dev' */
    app.use(express.bodyParser());
    app.use(express.cookieParser());
    app.use(express.session({ secret: 'allez-la-le-secret-la' }));
    app.use(express.methodOverride());
    app.use(express.static(dev ? __dirname+'/client' : __dirname+'/build/output'));
    app.use(express.errorHandler({ dumpExceptions:true, showStack:true }));
});

//INIT (must be remove later)
app.get('/init', ts.init);


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

app.get('/categories', ts.categories.findAll);
app.get('/categories/:id', ts.categories.findById);
app.get('/categories/:id/projects', ts.categories.projects.findAll);
app.get('/categories/:cid/projects/:pid', ts.categories.projects.findById);

app.get('/activities', ts.activities.findAll);

app.get('/activities-:year-:month.csv', ts.activities.toCsv);

// 3rd party libs
libs.init(app);

// Goto -> /index
app.get('/', function(req, res){res.redirect('/index');});

var port = process.env.PORT || 5000;
app.listen(port);
console.log('Listening on port '+port);
