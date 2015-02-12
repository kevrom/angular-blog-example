'use strict';

var r = require('rethinkdbdash')({ db: 'blogtest' });

function * indexController() {
	this.body = yield this.render('index');
}

function * blogList() {
	this.body = yield r.table('blogs');
}

function * blogCreate() {
	var name = this.request.body['name'];
	var content = this.request.body['content'];
	if (!name || !content) { this.throw(500, 'Name and Content required.'); }
	var body = {
		name: name,
		content: content
	};
	var blog = yield r.table('blogs').insert(body, { returnChanges: true });
	this.body = blog.changes[0].new_val;
}

function * blogView() {
	var id = this.params.id;
	this.body = yield r.table('blogs').get(id);
	if (!this.body) { this.throw(404); }
}

function * blogUpdate() {
	var id = this.params.id;
	var body = this.response.body;
	var blog = yield r.table('blogs').get(id).update(body);
	console.log(blog);
	this.status(200);
}

function * blogDelete() {
	var id = this.params.id;
	var q = yield r.table('blogs').get(id).delete();
	console.log(q);
	this.status(200);
}

module.exports.indexController = indexController;
module.exports.blogList = blogList;
module.exports.blogCreate = blogCreate;
module.exports.blogView = blogView;
module.exports.blogUpdate = blogUpdate;
module.exports.blogDelete = blogDelete;
