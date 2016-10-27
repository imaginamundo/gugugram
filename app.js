'use strict';

var express = require('express');
var exphbs  = require('express-handlebars');
var imgur = require('imgur');

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


// imgur
imgur.setClientId('d44fc08d3815abe');

imgur.getClientId();

imgur.saveClientId()
    .then(function () {
        console.log('Saved.');
    })
    .catch(function (err) {
        console.log(err.message);
    });

imgur.setCredentials('diogos.go@gmail.com', '***', 'aCs53GSs4tga0ikp');

// post
app.post('/upload', function (req, res) {
	console.log(req.body);
});

var port = process.env.PORT || 3000;

app.listen(port, function() {
    console.log('App is running on http://localhost:' + port);
});