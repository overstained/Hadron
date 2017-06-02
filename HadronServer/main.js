var express = require('express'),
	bodyParser = require('body-parser'),
	application = express(),
	genericConstants = require('./generic-constants')(),
	queryConstants = require('./query-constants')(),
	cors = require('./cors-filter')(application, genericConstants),
	http = require('http'),
	mongodb = require('mongodb'),
	mongoClient = mongodb.MongoClient,
	tokenHandler = require('./interceptor.js')(application, genericConstants);

application.use(bodyParser.urlencoded({
	extended: false
}))
application.use(bodyParser.json())


mongoClient.connect('mongodb://localhost:27017/hadrondb', function(err, db) {
	if (err) {
		console.log('Error connecting to database localhost:27017/hadrondb ', err)
	} else {
		require('./authentication-server')(db, application, genericConstants, queryConstants, tokenHandler);
	}
});

http.createServer(application).listen(8080, function() {
	console.log("Express server listening on port " + 8080);
});