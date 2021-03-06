var mongo = require('mongodb');
var BSON = mongo.BSONPure;

exports.findAll = function(db, collectionName, resultCallback, successCallback) {
    db.collection(collectionName, function(err, collection) {
        collection.find().toArray(function(err, result) {
            if (err) {
                resultCallback({message: 'Server error while reading from collection "' + collectionName + '": ' + err}, 500);
            } else {
                successCallback(result);
            }
        });
    });
};

exports.findAll = function(db, collectionName, sortKey, resultCallback, successCallback) {
    db.collection(collectionName, function(err, collection) {
        collection.find().toArray(function(err, result) {
            if (err) {
                resultCallback({message: 'Server error while reading from collection "' + collectionName + '": ' + err}, 500);
            } else {
                result = result.sort(function(a,b){return a[sortKey].localeCompare(b[sortKey]);});
                successCallback(result);
            }
        });
    });
};