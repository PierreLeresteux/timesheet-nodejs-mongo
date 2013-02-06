var mongoConnector = require('./mongo_connector');

var mongoUri = process.env.MONGOLAB_URI ||  'mongodb://localhost:27017/timesheetdb';

var categoriesConnector;
var activitiesConnector;

mongoConnector.connect(mongoUri, function(database) {
    categoriesConnector = new mongoConnector.MongoConnector(database, 'categories');
    activitiesConnector = new mongoConnector.MongoConnector(database, 'activities');
});

var makeSuccessCallback = function(resultCallback, returnValue) {
    return function(result) {
        resultCallback(returnValue ? returnValue : result);
    }
};

/*------------- CATEGORIES ------------------*/

exports.categories = {};

exports.categories.findAll = function(resultCallback) {
    console.log('Retrieving all categories');
    categoriesConnector.find(resultCallback, makeSuccessCallback(resultCallback));
}

exports.categories.create = function(category, resultCallback) {
    if (!category.projects) {
        category.projects = [];
    }
    console.log('Adding category: ' + JSON.stringify(category));
    categoriesConnector.insert(resultCallback, makeSuccessCallback(resultCallback), category);
}

exports.categories.findById = function(categoryId, resultCallback) {
    var query = {
        '_id': mongoConnector.objectId(categoryId)
    };
    console.log('Retrieving category id "' + categoryId + '"');
    categoriesConnector.findOne(resultCallback, makeSuccessCallback(resultCallback), query);
}

exports.categories.replace = function(categoryId, category, resultCallback) {
    var categoriesQuery = {
        '_id': mongoConnector.objectId(categoryId)
    };
    var categoriesUpdate = category;
    var activitiesQuery = {
        'category.id': mongoConnector.objectId(categoryId)
    };
    var activitiesUpdate = {
        $set: {
            'category.name': category.name
        }
    };
    console.log('Replacing category id "' + categoryId + '" with category: ' + JSON.stringify(category));
    categoriesConnector.update(resultCallback, makeSuccessCallback(resultCallback, category), categoriesQuery, categoriesUpdate);
    activitiesConnector.update(null, null, activitiesQuery, activitiesUpdate);
}

exports.categories.update = function(categoryId, category, resultCallback) {
    var categoriesQuery = {
        '_id': mongoConnector.objectId(categoryId)
    };
    var categoriesUpdate = {
        $set: {
            name: category.name
        }
    };
    var activitiesQuery = {
        'category.id': mongoConnector.objectId(categoryId)
    };
    var activitiesUpdate = {
        $set: {
            'category.name': category.name
        }
    };
    var successCallback = function(result) {
        activitiesConnector.update(resultCallback, makeSuccessCallback(resultCallback, category), activitiesQuery, activitiesUpdate);
    }
    console.log('Updating category id "' + categoryId + '" with category: ' + JSON.stringify(category));
    categoriesConnector.update(resultCallback, successCallback, categoriesQuery, categoriesUpdate);
}

exports.categories.delete = function(categoryId, resultCallback) {
    console.log('Deleting category id "' + categoryId + '"');
    var error = {
        message: 'Noy yet implemented',
        status: 405
    };
    resultCallback(error, 405);
}

/*------------- PROJECTS ------------------*/

exports.projects = {};

exports.projects.findAll = function(resultCallback) {
    var successCallback = function(categories) {
        var foundProjects = [];
        for (var i = categories.length - 1; i >= 0; i--) {
            if (categories[i].projects && categories[i].projects.length > 0) {
                foundProjects = foundProjects.concat(categories[i].projects);
            }
        };
        resultCallback(foundProjects);
    };
    console.log('Retrieving all projects');
    categoriesConnector.find(resultCallback, successCallback);
}

exports.projects.create = function(project, categoryId, resultCallback) {
    project.id = mongoConnector.objectId();
    var query =  {
        '_id': mongoConnector.objectId(categoryId)
    }
    var update = {
        $push: { projects: project }
    };
    console.log('Adding project ' + JSON.stringify(project) + '" on category id "' + categoryId + '"');
    categoriesConnector.update(resultCallback, makeSuccessCallback(resultCallback, project), query, update);
}

exports.projects.createMultiple = function(projects, categoryId, resultCallback) {
    for (var i = projects.length - 1; i >= 0; i--) {
        projects[i].id = mongoConnector.objectId();
    };
    var query =  {
        '_id': mongoConnector.objectId(categoryId)
    }
    var update = {
        $pushAll: { projects: projects }
    };
    console.log('Adding projects ' + JSON.stringify(projects) + '" on category id "' + categoryId + '"');
    categoriesConnector.update(resultCallback, makeSuccessCallback(resultCallback, projects), query, update);
}

exports.projects.findById = function(projectId, resultCallback) {
    var query = {
        'projects.id': mongoConnector.objectId(projectId)
    };
    var successCallback = function(category) {
        if (category && category.projects) {
            for (var i = 0; i < category.projects.length; i++) {
                var project = category.projects[i];
                if (project.id == projectId) {
                    return resultCallback(project);
                }
            }
        }
        var error = {
            message: 'Couldn\'t find project id "' + projectId + '"',
            status: 404
        };
        resultCallback(error, 404);
    }
    console.log('Retrieving project id "' + projectId + '"');
    categoriesConnector.findOne(resultCallback, successCallback, query);
}

exports.projects.replace = function(projectId, project, resultCallback) {
    project.id = mongoConnector.objectId(projectId);
    var categoriesQuery = {
        'projects.id': mongoConnector.objectId(projectId)
    };
    var categoriesUpdate = {
        $set: {
            'projects.$': project
        }
    };
    var activitiesQuery = {
        'project.id': projectId
    };
    var activitiesUpdate = {
        $set: {
            'project.name': project.name
        }
    };
    if (project.accounting && project.accounting.name) {
        activitiesUpdate.$set['accounting.name'] = project.accounting.name;
    }
    console.log('Replacing project id "' + projectId + '" with project ' + JSON.stringify(project));
    categoriesConnector.update(resultCallback, makeSuccessCallback(resultCallback, project), categoriesQuery, categoriesUpdate);
    activitiesConnector.update(null, null, activitiesQuery, activitiesUpdate);
}

exports.projects.update = function(projectId, project, resultCallback) {
    var categoriesQuery = {
        'projects.id': mongoConnector.objectId(projectId)
    };
    var categoriesUpdate = {
        $set: {
            'projects.$.name': project.name
        }
    };
    if (project.accounting && project.accounting.name) {
        update.$set['accounting.name'] = project.accounting.name;
    }
    var activitiesQuery = {
        'project.id': projectId
    };
    var activitiesUpdate = {
        $set: {
            'project.name': project.name
        }
    };
    if (project.accounting && project.accounting.name) {
        activitiesUpdate.$set['accounting.name'] = project.accounting.name;
    }
    console.log('Updating project id "' + projectId + '" with project ' + JSON.stringify(project));
    categoriesConnector.update(resultCallback, makeSuccessCallback(resultCallback, project), categoriesQuery, categoriesUpdate);
    activitiesConnector.update(null, null, activitiesQuery, activitiesUpdate);
}

exports.projects.delete = function(projectId, resultCallback) {
    console.log('Deleting project id "' + projectId + '"');
    var error = {
        message: 'Noy yet implemented',
        status: 405
    };
    resultCallback(error, 405);
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
    console.log('Retrieving all activities with query ' + JSON.stringify(query));
    activitiesConnector.find(resultCallback, makeSuccessCallback(resultCallback), query, sortKeys);
}

exports.activities.create = function(activity, resultCallback) {
    var query = {
        'projects.id': mongoConnector.objectId(activity.project.id)
    };
    var successCallback = function(category) {
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

                    activitiesConnector.insert(resultCallback, makeSuccessCallback(resultCallback), activityToAdd);
                }
            }
        }
    };
    console.log('Adding activity ' + JSON.stringify(activity));
    categoriesConnector.findOne(resultCallback, successCallback, query);
}

exports.activities.delete = function(activityId, resultCallback) {
    console.log('Deleting activity id "' + activityId + '"');
    var error = {
        message: 'Noy yet implemented',
        status: 405
    };
    resultCallback(error, 405);
}

exports.activities.exportToCsv = function(year, month, resultCallback) {
    var query = {
        'date.year': ~~year,
        'date.month': ~~month
    };
    var successCallback = function(activities) {
        if (activities.length == 0) {
            console.log('No activity found on ' + month + '/' + year);
            resultCallback(null, 204);
        }
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
    };
    console.log('Exporting all activities of ' + month + '/' + year);
    activitiesConnector.find(resultCallback, successCallback, query);
}

/*------------- INIT ------------------*/

exports.populateDB = function() {
	console.log('Populating the database');

    categoriesConnector.drop();
    activitiesConnector.drop();

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
