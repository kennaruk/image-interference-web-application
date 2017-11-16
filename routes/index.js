var express = require('express');
var router = express.Router();

/* GET users listing. */
var session = require('express-session');
router.use(session({
  secret: 'CSTU32',
  resave: true,
  saveUninitialized: true
}));

var sheets = require('../db/sheets');

// Authentication and Authorization Middleware
var auth = function(req, res, next) {
  if (req.session.admin)
    return next();
  else
    return res.redirect('/admin/');
};

router.get('/test', function(req, res, next) {
  sheets.testAppend((err) => {
    if(!err) {
      res.send('not err');      
    }
  });
});

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
