var http = require('http');
var fs = require('fs');
var path = require('path');
var mime = require('mime');
var chatServer = require('./lib/chat_server');
var cache = {};

// create the server
var server = http.createServer(function(request, response) {
	var filePath = false;

	if(request.url == '/') {
		filePath = 'public/index.html';
	} else {
		filePath = 'public' + request.url;
	}
	var absPath = './' + filePath;
	serveStatic(response, cache, absPath);
});
server.listen(3000, function() {
	console.log("Server listening on port 3000");
});

// handle resource not found
function send404(response) {
	response.writeHead(404, {'Content-Type': 'text/plain'});
	response.write('Error 404: resource not found');
	response.end();
}

// send the file to the client
function sendFile(response, filePath, fileContents) {
	response.writeHead(200,
		{"content-type": mime.lookup(path.basename(filePath))});
	response.end(fileContents);
}

// serve the resource, if possible
function serveStatic(response, cache, absPath) {
	// check if file is cached
	if(cache[absPath]) {
		// serve file from memory
		sendFile(response, absPath, cache[absPath]);
	} else {
		// check if file exists
		fs.exists(absPath, function(exists) {
			if(exists) {
				// read the file from the dick
				fs.readFile(absPath, function(err, data) {
					if(err) {
						send404(response);
					} else {
						cache[absPath] = data;
						// serve file read from disk
						sendFile(response, absPath, data);
					}
				});
			} else {
				send404(response);
			}
		});
	}
}

chatServer.listen(server);

