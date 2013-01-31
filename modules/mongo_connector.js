var mongo = require('mongodb');
var BSON = mongo.BSONPure;
var Db = mongo.Db;

var reportSuccess = function(resultCallback, successCallback, result) {
    if (successCallback) {
        successCallback(result);
    } else if (resultCallback) {
        resultCallback(result);
    }
}

var reportError = function(resultCallback, message, details, status) {
    if (!status) {
        status = 500;
    }
    var result = {
        message: message,
        status: status
    };
    if (details) {
        result.details = details;
        console.error(message + ": " + JSON.stringify(details));
    } else {
        console.error(message);
    }
    if (resultCallback) {
        resultCallback(result, status);
    }
}

var makeCollectionAccessErrorHandler = function(noErrorCallback) {
    return function(err, collection) {
        if (err) {
            reportError(resultCallback, 'Server error while getting access to collection "' + collectionName + '"', err);
        }
        noErrorCallback(collection);
    }
}

// Changes the 'id' string into an ObjectId.
// If 'id' is undefined, it creates a new ObjectId.
exports.objectId = function(id) {
    return new BSON.ObjectID(id);
}

exports.connect = function(mongoUri, callback) {
    console.log('Connecting to Mongo DB using URI: ' + mongoUri);
    Db.connect(mongoUri, function(err, db) {
        if (err) {
            console.error('Error while connecting to Mongo DB: ' + JSON.stringify(err));
        } else {
            console.log('Sucessfully connected to Mongo DB');
        }
        callback(db);
    });
}

exports.MongoConnector = function(db, collectionName) {
    this.db = db;
    this.collectionName = collectionName;
}

exports.MongoConnector.prototype.find = function(resultCallback, successCallback, query, sortKeys) {
    var collectionName = this.collectionName;
    this.db.collection(this.collectionName, makeCollectionAccessErrorHandler(function(collection) {
        var callback = function(err, result) {
            if (err) {
                reportError(resultCallback, 'Server error while reading from collection "' + collectionName + '"', err);
            } else {
                reportSuccess(resultCallback, successCallback, result);
            }
        };
        if (sortKeys) {
            var pipeline = [{ $match: query }, { $sort: sortKeys }, { $limit: 100}];
            collection.aggregate(pipeline, callback);
        } else {
            collection.find(query).toArray(callback);
        }
    }));
}

exports.MongoConnector.prototype.findOne = function(resultCallback, successCallback, query) {
    this.db.collection(this.collectionName, makeCollectionAccessErrorHandler(function(collection) {
        collection.findOne(query, function(err, result) {
            if (err) {
                reportError(resultCallback, 'Server error while reading from collection "' + collectionName + '"', err);
            } else {
                reportSuccess(resultCallback, successCallback, result);
            }
        });
    }));
}

exports.MongoConnector.prototype.insert = function(resultCallback, successCallback, document) {
    var collectionName = this.collectionName;
    this.db.collection(this.collectionName, makeCollectionAccessErrorHandler(function(collection) {
        collection.insert(document, {safe: true}, function(err, result) {
            if (err) {
                reportError(resultCallback, 'Server error while inserting into collection "' + collectionName + '"', err);
            } else if (result.length == 0) {
                reportError(resultCallback, 'No document inserted into collection "' + collectionName + '"');
            } else {
                console.log('Successfully added document into "' + collectionName + '": ' + JSON.stringify(result[0]));
                reportSuccess(resultCallback, successCallback, result[0]);
            }
        });
    }));
}

exports.MongoConnector.prototype.update = function(resultCallback, successCallback, query, update) {
    var collectionName = this.collectionName;
    this.db.collection(this.collectionName, makeCollectionAccessErrorHandler(function(collection) {
        collection.update(query, update, {safe: true, multi: true}, function(err, result) {
            if (err) {
                reportError(resultCallback, 'Server error while updating collection "' + collectionName + '"', err);
            } else {
                console.log('Successfully updated ' + result + ' document(s) in "' + collectionName + '"');
                reportSuccess(resultCallback, successCallback, result);
            }
        });
    }));
}

exports.MongoConnector.prototype.drop = function(resultCallback, successCallback) {
    this.db.collection(this.collectionName, makeCollectionAccessErrorHandler(function(collection) {
        collection.drop();
        reportSuccess(resultCallback, successCallback);        
    }));
}
