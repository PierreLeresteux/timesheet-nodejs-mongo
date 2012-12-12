var http = require('http');

exports.init = function(app) {

	var sendLib = function(response, host, path){
		var options = {
			host: host,
			port: 80,
			path: path,
			method: 'GET'
		};

		var fileData = '';
		var request = http.request(options, function(res) {
			console.log('GET '+res.statusCode+' '+options.host+options.path);
			res.setEncoding('utf8');
			res.on('data', function(chunk){
				fileData+=chunk;
			});

			res.on('end', function() {
				response.type(res.headers['content-type'] || 'application/javascript');
				response.send(fileData);
			});

			res.on('error', function(e) {
				response.send(res.statusCode, e.message);
			});
		});

		request.on('error', function(e) {
			console.log('problem with request: ' + e.message);
			response.send(500, e.message);
		});

		request.end();
	}

	app.get('/libs/:cdn/:lib/:version/:file', function(req, resp){
		var host, path;
		switch(req.params.cdn) {
			case 'google':
				host =  'ajax.googleapis.com';
				path = '/ajax/libs/'+req.params.lib+'/'+req.params.version+'/'+req.params.file;
				break;
			case 'requirejs':
				host = 'requirejs.org';
				var min = (req.query.min && req.query.min == 'false') ? false : true;
				path = '/docs/release/'+req.params.version+'/'+(min ? 'minified' : 'comments')+'/'+req.params.file;
				break;
			case 'cdnjs':
				host = 'cdnjs.cloudflare.com';
				path = '/ajax/libs/'+req.params.lib+'/'+req.params.version+'/'+req.params.file;
				break;
		}
		sendLib(resp, host, path);
	});
}