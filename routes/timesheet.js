var mongo = require('mongodb');

var Server = mongo.Server,
	Db = mongo.Db,
	BSON = mongo.BSONPure;

var db;

var mongoUri = process.env.MONGOLAB_URI ||  'mongodb://localhost:27017/timesheetdb';

mongo.Db.connect(mongoUri, function (err, database) {
	db = database;
});

exports.findById = function(req, res) {
	var id = req.params.id;
	console.log('Retrieving timesheet: ' + id);
	db.collection('timesheet', function(err, collection) {
		collection.findOne({'_id':new BSON.ObjectID(id)}, function(err, item) {
			res.send(item);
		});
	});
};

exports.findByDayAndUser = function(req,res) {
	var day = req.params.day;
	var user = req.params.user;
	console.log(day);
	console.log(user);
	var collection = db.collection('timesheet');
	collection.find({'day':day}, {limit:100}).toArray(function(err, docs) {
		res.send(docs);
	});
};

exports.findAll = function(req, res) {
	db.collection('timesheet', function(err, collection) {
		collection.find().toArray(function(err, items) {
			res.send(items);
		});
	});
};

exports.addTimesheet = function(req, res) {
	var timesheet = req.body;
	console.log('Adding timesheet: ' + JSON.stringify(timesheet));
	db.collection('timesheet', function(err, collection) {
		collection.insert(timesheet, {safe:true}, function(err, result) {
			if (err) {
				res.send({'error':'An error has occurred'});
			} else {
				console.log('Success: ' + JSON.stringify(result[0]));
				res.send(result[0]);
			}
		});
	});
}

exports.updateTimesheet = function(req, res) {
	var id = req.params.id;
	var timesheet = req.body;
	console.log('Updating timesheet: ' + id);
	console.log(JSON.stringify(timesheet));
	db.collection('timesheet', function(err, collection) {
		collection.update({'_id':new BSON.ObjectID(id)}, timesheet, {safe:true}, function(err, result) {
			if (err) {
				console.log('Error updating timesheet: ' + err);
				res.send({'error':'An error has occurred'});
			} else {
				console.log('' + result + ' document(s) updated');
				res.send(timesheet);
			}
		});
	});
}

exports.deleteTimesheet = function(req, res) {
	var id = req.params.id;
	console.log('Deleting timesheet: ' + id);
	db.collection('timesheet', function(err, collection) {
		collection.remove({'_id':new BSON.ObjectID(id)}, {safe:true}, function(err, result) {
			if (err) {
				res.send({'error':'An error has occurred - ' + err});
			} else {
				console.log('' + result + ' document(s) deleted');
				res.send(req.body);
			}
		});
	});
}

exports.init = function(req, res){
	populateDB();
	res.send();
}

/*--------------------------------------------------------------------------------------------------------------------*/
// Populate database with sample data -- Only used once: the first time the application is started.
// You'd typically not find this code in a real-life app, since the database would already exist.
var populateDB = function() {
	console.log('populateDB');
	var timesheet = [
	{
		day:1355180400 ,
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
		day:1355180400 ,
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
	}];

	db.collection('timesheet', function(err, collection) {
		collection.insert(timesheet, {safe:true}, function(err, result) {});
	});

};