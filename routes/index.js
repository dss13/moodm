var express = require('express');
var router = express.Router();
var getMood = require('./../lib/getMood');
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'MoodM' });
});

router.post('/', function(req, res, next) {
	var searchParameter = req.body.search;
	getMood(searchParameter, function(err, result) {
		res.send(result);
	})
});

module.exports = router;
