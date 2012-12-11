var express = require('express'),
    ts = require('./routes/timesheet');

var app = express();

app.configure(function () {
    app.use(express.logger('dev'));     /* 'default', 'short', 'tiny', 'dev' */
    app.use(express.bodyParser());
});

app.get('/init', ts.init);
app.get('/ts', ts.findAll);
app.get('/ts/:id', ts.findById);
app.get('/ts/:user/:day', ts.findByDayAndUser);
app.post('/ts', ts.addts);
app.put('/ts/:id', ts.updatets);
app.delete('/ts/:id', ts.deletets);

app.listen(3000);
console.log('Listening on port 3000...');