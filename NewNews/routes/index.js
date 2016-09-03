var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();

var Post = mongoose.model('Post');
var Comment = mongoose.model('Comment');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* GET posts page */
router.get('/posts', function(req, res, next) {
	Post.find(function(err, posts){
		if(err){ return next(err); }	// error handling

		res.json(posts);	// send retrieved posts back to client
	});
});

/* POST comments onto posts page */
router.post('/posts', function(req, res, next) {
	var post = new Post(req.body);

	post.save(function(err, post){
		if(err){ return next(err); }

		res.json(post);
	});
});

/* route to preload post objects */
router.param('post', function(req, res, next, id) {
	var query = Post.findById(id);

	query.exec(function(err, post) {
		if(err){ return next(err); }
		if(!post) { return next(new Error('can\'t find post')); }

		req.post = post;
		return next();
	});
});

/* route for returning a single post */
router.get('/posts/:post', function(req, res) {
	res.json(req.post);
});


module.exports = router;
