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
var variables = require('../db/variables');
var payload = {
  "page": "ล็อคอิน",
  "info": {
    "login": false,
    "faculty": "",
    "age": 0,
    "gender": ""
  },
  "trial": [
    // 1, 2
  ],
  "images": variables.images,
  "answers": variables.answers
};

router.post('/getImage', function(req, res, next) {
  var trial_no = req.body.trial_no;  
  res.json({success: true, data: payload.images[trial_no]});
});

router.get('/getAnswer', function(req, res, next) {
  res.render('answer.ejs', {answers: payload.answers[0]});
});

router.post('/answer', function(req, res, next) {
  var trial_no = req.body.trial_no;  
  res.render('answer.ejs', {answers: payload.answers[trial_no]});
});

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
  res.render('trial.ejs', { payload: payload });
});

router.get('/trial/:number', payloadUpdate('การทดสอบ'), function(req, res, next) {
  res.render('instruction.ejs', { payload: payload, trial_no: req.params.number-1 });
});

router.get('/instruction', payloadUpdate('การทดสอบ'), function(req, res, next) {
  res.render('instruction.ejs', { payload: payload });
});

router.get('/image-changing', payloadUpdate('การทดสอบ'), function(req, res, next) {
  res.render('image-changing.ejs', { payload: payload, trial_no: 0 });
});

router.get('/answer', payloadUpdate('การทดสอบ'), function(req, res, next) {
  res.render('answer.ejs', { payload: payload });
});

module.exports = router;
