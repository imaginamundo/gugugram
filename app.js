'use strict';

var express = require('express');
var exphbs  = require('express-handlebars');
var bodyParser = require('body-parser');

var app = express();

// engine
app.set('view engine', 'handlebars');

// static files
app.use('/asset', express.static('asset'));

// main-layout
app.engine('handlebars',
	exphbs({
		defaultLayout:'main'
	})
);

// main page
app.get('*', function (req, res) {
    res.render('index');
});

var port = process.env.PORT || 3000;

app.listen(port, function() {
    console.log('Our app is running on http://localhost:' + port);
});