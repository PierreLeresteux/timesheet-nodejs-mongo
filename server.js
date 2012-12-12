var express = require('express'),
    ts = require('./routes/timesheet');

var app = express();

app.configure(function () {
    app.use(express.logger('dev'));     /* 'default', 'short', 'tiny', 'dev' */
    app.use(express.bodyParser());
});

//INIT (must be remove later)
app.get('/init', ts.init);
// timesheet CRUD
app.get('/ts', ts.findAll);
app.get('/ts/:id', ts.findById);
app.post('/ts', ts.addTimesheet);
app.put('/ts/:id', ts.updateTimesheet);
app.delete('/ts/:id', ts.deleteTimesheet);
// user
app.get('/user', ts.allUsers);
app.get('/user/:id', ts.findUserById);
app.delete('/user/:id', ts.deleteUser);
app.get('/ts/user/:user', ts.findByUser);

// project
app.get('/project', ts.allProjects);
app.get('/project/:id', ts.findProjectById);
app.delete('/project/:id', ts.deleteProject);
app.get('/ts/project/:project', ts.findByProject);

var port = process.env.PORT || 3000
app.listen(port);
console.log('Listening on port '+port);
