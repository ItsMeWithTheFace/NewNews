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
	req.post.populate('comments', function(err, post) {	// retrieve comments along with posts
		if(err) { return next(err); }

		res.json(req.post);
	});
});

/* upvoting posts route */
router.put('/posts/:post/upvote', function(req, res, next) {
	req.post.upvote(function(err, post) {
		if(err) { return next(err); }

		res.json(post);
	});
});

/* route for comments on a particular post */
router.post('/posts/:post/comments', function(req, res, next) {
	var comment = new Comment(req.body);
	comment.post = req.post;

	comment.save(function(err, comment){
		if(err){ return next(err); }

		req.post.comments.push(comment);
		req.post.save(function(err, post){
			if(err) { return next(err); }

			res.json(comment);
		});
	});
});

/* upvotes of the comments */
router.put('/posts/:post/comments/:comment/upvote', function(req, res, next) {
	req.post.comment.upvote(function(err, post){
		if(err) { return next(err); }

		res.json(post);
	});
});

/* middleware function to retrieve comments specified by
the :comment route parameter */
router.param('comment', function(req, res, next, id) {
	var query = Comment.findById(id);

	query.exec(function(err, comment) {
		if(err) { return next(err); }
		if(!comment) { return next(new Error('can\'t find comment')); }

		req.comment = comment;
		return next();
	})
})

module.exports = router;
