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
app.post('/ts', ts.addts);
app.put('/ts/:id', ts.updatets);
app.delete('/ts/:id', ts.deletets);
// user
app.get('/user', ts.allUsers);
app.get('/ts/user/:user', ts.findByUser);

// project
app.get('/project', ts.allProjects);
app.get('/ts/project/:project', ts.findByProject);

var port = process.env.PORT || 3000
app.listen(port);
console.log('Listening on port '+port);
