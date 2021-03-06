
/*
* Homework Assignment #1
*
* Author: Shawn Wright
*/

// Dependencies
var http = require('http');
var url = require('url');
var StringDecoder = require('string_decoder').StringDecoder;
var port = 3000;

// Configure the server to respond to all requests with a string
var server = http.createServer(processRequest);

// Start the server
server.listen(port, function () {
    console.log('\x1b[32m%s\x1b[0m','The server is running and listening on port: ', port);
});

function processRequest(req, res) {

    // Parse the url
    var parsedUrl = url.parse(req.url, true);

    // Get the path
    var path = parsedUrl.pathname;
    var trimmedPath = path.replace(/^\/+|\/+$/g, '');

    // Get the query string as an object
    var queryStringObject = parsedUrl.query;

    // Get the HTTP method
    var method = req.method.toLowerCase();

    //Get the headers as an object
    var headers = req.headers;

    // Construct the data object to send to the handler
    var data = {
        'trimmedPath': trimmedPath,
        'queryStringObject': queryStringObject,
        'method': method,
        'headers': headers,
        'payload': ''
    };

    var decoder = new StringDecoder('utf-8');
    // Get the payload,if any
    var buffer = '';
    req.on('data', function (data) {
        buffer += decoder.write(data);
    });
    req.on('end', processResponse.bind(null, res, data, buffer));
};

function processResponse(res, data, buffer) {

    var decoder = new StringDecoder('utf-8');
    buffer += decoder.end();

    data.payload = buffer;

    // Check the router for a matching path for a handler. If one is not found, use the notFound handler instead.
    var chosenHandler = typeof (router[data.trimmedPath]) !== 'undefined' ? router[data.trimmedPath] : handlers.notFound;

    // Route the request to the handler specified in the router
    chosenHandler(data, function (statusCode, payload) {

        // Use the status code returned from the handler, or set the default status code to 200
        statusCode = typeof (statusCode) == 'number' ? statusCode : 200;

        // Use the payload returned from the handler, or set the default payload to an empty object
        payload = typeof (payload) == 'object' ? payload : {};

        // Convert the payload to a string
        var payloadString = JSON.stringify(payload);

        // Return the response
        res.setHeader('Content-Type', 'application/json');
        res.writeHead(statusCode);
        res.end(payloadString);

        if(typeof(statusCode) == 'number' && [200,201].indexOf(statusCode) > -1){
            console.log("Returning this response: ", statusCode, payloadString);
        } else
        {
            console.log('\x1b[31m%s\x1b[0m',"Returning this response: ", statusCode, payloadString);
        }
    });
};

// Define all the handlers
var handlers = {};

// Sample handler
handlers.hello = function (data, callback) {
    if(data.method=='get'){
        callback(200, { 'Message': 'Hello World!' });
    } else {
        callback(404);
    }
};

// Not found handler
handlers.notFound = function (data, callback) {
    callback(404);
};

// Define the request router
var router = {
    'hello': handlers.hello
};
