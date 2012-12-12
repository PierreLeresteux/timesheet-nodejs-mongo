var mongo = require('mongodb');
var mongUtil = require('./utilMongo');

var Server = mongo.Server,
	Db = mongo.Db,
	BSON = mongo.BSONPure;

var mongoUri = process.env.MONGOLAB_URI ||  'mongodb://localhost:27017/timesheetdb';
var db;

Db.connect(mongoUri, function (err, database) {
    db = database;
});

/*------------- TIMESHEET ------------------*/

exports.findAll = function(req, res) {
    db.collection('timesheet', function(err, collection) {
	    mongUtil.getAll(collection, res);
    });
};

exports.addTimesheet = function(req, res) {
	var timesheet = req.body;
	console.log('Adding timesheet: ' + JSON.stringify(timesheet));
    db.collection('timesheet', function(err, collection) {
	    mongUtil.insertEntity(collection, timesheet, res);
    });
};

exports.updateTimesheet = function(req, res) {
	var id = req.params.id;
	var timesheet = req.body;
    console.log('Updating timesheet: ' + id);
	console.log(JSON.stringify(timesheet));
    db.collection('timesheet', function(err, collection) {
	    mongUtil.updateEntity(collection, id, timesheet, res);
    });
};

exports.deleteTimesheet = function(req, res) {
	var id = req.params.id;
	console.log('Deleting timesheet: ' + id);
    db.collection('timesheet', function(err, collection) {
	    mongUtil.deleteById(collection, id, res, req);
    });
};

exports.findById = function(req, res) {
    var id = req.params.id;
    console.log('Retrieving timesheet: ' + id);
    db.collection('timesheet', function(err, collection) {
	    mongUtil.getById(collection,id, res);
    });
};
/*------------- TIMESHEET EXTENDED ------------------*/

exports.findByUser = function(req, res) {
	var user = req.params.user;
	var year = ~~req.query.year;
	var month = ~~req.query.month;

	var query = {'user.login':user, 'year': year};
	if (month){
		query.month = month;
	}
	db.collection('timesheet', function(err, collection) {
		mongUtil.findByQuery(collection,query,res);
	});
};

exports.findByProject = function(req, res){
	var project = req.params.project;
	var year = ~~req.query.year;
	var month = ~~req.query.month;

	var query = {'tasks.project':project, 'year': year};
	if (month){
		query.month = month;
	}

	db.collection('timesheet', function(err, collection) {
		mongUtil.findByQuery(collection,query,res);
	});
};

/*------------- PROJECT ------------------*/

exports.allProjects = function(req, res){
    db.collection('project', function(err, collection) {
	    mongUtil.getAll(collection, res);
    });
};

exports.findProjectById = function(req, res){
    var id = req.params.id;
    console.log('Retrieving project: ' + id);
    db.collection('project', function(err, collection) {
	    mongUtil.getById(collection,id, res);
    });
};

exports.addProject = function(req, res) {
	var project = req.body;
	console.log('Adding timesheet: ' + JSON.stringify(project));
	db.collection('project', function(err, collection) {
		mongUtil.insertEntity(collection, project, res);
	});
};
exports.updateProject = function(req, res) {
	var id = req.params.id;
	var project = req.body;
	console.log('Updating project: ' + id);
	console.log(JSON.stringify(project));
	db.collection('project', function(err, collection) {
		mongUtil.updateEntity(collection, id, project, res);
	});
};

exports.deleteProject = function(req, res) {
    var id = req.params.id;
    console.log('Deleting project: ' + id);
    db.collection('project', function(err, collection) {
	    mongUtil.deleteById(collection, id, res, req);
    });
};
/*------------- USER ------------------*/

exports.allUsers = function(req, res){
    db.collection('user', function(err, collection) {
	    mongUtil.getAll(collection, res);
    });
};

exports.findUserById = function(req, res){
    var id = req.params.id;
    console.log('Retrieving user: ' + id);
    db.collection('user', function(err, collection) {
	    mongUtil.getById(collection,id, res);
    });
};

exports.deleteUser = function(req, res) {
    var id = req.params.id;
    console.log('Deleting user: ' + id);
    db.collection('user', function(err, collection) {
	    mongUtil.deleteById(collection, id, res, req);
    });
};
exports.updateUser = function(req, res) {
	var id = req.params.id;
	var user = req.body;
	console.log('Updating user: ' + id);
	console.log(JSON.stringify(user));
	db.collection('user', function(err, collection) {
		mongUtil.updateEntity(collection, id, user, res);
	});
};

exports.addUser = function(req, res) {
	var user = req.body;
	console.log('Adding User: ' + JSON.stringify(user));
	db.collection('user', function(err, collection) {
		mongUtil.insertEntity(collection, user, res);
	});
};


/*------------- INIT ------------------*/

exports.init = function(req, res){
    populateDB();
    res.send();
};
var populateDB = function() {
	console.log('populateDB');
	var timesheet = [
	{
		day:11 ,
		year: 2012,
		month: 12,
		user: {
			lastname: "Leresteux",
			firstname: "Pierre",
			login: "PLE"
		},
		tasks: [{
			project: "LANPA",
			hours: "6"
		},{
			project: "BUG_PROD",
			hours: "2"
		}]
	},
	{
		day:10 ,
		year: 2012,
		month: 12,
		user: {
			lastname: "Leresteux",
			firstname: "Pierre",
			login: "PLE"
		},
		tasks: [{
			project: "LANPA",
			hours: "8"
		}]
	},
    {
        day:10 ,
        year: 2011,
        month: 12,
        user: {
            lastname: "Leresteux",
            firstname: "Pierre",
            login: "PLE"
        },
        tasks: [{
            project: "IMG_LIB",
            hours: "8"
        }]
    },
	{
		day:11 ,
		year: 2012,
		month: 12,
		user: {
			lastname: "David",
			firstname: "Sebastien",
			login: "SDA"
		},
		tasks: [{
			project: "LANPA",
			hours: "4"
		},{
			project: "BUG_PROD",
			hours: "3"
		},{
			project: "POC_JS",
			hours: "1"
		}]
	},
	{
		day:10 ,
		year: 2012,
		month: 12,
		user: {
            lastname: "Leresteux",
            firstname: "Pierre",
            login: "PLE"
        },
		tasks: [{
			project: "BUG_PROD",
			hours: "5"
		},{
			project: "POC_EMV_PAPERBOY",
			hours: "1"
		}]
	}];
    var user = [{
        lastname: "Leresteux",
        firstname: "Pierre",
        login: "PLE"
    },{
        lastname: "David",
        firstname: "Sebastien",
        login: "SDA"
    }];
    var project = [{
        project: "BUG_PROD"
    },{
        project: "POC_EMV_PAPERBOY"
    },{
        project: "LANPA"
    },{
        project: "IMG_LIB"
    },{
        project: "POC_JS"
    }];

    db.collection('timesheet', function(err, collection) {
        collection.drop();
        collection.insert(timesheet, {safe:true}, function(err, result) {});
    });
    db.collection('user', function(err, collection) {
        collection.drop();
        collection.insert(user,  {safe:true}, function(err, result) {});
    });
    db.collection('project', function(err, collection) {
        collection.drop();
        collection.insert(project,  {safe:true}, function(err, result) {});
    });
};
