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

exports.categories = {};

exports.categories.findAll = function(req, res) {
    console.log('Retrieving all categories');
    db.collection('categories', function(err, collection) {
        mongUtil.getAll(collection, res);
    });
}

exports.categories.findById = function(req, res) {
    var categoryId = req.params.cid;
    console.log('Retrieving category id "' + categoryId + '"');
    db.collection('categories', function(err, collection) {
        mongUtil.getById(collection, categoryId, res);
    });
}

exports.categories.replace = function(req, res) {
    var categoryId = req.params.cid;
    var category = req.body;
    console.log('Replacing category id "' + categoryId + '" with category ' + JSON.stringify(category));
    db.collection('categories', function(err, collection) {
        mongUtil.updateEntity(collection, categoryId, category, res);
    });
}

exports.categories.update = function(req, res) {
    var categoryId = req.params.cid;
    var category = req.body;
    console.log('Updating category id "' + categoryId + '" with category ' + JSON.stringify(category));
    var update = {
        $set: { name: category.name }
    };
    db.collection('categories', function(err, collection) {
        mongUtil.updateEntity(collection, categoryId, update, res);
    });
}

exports.categories.projects = {};

exports.categories.projects.findAll = function(req, res) {
    var categoryId = req.params.cid;
    console.log('Retrieving all projects of category id "' + categoryId + '"');
    db.collection('categories', function(err, collection) {
        collection.findOne({'_id': new BSON.ObjectID(categoryId)}, function (err, category) {
            res.send(category.projects);
        });
    });
}

exports.categories.projects.findById = function(req, res) {
    var categoryId = req.params.cid;
    var projectId = req.params.pid;
    console.log('Retrieving project id "' + projectId + '" of category id "' + categoryId + '"');
    db.collection('categories', function(err, collection) {
        collection.findOne({'_id': new BSON.ObjectID(categoryId), 'projects.id': new BSON.ObjectID(projectId)}, function (err, category) {
            for (var i = 0; i < category.projects.length; i++) {
                var project = category.projects[i];
                if (project.id == projectId) {
                    return res.send(project);
                }
            }
            var error = {
                status : 404,
                message : 'Couldn\'t find project id "' + projectId + '" for category id "' + categoryId + '"'
            };
            res.send(error, 404);
        });
    });
}

exports.activities = {};

exports.activities.findAll = function(req, res) {
    var user = req.query.user;
    var year = req.query.year;
    var month = req.query.month;
    var query = {};
    if (user) {
        query['user'] = user;
    }
    if (year) {
        query['date.year'] = ~~year;
    }
    if (month) {
        query['date.month'] = ~~month;
    }
    var sortKeys = {
        'date.year' : 1,
        'date.month' : 1,
        'date.day' : 1,
        'category.name' : 1,
        'project.name' : 1,
    };
    var pipeline = [{ $match: query }, { $sort: sortKeys }, { $limit: 100}];
    console.log('Retrieving all activities with query ' + JSON.stringify(query));
    db.collection('activities', function(err, collection) {
        collection.aggregate(pipeline, function(err, activities) {
            res.send(activities);
        });
    });
}

exports.activities.toCsv = function(req, res) {
    var year = req.params.year;
    var month = req.params.month;
    var query = {
        'date.year': ~~year,
        'date.month': ~~month
    };
    console.log('Exporting all activities of ' + month + '/' + year);
    db.collection('activities', function(err, collection) {
        collection.find(query).toArray(function(err, activities) {
            res.contentType('csv');
            var result = 'Year,Month,Day,User,Category,Project,Accounting,Hours\n';
            for (var i = activities.length - 1; i >= 0; i--) {
                var activity = activities[i];
                result = result +
                    activity.date.year + ',' +
                    activity.date.month + ',' +
                    activity.date.day + ',' +
                    '"' + activity.user + '",' +
                    '"' + activity.category.name + '",' +
                    '"' + activity.project.name + '",' +
                    '"' + activity.accounting.name + '",' +
                    activity.hours + '\n';
            };
            res.send(result);
        });
    });
}

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

exports.findByProject = function(req, res){
	var project = req.params.project;
	var year = ~~req.query.year;
	var month = ~~req.query.month;

	var query = {'tasks.project':project, 'year': year};
	if (month){
		query.month = month;
	}

	db.collection('timesheet', function(err, collection) {
		mongUtil.findByQuery(collection, query, res);
	});
};

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

exports.aggregByProject = function(req, res) {
	var project = req.params.project;
	var year = ~~req.query.year;
	var month = ~~req.query.month;

	 var pipelineYM = [
		 {
			 $project :
			 {
				'tasks': "$tasks",
			    'year' :1,
			    'month':1
			 }
		 },
		 {
			 $unwind: "$tasks"
		 },
		 {
			 $match:
			 {
			    year:year,
			    month: month,
				"tasks.project": project
			 }
		 },
		 {
			 $group:
			 {
				 _id: "$tasks.project",
				 hours:
				 {
					 $sum : "$tasks.hours"
				 }
			 }
		 }
	 ];
	var pipelineY = [
		{
			$project :
			{
				'tasks': "$tasks",
				'year' :1
			}
		},
		{
			$unwind: "$tasks"
		},
		{
			$match:
			{
				year:year,
				"tasks.project": project
			}
		},
		{
			$group:
			{
				_id: "$tasks.project",
				hours:
				{
					$sum : "$tasks.hours"
				}
			}
		}
	];
	db.collection('timesheet', function(err, collection) {
		if (month){
			mongUtil.aggregate(collection,pipelineYM,res);
		}else{
			mongUtil.aggregate(collection,pipelineY,res);
		}
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
    db.collection('account', function(err, collection) {
	    mongUtil.getAll(collection, res);
    });
};

exports.findUserById = function(req, res){
    var id = req.params.id;
    console.log('Retrieving user: ' + id);
    db.collection('account', function(err, collection) {
	    mongUtil.getById(collection,id, res);
    });
};

exports.deleteUser = function(req, res) {
    var id = req.params.id;
    console.log('Deleting user: ' + id);
    db.collection('account', function(err, collection) {
	    mongUtil.deleteById(collection, id, res, req);
    });
};
exports.updateUser = function(req, res) {
	var id = req.params.id;
	var user = req.body;
	console.log('Updating user: ' + id);
	console.log(JSON.stringify(user));
	db.collection('account', function(err, collection) {
		mongUtil.updateEntity(collection, id, user, res);
	});
};

exports.addUser = function(req, res) {
	var user = req.body;
	console.log('Adding User: ' + JSON.stringify(user));
	db.collection('account', function(err, collection) {
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

    var categories = [{
        'name' : 'Future Architecture',
        'authorized_users' : [
            { 'login' : 'sjob' }
        ],
        'projects' : [{
            'id' : mongo.ObjectID(),
            'name' : 'DataStore',
            'accounting' : {
                'name' : 'prd'
            },
            'tasks' : [{
                'id' : mongo.ObjectID(),
                'name' : 'PoC'
            },{
                'id' : mongo.ObjectID(),
                'name' : 'Implementation'
            }]
        }]
    },{
        'name' : 'Holiday/Off',
        'authorized_users' : [
            { 'login' : 'sjob' }
        ],
        'projects' : [{
            'id' : mongo.ObjectID(),
            'name' : 'RTT',
            'accounting' : {
                'name' : 'abs'
            },
            'tasks' : [{
                'id' : mongo.ObjectID(),
                'name' : 'RTT'
            }]
        },{
            'id' : mongo.ObjectID(),
            'name' : 'Sick',
            'accounting' : {
                'name' : 'abs'
            },
            'tasks' : [{
                'id' : mongo.ObjectID(),
                'name' : 'Sick'
            }]
        },{
            'id' : mongo.ObjectID(),
            'name' : 'Vacation',
            'accounting' : {
                'name' : 'abs'
            },
            'tasks' : [{
                'id' : mongo.ObjectID(),
                'name' : 'Vacation'
            }]
        }]
    }];
    var activities = [{
        'user' : 'sdavid',
        'date' : {
            'year' : 2012,
            'month' : 12,
            'day' : 14
        },
        'hours' : 8,
        'task' : {
            'id' : categories[1].projects[2].tasks[0].id,
            'name' : 'Vacation'
        },
        'project' : {
            'id' : categories[1].projects[2].id,
            'name' : 'Vacation'
        },
        'category' : {
            'id' : categories[1]._id, // null at this time, need first to save categories to DB
            'name' : 'Holiday/Off'
        },
        'accounting' : {
            'name' : 'abs'
        }
    },{
        'user' : 'sdavid',
        'date' : {
            'year' : 2012,
            'month' : 12,
            'day' : 17
        },
        'hours' : 8,
        'task' : {
            'id' : categories[1].projects[2].tasks[0].id,
            'name' : 'Vacation'
        },
        'project' : {
            'id' : categories[1].projects[2].id,
            'name' : 'Vacation'
        },
        'category' : {
            'id' : categories[1]._id, // null at this time, need first to save categories to DB
            'name' : 'Holiday/Off'
        },
        'accounting' : {
            'name' : 'abs'
        }
    },{
        'user' : 'sjob',
        'date' : {
            'year' : 2012,
            'month' : 12,
            'day' : 14
        },
        'hours' : 4,
        'task' : {
            'id' : categories[1].projects[0].tasks[0].id,
            'name' : 'RTT'
        },
        'project' : {
            'id' : categories[1].projects[0].id,
            'name' : 'RTT'
        },
        'category' : {
            'id' : categories[1]._id, // null at this time, need first to save categories to DB
            'name' : 'Holiday/Off'
        },
        'accounting' : {
            'name' : 'abs'
        }
    },{
        'user' : 'sjob',
        'date' : {
            'year' : 2012,
            'month' : 12,
            'day' : 14
        },
        'hours' : 4,
        'task' : {
            'id' : categories[0].projects[0].tasks[0].id,
            'name' : 'PoC'
        },
        'project' : {
            'id' : categories[0].projects[0].id,
            'name' : 'DataStore'
        },
        'category' : {
            'id' : categories[0]._id, // null at this time, need first to save categories to DB
            'name' : 'Future Architecture'
        },
        'accounting' : {
            'name' : 'prd'
        }
    }];

    db.collection('categories', function(err, collection) {
        collection.drop();
        collection.insert(categories, {safe:true}, function(err, result) {
            if (!err) {
                // Adding activities asynchronously after categories are added since we need their id
                activities[0].category.id = result[1]._id;
                activities[1].category.id = result[1]._id;
                activities[2].category.id = result[1]._id;
                activities[3].category.id = result[0]._id;

                db.collection('activities', function(err, collection) {
                    collection.drop();
                    collection.insert(activities, {safe:true}, function(err, result) {});
                });
            }
        });
    });
};
