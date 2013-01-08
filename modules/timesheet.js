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

/*------------- CATEGORIES ------------------*/

exports.categories = {};

exports.categories.findAll = function(resultCallback) {
    console.log('Retrieving all categories');
    mongUtil.findAll(db, 'categories', 'name', resultCallback, function(categories) {
        resultCallback(categories);
    });
}

exports.categories.create = function(category, resultCallback) {
    console.log('Adding category: ' + JSON.stringify(category));
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

exports.categories.findById = function(categoryId, resultCallback) {
    console.log('Retrieving category id "' + categoryId + '"');
    db.collection('categories', function(err, collection) {
        collection.findOne({'_id': new BSON.ObjectID(categoryId)}, function (err, category) {
            resultCallback(category);
        });
    });
}

exports.categories.replace = function(categoryId, category, resultCallback) {
    console.log('Replacing category id "' + categoryId + '" with category: ' + JSON.stringify(category));
    db.collection('categories', function(err, collection) {
        collection.update({'_id': new BSON.ObjectID(categoryId)}, category, {safe: true}, function (err, result) {
            if (err) {
                console.log('Error updating collection: ' + err);
                resultCallback({'error': 'An error has occurred'});
            } else {
                console.log('' + result + ' document(s) updated');
                resultCallback(category);
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

exports.categories.update = function(categoryId, category, resultCallback) {
    console.log('Updating category id "' + categoryId + '" with category: ' + JSON.stringify(category));
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
                resultCallback({'error': 'An error has occurred'});
            } else {
                console.log('' + result + ' document(s) updated');
                resultCallback(category);
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

/*------------- PROJECTS ------------------*/

exports.projects = {};

exports.projects.findAll = function(resultCallback) {
    console.log('Retrieving all projects');
    mongUtil.findAll(db, 'categories', resultCallback, function(categories) {
        var foundProjects = [];
        for (var i = categories.length - 1; i >= 0; i--) {
            if (categories[i].projects && categories[i].projects.length > 0) {
                foundProjects = foundProjects.concat(categories[i].projects);
            }
        };
        resultCallback(foundProjects);
    });
}

exports.projects.create = function(project, categoryId, resultCallback) {
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

exports.projects.createMultiple = function(projects, categoryId, resultCallback) {
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

exports.projects.findById = function(projectId, resultCallback) {
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
                        return resultCallback(project);
                    }
                }
            }
            var error = {
                status: 404,
                message: 'Couldn\'t find project id "' + projectId + '"'
            };
            resultCallback(error, 404);
        });
    });
}

exports.projects.replace = function(projectId, project, resultCallback) {
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
                resultCallback({'error': 'An error has occurred'});
            } else {
                console.log('' + result + ' document(s) updated');
                resultCallback(project);
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

exports.projects.update = function(projectId, project, resultCallback) {
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
                resultCallback({'error': 'An error has occurred'});
            } else {
                console.log('' + result + ' document(s) updated');
                resultCallback(project);
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

/*------------- ACTIVITIES ------------------*/

exports.activities = {};

exports.activities.findAll = function(user, year, month, resultCallback) {
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
            resultCallback(activities);
        });
    });
}

exports.activities.create = function(activity, resultCallback) {
    var query = {
        'projects.id': new BSON.ObjectID(activity.project.id)
    };
    db.collection('categories', function(err, collection) {
        collection.findOne(query, function (err, category) {
            if (category && category.projects) {
                for (var i = 0; i < category.projects.length; i++) {
                    var project = category.projects[i];
                    if (project.id == activity.project.id) {
                        var activityToAdd = {
                            user: activity.user,
                            hours: activity.hours,
                            date: {
                                year: activity.date.year,
                                month: activity.date.month,
                                day: activity.date.day
                            },
                            project: {
                                id: activity.project.id,
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
                            collection.insert(activityToAdd, {safe: true}, function (err, result) {
                                if (err) {
                                    resultCallback({'error': 'An error has occurred'});
                                } else {
                                    console.log('Success: ' + JSON.stringify(result[0]));
                                    resultCallback(result[0]);
                                }
                            });
                        });
                    }
                }
            }
        });
    });
}

exports.activities.exportToCsv = function(year, month, resultCallback) {
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
            resultCallback(result);
        });
    });
}

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

/*------------- INIT ------------------*/

exports.populateDB = function() {
	console.log('Populating the database');

    db.collection('categories', function(err, collection) {
        collection.drop();
    });
    db.collection('activities', function(err, collection) {
        collection.drop();
    });

    exports.categories.create({name: 'Future Architecture'}, function (category) {

        exports.projects.create({
                name: 'DataStore',
                accounting: {name: 'prd'}
            }, category._id.toString(), function(project) {
            exports.activities.create({
                    user: 'sjob',
                    date: {year: 2012, month: 12, day: 14},
                    hours: 4,
                    project: {id: project.id.toString()}
                }, function(activity) {});
        });

    });

    exports.categories.create({name: 'Foutage de Gueule'}, function (category) {

        exports.projects.create({
                name: 'Demission',
                accounting: {name: 'abs'}
            }, category._id.toString(), function(project) {
            exports.activities.create({
                    user: 'pleresteux',
                    date: {year: 2012, month: 12, day: 21},
                    hours: 8,
                    project: {id: project.id.toString()}
                }, function(activity) {});
        });

    });

    exports.categories.create({name: 'Holiday/Off'}, function (category) {

        exports.projects.create({
                name: 'RTT',
                accounting: {name: 'abs'}
            }, category._id.toString(), function(project) {
            exports.activities.create({
                    user: 'sjob',
                    date: {year: 2012, month: 12, day: 14},
                    hours: 4,
                    project: {id: project.id.toString()}
                }, function(activity) {});
        });

        exports.projects.create({
                name: 'Sick',
                accounting: {name: 'abs'}
            }, category._id.toString(), function(project) {});

        exports.projects.create({
                name: 'Vacation',
                accounting: {name: 'abs'}
            }, category._id.toString(), function(project) {
            exports.activities.create({
                    user: 'sdavid',
                    date: {year: 2012, month: 12, day: 14},
                    hours: 4,
                    project: {id: project.id.toString()}
                }, function(activity) {});
            exports.activities.create({
                    user: 'sdavid',
                    date: {year: 2012, month: 12, day: 17},
                    hours: 4,
                    project: {id: project.id.toString()}
                }, function(activity) {});
        });

    });
};
