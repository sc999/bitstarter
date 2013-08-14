var express = require('express');
var fs = require('fs');
var os = require('os')

var app = express.createServer(express.logger());

app.get('/', function(request, response) {
//  response.send('Hello World 2.2!');
	response.send((fs.readFileSync('index.html')).toString());

});

var port = process.env.PORT || 8080;
var hostname = os.hostname(); 

app.listen(port, function() {
  console.log("Listening on " + hostname + ":"+ port);
});
