var express = require('express');
var router = express.Router();

/* GET users listing. */
var session = require('express-session');
router.use(session({
  secret: 'HIP-Project',
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

var payload = {
  "page": "ล็อคอิน",
  "info": {
    "login": false,
    "faculty": "",
    "age": 0,
    "gender": ""
  },
  "trial": [

  ]
};

var payloadUpdate = (page) => {
  return function(req, res, next) {
    payload.page = page;
    payload.info.login = req.session.login;
    payload.info.faculty = req.session.faculty;
    payload.info.age = req.session.age;
    payload.info.gender = req.session.gender;
    next();
  }
}

/* GET home page. */
router.get('/', payloadUpdate('ล็อคอิน'), function(req, res, next) {
  res.render('index.ejs', {payload: payload});
});

router.post('/login', function(req, res, next) {
  var faculty = req.body.faculty,
  age = req.body.age,
  gender = req.body.gender;
  
  if(faculty === '' || age === '' || gender === '') {
    res.json({"success": false, "msg": "กรอกข้อมูลผิดพลาด กรุณากรอกข้อมูลให้ถูกต้อง"});    
  } else {
    req.session.login = true;
    req.session.faculty = req.body.faculty;
    req.session.age = req.body.age;
    req.session.gender  = req.body.gender;
    res.json({"success": true, "msg": "login success"});
  }
});

router.get('/index', function(req, res, next) {
  res.render('index.ejs', { title: 'Express' });
});

router.get('/logout', function(req, res, next) {
  req.session.destroy();
  res.redirect('/');
});

router.get('/trial', payloadUpdate('การทดสอบ'), function(req, res, next) {
  console.log(payload);
  res.render('trial.ejs', { payload: payload });
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
