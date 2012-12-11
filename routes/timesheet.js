var mongo = require('mongodb');

var Server = mongo.Server,
	Db = mongo.Db,
	BSON = mongo.BSONPure;

var collection;

var mongoUri = process.env.MONGOLAB_URI ||  'mongodb://localhost:27017/timesheetdb';

mongo.Db.connect(mongoUri, function (err, db) {
    collection = db.collection('timesheet');
});

exports.find = function(req, res) {
	var key = req.params.key;
	if (key.length==24){
        findById(req,res);
    }else{
        findByUser(req,res);
    }

};

exports.findAll = function(req, res) {
	collection.find().toArray(function(err, items) {
		res.send(items);
	});
};

exports.addTimesheet = function(req, res) {
	var timesheet = req.body;
	console.log('Adding timesheet: ' + JSON.stringify(timesheet));
    collection.insert(timesheet, {safe:true}, function(err, result) {
        if (err) {
            res.send({'error':'An error has occurred'});
        } else {
            console.log('Success: ' + JSON.stringify(result[0]));
            res.send(result[0]);
        }
    });
}

exports.updateTimesheet = function(req, res) {
	var id = req.params.id;
	var timesheet = req.body;
    console.log('Updating timesheet: ' + id);
	console.log(JSON.stringify(timesheet));
    collection.update({'_id':new BSON.ObjectID(id)}, timesheet, {safe:true}, function(err, result) {
        if (err) {
            console.log('Error updating timesheet: ' + err);
            res.send({'error':'An error has occurred'});
        } else {
            console.log('' + result + ' document(s) updated');
            res.send(timesheet);
        }
    });
}

exports.deleteTimesheet = function(req, res) {
	var id = req.params.id;
	console.log('Deleting timesheet: ' + id);
    collection.remove({'_id':new BSON.ObjectID(id)}, {safe:true}, function(err, result) {
        if (err) {
            res.send({'error':'An error has occurred - ' + err});
        } else {
            console.log('' + result + ' document(s) deleted');
            res.send(req.body);
        }
    });
}

exports.init = function(req, res){
	populateDB();
	res.send();
}

exports.findById = function(req, res) {
    var id = req.params.id;
    console.log('Retrieving timesheet: ' + id);
    collection.findOne({'_id':new BSON.ObjectID(id)}, function(err, item) {
        res.send(item);
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
    findByQuery(query,res);
};
exports.findByUser = function(req, res) {
    var user = req.params.user;
    var year = ~~req.query.year;
    var month = ~~req.query.month;

    var query = {'user.login':user, 'year': year};
    if (month){
        query.month = month;
    }
    findByQuery(query,res);

}

function findByQuery(query,res){
    console.log("Query : "+JSON.stringify(query));
    collection.find(query, {limit:100}).toArray(function(err, docs) {
        res.send(docs);
    });
}
// Populate database with sample data -- Only used once: the first time the application is started.
// You'd typically not find this code in a real-life app, since the database would already exist.
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
			lastname: "David",
			firstname: "Sebastien",
			login: "SDA"
		},
		tasks: [{
			project: "BUG_PROD",
			hours: "5"
		},{
			project: "POC_EMV_PAPERBOY",
			hours: "1"
		}]
	}];

	db.collection('timesheet', function(err, collection) {
		collection.insert(timesheet, {safe:true}, function(err, result) {});
	});

};
