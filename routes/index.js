var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/index', function(req, res, next) {
  res.render('index.ejs', { title: 'Express' });
});

router.get('/trial', function(req, res, next) {
  res.render('trial.ejs', { title: 'Express' });
});

router.get('/instruction', function(req, res, next) {
  res.render('instruction.ejs', { title: 'Express' });
});

router.get('/image-changing', function(req, res, next) {
  res.render('image-changing.ejs', { title: 'Express' });
});

router.get('/answer', function(req, res, next) {
  res.render('answer.ejs', { title: 'Express' });
});

module.exports = router;
