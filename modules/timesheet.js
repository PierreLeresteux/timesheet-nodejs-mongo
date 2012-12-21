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

// Categories

exports.categories = {};

exports.categories.findAll = function(req, res) {
    console.log('Retrieving all categories');
    db.collection('categories', function(err, collection) {
        mongUtil.getAll(collection, res);
    });
}

exports.categories.findById = function(req, res) {
    var categoryId = req.params.id;
    console.log('Retrieving category id "' + categoryId + '"');
    db.collection('categories', function(err, collection) {
        mongUtil.getById(collection, categoryId, res);
    });
}

exports.categories.replace = function(req, res) {
    var categoryId = req.params.id;
    var category = req.body;
    console.log('Replacing category id "' + categoryId + '" with category ' + JSON.stringify(category));
    db.collection('categories', function(err, collection) {
        mongUtil.updateEntity(collection, categoryId, category, res);
    });
    var activitiesQuery = {
        'category.id': new BSON.ObjectID(categoryId)
    };
    var activitiesUpdate = {
        $set: {
            'category.name': category.name
        }
    };
    updateActivities(activitiesQuery, activitiesUpdate);
}

exports.categories.update = function(req, res) {
    var categoryId = req.params.id;
    var category = req.body;
    console.log('Updating category id "' + categoryId + '" with category ' + JSON.stringify(category));
    var query = {
        '_id': new BSON.ObjectID(categoryId)
    };
    var update = {
        $set: {
            name: category.name
        }
    };
    db.collection('categories', function(err, collection) {
        collection.update(query, update, {safe: true}, function (err, result) {
            if (err) {
                console.log('Error updating collection: ' + err);
                res.send({'error': 'An error has occurred'});
            } else {
                console.log('' + result + ' document(s) updated');
                res.send(category);
            }
        });
    });
    var activitiesQuery = {
        'category.id': new BSON.ObjectID(categoryId)
    };
    var activitiesUpdate = {
        $set: {
            'category.name': category.name
        }
    };
    updateActivities(activitiesQuery, activitiesUpdate);
}

exports.categories.create = function(req, res) {
    var category = req.body;
    createCategory(req.body, function(result) { res.send(result) });
}

var createCategory = function (category, resultCallback) {
    console.log('Adding category ' + JSON.stringify(category));
    if (!category.projects) {
        category.projects = [];
    }
    db.collection('categories', function(err, collection) {
        collection.insert(category, {safe: true}, function (err, result) {
            if (err) {
                resultCallback({'error': 'An error has occurred'});
            } else {
                console.log('Success: ' + JSON.stringify(result[0]));
                resultCallback(result[0]);
            }
        });
    });
}

// Projects

exports.projects = {};

exports.projects.findAll = function(req, res) {
    console.log('Retrieving all projects');
    db.collection('categories', function(err, collection) {
        collection.find().toArray(function(err, categories) {
            var foundProjects = [];
            for (var i = categories.length - 1; i >= 0; i--) {
                if (categories[i].projects && categories[i].projects.length > 0) {
                    foundProjects = foundProjects.concat(categories[i].projects);
                }
            };
            res.send(foundProjects);
        });
    });
}

exports.projects.findById = function(req, res) {
    var projectId = req.params.id;
    console.log('Retrieving project id "' + projectId + '"');
    var query = {
        'projects.id': new BSON.ObjectID(projectId)
    };
    db.collection('categories', function(err, collection) {
        collection.findOne(query, function (err, category) {
            if (category && category.projects) {
                for (var i = 0; i < category.projects.length; i++) {
                    var project = category.projects[i];
                    if (project.id == projectId) {
                        return res.send(project);
                    }
                }
            }
            var error = {
                status: 404,
                message: 'Couldn\'t find project id "' + projectId + '"'
            };
            res.send(error, 404);
        });
    });
}

exports.projects.replace = function(req, res) {
    var projectId = req.params.id;
    var project = req.body;
    console.log('Replacing project id "' + projectId + '" with project ' + JSON.stringify(project));
    project.id = new BSON.ObjectID(projectId);
    var query = {
        'projects.id': new BSON.ObjectID(projectId)
    };
    var update = {
        $set: {
            'projects.$': project
        }
    };
    db.collection('categories', function(err, collection) {
        collection.update(query, update, {safe: true}, function (err, result) {
            if (err) {
                console.log('Error updating collection: ' + err);
                res.send({'error': 'An error has occurred'});
            } else {
                console.log('' + result + ' document(s) updated');
                res.send(project);
            }
        });
    });
    var activitiesQuery = {
        'project.id': new BSON.ObjectID(projectId)
    };
    var activitiesUpdate = {
        $set: {
            'project.name': project.name
        }
    };
    if (project.accounting && project.accounting.name) {
        activitiesUpdate.$set['accounting.name'] = project.accounting.name;
    }
    updateActivities(activitiesQuery, activitiesUpdate);
}

exports.projects.update = function(req, res) {
    var projectId = req.params.id;
    var project = req.body;
    console.log('Updating project id "' + projectId + '" with project ' + JSON.stringify(project));

    var query = {
        'projects.id': new BSON.ObjectID(projectId)
    };
    var update = {
        $set: {
            'projects.$.name': project.name
        }
    };
    if (project.accounting && project.accounting.name) {
        update.$set['accounting.name'] = project.accounting.name;
    }
    db.collection('categories', function(err, collection) {
        collection.update(query, update, {safe: true}, function (err, result) {
            if (err) {
                console.log('Error updating collection: ' + err);
                res.send({'error': 'An error has occurred'});
            } else {
                console.log('' + result + ' document(s) updated');
                res.send(project);
            }
        });
    });
    var activitiesQuery = {
        'project.id': new BSON.ObjectID(projectId)
    };
    var activitiesUpdate = {
        $set: {
            'project.name': project.name
        }
    };
    if (project.accounting && project.accounting.name) {
        activitiesUpdate.$set['accounting.name'] = project.accounting.name;
    }
    updateActivities(activitiesQuery, activitiesUpdate);
}

exports.projects.create = function(req, res) {
    var categoryId = req.query.category_id;
    var project = req.body;
    createProject(project, categoryId, function(result) { res.send(result) });
}

var createProject = function(project, categoryId, resultCallback) {
    project.id = mongo.ObjectID();
    console.log('Adding project ' + JSON.stringify(project) + '" on category id "' + categoryId + '"');
    var query =  {
        '_id': new BSON.ObjectID(categoryId)
    }
    var update = {
        $push: { projects: project }
    };
    db.collection('categories', function(err, collection) {
        collection.update(query, update, {safe: true}, function (err, result) {
            if (err) {
                console.log('Error updating collection: ' + err);
                resultCallback({'error': 'An error has occurred'});
            } else {
                console.log('' + result + ' category document(s) updated');
                resultCallback(project);
            }
        });
    });
}

var createProjects = function(projects, categoryId, resultCallback) {
    for (var i = projects.length - 1; i >= 0; i--) {
        projects[i].id = mongo.ObjectID();
    };
    console.log('Adding projects ' + JSON.stringify(projects) + '" on category id "' + categoryId + '"');
    var query =  {
        '_id': new BSON.ObjectID(categoryId)
    }
    var update = {
        $pushAll: { projects: projects }
    };
    db.collection('categories', function(err, collection) {
        collection.update(query, update, {safe: true}, function (err, result) {
            if (err) {
                console.log('Error updating collection: ' + err);
                resultCallback({'error': 'An error has occurred'});
            } else {
                console.log('' + result + ' category document(s) updated');
                resultCallback(projects);
            }
        });
    });
}

// Activities

var updateActivities = function(query, update) {
    db.collection('activities', function(err, collection) {
        collection.update(query, update, {safe: true}, function (err, result) {
            if (err) {
                console.log('Error updating activities collection: ' + err);
            } else {
                console.log('Updated ' + result + ' activity document(s)');
            }
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
        'date.year': 1,
        'date.month': 1,
        'date.day': 1,
        'category.name': 1,
        'project.name': 1,
    };
    var pipeline = [{ $match: query }, { $sort: sortKeys }, { $limit: 100}];
    console.log('Retrieving all activities with query ' + JSON.stringify(query));
    db.collection('activities', function(err, collection) {
        collection.aggregate(pipeline, function(err, activities) {
            res.send(activities);
        });
    });
}

exports.activities.create = function(req, res) {
    var projectId = req.body.project.id;
    var query = {
        'projects.id': new BSON.ObjectID(projectId)
    };
    db.collection('categories', function(err, collection) {
        collection.findOne(query, function (err, category) {
            if (category && category.projects) {
                for (var i = 0; i < category.projects.length; i++) {
                    var project = category.projects[i];
                    if (project.id == projectId) {
                        var activity = {
                            user: req.body.user,
                            date: {
                                year: req.body.date.year,
                                month: req.body.date.month,
                                day: req.body.date.day
                            },
                            project: {
                                id: projectId,
                                name: project.name
                            },
                            category: {
                                id: category._id,
                                name: category.name
                            },
                            accounting: {
                                name: project.accounting.name
                            }
                        };
                        db.collection('activities', function(err, collection) {
                            mongUtil.insertEntity(collection, activity, res);
                        });
                    }
                }
            }
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
			 $project:
			 {
				'tasks': "$tasks",
			    'year':1,
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
					 $sum: "$tasks.hours"
				 }
			 }
		 }
	 ];
	var pipelineY = [
		{
			$project:
			{
				'tasks': "$tasks",
				'year':1
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
					$sum: "$tasks.hours"
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
        'name': 'Future Architecture',
        'projects': [{
            'id': mongo.ObjectID(),
            'name': 'DataStore',
            'accounting': {
                'name': 'prd'
            }
        }]
    },{
        'name': 'Holiday/Off',
        'projects': [{
            'id': mongo.ObjectID(),
            'name': 'RTT',
            'accounting': {
                'name': 'abs'
            }
        },{
            'id': mongo.ObjectID(),
            'name': 'Sick',
            'accounting': {
                'name': 'abs'
            }
        },{
            'id': mongo.ObjectID(),
            'name': 'Vacation',
            'accounting': {
                'name': 'abs'
            }
        }]
    }];
    var activities = [{
        'user': 'sdavid',
        'date': {
            'year': 2012,
            'month': 12,
            'day': 14
        },
        'hours': 8,
        'project': {
            'id': categories[1].projects[2].id,
            'name': 'Vacation'
        },
        'category': {
            'id': categories[1]._id, // null at this time, need first to save categories to DB
            'name': 'Holiday/Off'
        },
        'accounting': {
            'name': 'abs'
        }
    },{
        'user': 'sdavid',
        'date': {
            'year': 2012,
            'month': 12,
            'day': 17
        },
        'hours': 8,
        'project': {
            'id': categories[1].projects[2].id,
            'name': 'Vacation'
        },
        'category': {
            'id': categories[1]._id, // null at this time, need first to save categories to DB
            'name': 'Holiday/Off'
        },
        'accounting': {
            'name': 'abs'
        }
    },{
        'user': 'sjob',
        'date': {
            'year': 2012,
            'month': 12,
            'day': 14
        },
        'hours': 4,
        'project': {
            'id': categories[1].projects[0].id,
            'name': 'RTT'
        },
        'category': {
            'id': categories[1]._id, // null at this time, need first to save categories to DB
            'name': 'Holiday/Off'
        },
        'accounting': {
            'name': 'abs'
        }
    },{
        'user': 'sjob',
        'date': {
            'year': 2012,
            'month': 12,
            'day': 14
        },
        'hours': 4,
        'project': {
            'id': categories[0].projects[0].id,
            'name': 'DataStore'
        },
        'category': {
            'id': categories[0]._id, // null at this time, need first to save categories to DB
            'name': 'Future Architecture'
        },
        'accounting': {
            'name': 'prd'
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
