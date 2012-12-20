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

app.get('/categories', ts.categories.findAll);
app.post('/categories', ts.categories.create);
app.get('/categories/:id', ts.categories.findById);
app.put('/categories/:id', ts.categories.replace);
app.patch('/categories/:id', ts.categories.update);
app.get('/projects', ts.projects.findAll);
app.post('/projects', ts.projects.create);
app.get('/projects/:id', ts.projects.findById);
app.put('/projects/:id', ts.projects.replace);
app.patch('/projects/:id', ts.projects.update);

app.get('/activities', ts.activities.findAll);
app.post('/activities', ts.activities.create);

app.get('/activities-:year-:month.csv', ts.activities.toCsv);

// 3rd party libs
libs.init(app);

// Goto -> /index
app.get('/', function(req, res){res.redirect('/index');});

var port = process.env.PORT || 5000;
app.listen(port);
console.log('Listening on port '+port);
