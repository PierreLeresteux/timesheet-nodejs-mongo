var express = require('express');
var timesheet = require('./modules/timesheet');
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
    app.use(express.static(dev ? __dirname + '/client' : __dirname + '/build/output'));
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

// INIT (must be removed later)
app.get('/init', function(req, res) {
    timesheet.populateDB();
    res.send();
});


// index.html
app.set('view engine', 'html');
app.engine('html', require('hbs').__express);
app.set('views', __dirname + '/client/html');
app.get('/index', function(req, res){
    res.render('index', {'dev': dev});
});

var resultSender = function(res) {
    return function(result, status) {
        status ? res.send(status, result) : res.send(result);
    }
};

// Categories
app.get('/categories', function(req, res) {
    timesheet.categories.findAll(resultSender(res));
});
app.post('/categories', function(req, res) {
    var category = req.body;
    timesheet.categories.create(category, resultSender(res));
});
app.get('/categories/:id', function(req, res) {
    var categoryId = req.params.id;
    timesheet.categories.findById(categoryId, resultSender(res));
});
app.put('/categories/:id', function(req, res) {
    var categoryId = req.params.id;
    var category = req.body;
    timesheet.categories.replace(categoryId, category, resultSender(res))
});
app.patch('/categories/:id', function(req, res) {
    var categoryId = req.params.id;
    var category = req.body;
    timesheet.categories.update(categoryId, category, resultSender(res));
});

// Projects
app.get('/projects', function(req, res) {
    timesheet.projects.findAll(resultSender(res));
});
app.post('/projects', function(req, res) {
    var categoryId = req.query.category_id;
    var project = req.body;
    timesheet.projects.create(project, categoryId, resultSender(res));
});
app.get('/projects/:id', function(req, res) {
    var projectId = req.params.id;
    timesheet.projects.findById(projectId, resultSender(res));
});
app.put('/projects/:id', function(req, res) {
    var projectId = req.params.id;
    var project = req.body;
    timesheet.projects.replace(projectId, project, resultSender(res));
});
app.patch('/projects/:id', function(req, res) {
    var projectId = req.params.id;
    var project = req.body;
    timesheet.projects.update(projectId, project, resultSender(res));
});

// Activities
app.get('/activities', function(req, res) {
    var user = req.query.user;
    var year = req.query.year;
    var month = req.query.month;
    timesheet.activities.findAll(user, year, month, resultSender(res));
});
app.post('/activities', function(req, res) {
    var activity = {
        user: req.body.user,
        date: {
            year: req.body.date.year,
            month: req.body.date.month,
            day: req.body.date.day
        },
        project: {
            id: req.body.project.id
        }
    };
    timesheet.activities.create(activity, resultSender(res));
});
app.get('/activities-:year-:month.csv', function(req, res) {
    var year = req.params.year;
    var month = req.params.month;
    res.contentType('csv');
    timesheet.activities.exportToCsv(year, month, resultSender(res));
});

// 3rd party libs
libs.init(app);

// Goto -> /index
app.get('/', function(req, res){res.redirect('/index');});

var port = process.env.PORT || 5000;
app.listen(port);
console.log('Listening on port ' + port);
