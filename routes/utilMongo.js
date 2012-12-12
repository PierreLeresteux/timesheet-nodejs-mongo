var mongo = require('mongodb');
var BSON = mongo.BSONPure;

exports.getAll = function(collection, res){
	collection.find().toArray(function(err, items) {
		res.send(items);
	});
};
exports.getById = function(collection, id,res) {
	collection.findOne({'_id': new BSON.ObjectID(id)}, function (err, item) {
		res.send(item);
	});
};

exports.deleteById = function(collection, id, res, req) {
	collection.remove({'_id': new BSON.ObjectID(id)}, {safe: true}, function (err, result) {
		if (err) {
			res.send({'error': 'An error has occurred - ' + err});
		} else {
			console.log('' + result + ' document(s) deleted');
			res.send(req.body);
		}
	});
};

exports.updateEntity = function(collection, id, entity, res) {
	collection.update({'_id': new BSON.ObjectID(id)}, entity, {safe: true}, function (err, result) {
		if (err) {
			console.log('Error updating collection: ' + err);
			res.send({'error': 'An error has occurred'});
		} else {
			console.log('' + result + ' document(s) updated');
			res.send(entity);
		}
	});
};

exports.insertEntity = function(collection, entity, res) {
	collection.insert(entity, {safe: true}, function (err, result) {
		if (err) {
			res.send({'error': 'An error has occurred'});
		} else {
			console.log('Success: ' + JSON.stringify(result[0]));
			res.send(result[0]);
		}
	});
};
exports.findByQuery = function(collection,query,res){
	console.log("Query : "+JSON.stringify(query));
	collection.find(query, {limit:100}).toArray(function(err, docs) {
		res.send(docs);
	});
};

exports.aggregate = function(collection, pipeline, res){
	console.log("Pipeline : "+JSON.stringify(pipeline));
	collection.aggregate(pipeline, function(err, docs){
		res.send(docs);
	});
}

