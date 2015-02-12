'use strict';

var Router = require('koa-router');
var r = new Router();
var c = require('./controllers');

// API routes
r.get('/api/blogs', c.blogList);
r.post('/api/blogs', c.blogCreate);
r.get('/api/blogs/:id', c.blogView);
r.put('/api/blogs/:id', c.blogUpdate);
r.delete('/api/blogs/:id', c.blogDelete);

r.get(/^.*$/, c.indexController);

module.exports = r;
