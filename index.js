'use strict';

var koa = require('koa');
var logger = require('koa-logger');
var bodyParser = require('koa-bodyparser');
var serve = require('koa-static');
var router = require('koa-router');
var views = require('co-views');
var path = require('path');

var app = global.app = koa();
var routes = require('./server/routes');

app.use(bodyParser());

// Add template render function to context
app.use(function *(next) {
	var render = views('./server/views', {
		default: 'jade'
	});
	this.render = render;
	yield next;
});

app.use(serve(path.join(__dirname, 'dist')));
if (app.env === 'development') {
	app.use(serve('.'));
}
app.use(routes.middleware());

var port = 3001;
var host = '0.0.0.0';

if (!module.parent) {
	app.listen(port, host, function() {
		console.log('Now listening on http://' + host + ':' + port);
	});
}

