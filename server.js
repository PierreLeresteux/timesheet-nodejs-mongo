var express = require('express');
var ts = require('./routes/timesheet');
var libs = require('./routes/libs');

var app = express();

app.configure(function () {
    app.use(express.logger('dev'));     /* 'default', 'short', 'tiny', 'dev' */
    app.use(express.bodyParser());
    app.use(express.static(__dirname+'/client'));
    app.use(express.errorHandler({ dumpExceptions:true, showStack:true }));
});

//INIT (must be remove later)
app.get('/init', ts.init);
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
