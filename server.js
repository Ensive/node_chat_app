'use strict';

// dependencies
var http = require('http');
var fs = require('fs');
var path = require('path');
var mime = require('mime');

var cache = {};

/**
 * Creates http server to define per-request behavior
 */
var server = http.createServer(function (request, response) {
  var filePath = false;
  if (request.url === '/') {

    // determine html file to be served by default
    filePath = 'public/index.html';
  } else {

    // translate url path to relative file path
    filePath = 'public' + request.url;
  }

  var absPath = './' + filePath;

  // server static file
  serveStatic(response, cache, absPath);

});

// running server
server.listen(3000, function () {
  console.log('Server listening on port 3000');
});

// handle 404 errors
function send404(response) {
  response.writeHead(404, {'Content-Type': 'text/plain'});
  response.write('Error 404: resource not found.');
  response.end();
}

// send file data
function sendFile(response, filePath, fileContents) {
  response.writeHead(
    200,
    {'Content-Type': mime.lookup(path.basename(filePath))}
  );
  response.end(fileContents);
}

// serve static files
function serveStatic(response, cache, absPath) {

  // check if file is cached in memory
  if (cache[absPath]) {

    // serve file from memory
    sendFile(response, absPath, cache[absPath]);

  } else {

    // read file from disk
    fs.exists(absPath, function (exists) {
      if (exists) {
        fs.readFile(absPath, function (err, data) {
          if (err) {
            send404(response);
          } else {
            cache[absPath] = data;

            // serve file read from disk
            sendFile(response, absPath, data);
          }
        });
      } else {

        // send http 404 response
        send404(response);
      }
    });
  }
}
