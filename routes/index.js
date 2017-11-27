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
  if (req.session.login)
    return next();
  else
    return res.redirect('/');
};

var indexAuth = function(req, res, next) {
  if(req.session.login)
    res.redirect('/trial');
  else
    return next();
}
router.get('/test', function(req, res, next) {
  sheets.testAppend((err) => {
    if(!err) {
      res.send('not err');      
    }
  });
});

var variables = require('../db/variables');


router.post('/getImage', auth, function(req, res, next) {
  var trial_no = req.body.trial_no;  
  res.json({success: true, data: req.session.payload.images[trial_no]});
});

router.post('/answer', auth, function(req, res, next) {
  var trial_no = req.body.trial_no;  
  res.render('answer.ejs', { payload: req.session.payload, answers_images: req.session.payload.answers_images[trial_no], trial_no: trial_no });  
});

var payloadUpdate = (page) => {
  return function(req, res, next) {
    req.session.payload.page = page;
    req.session.payload.info.login = req.session.login;
    req.session.payload.info.faculty = req.session.faculty;
    req.session.payload.info.age = req.session.age;
    req.session.payload.info.gender = req.session.gender;
    next();
  }
}
var initPayload = (req, res, next) => {
  if(!req.session.login) {
    req.session.payload = {
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
      "answers_images": variables.answers_images,
      "answers": variables.answers
    };
  }
  next();
}
/* GET home page. */
router.get('/', initPayload, payloadUpdate('ล็อคอิน'), indexAuth, function(req, res, next) {
  res.render('index.ejs', {payload: req.session.payload});
});

router.post('/login', initPayload, function(req, res, next) {
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
    req.session.payload = {
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
      "answers_images": variables.answers_images,
      "answers": variables.answers
    };
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

router.get('/trial', payloadUpdate('การทดสอบ'), auth, function(req, res, next) {
  // res.render('trial.ejs', { payload: req.session.payload });
  res.render('route-page.ejs', { payload: req.session.payload });
});

router.get('/trial/:number', payloadUpdate('การทดสอบ'), auth, function(req, res, next) {
  res.render('trial.ejs', { payload: req.session.payload });
  // res.render('image-changing.ejs', { payload: req.session.payload, trial_no: req.params.number-1 });
});

router.get('/trial/:experimentNo/:trialNo', payloadUpdate('การทดสอบ'), auth, function(req, res, next) {
  var experimentNo = parseInt(req.params.experimentNo)-1,
  trialNo = parseInt(req.params.trialNo)-1,
  sumNo = parseInt(experimentNo)*4 + parseInt(trialNo);

  var str = "experimentNo: "+experimentNo+" trialNo: "+trialNo+ " +:"+ sumNo;
  // console.log('str: ', str);
  // res.send({str: str});
  res.render('image-changing.ejs', { payload: req.session.payload, trial_no: sumNo });
});

router.post('/trial/:experimentNo/:trialNo', payloadUpdate('การทดสอบ'), auth, function(req, res, next) {
  var answer = req.body.answer;
  var time = req.body.time;
  // console.log('experiment post called')

  var experimentNo = parseInt(req.params.experimentNo)-1,
  trialNo = parseInt(req.params.trialNo)-1,
  sumNo = parseInt(experimentNo)*4 + parseInt(trialNo);
  // console.log('sumNo: ', sumNo);
  
  var experimentText = "หมวดการทดลองที่ " + (experimentNo+1);
  // console.log('experimentText: ', experimentText);
  var trialText = "การทดลองที่ " + (trialNo+1);
  // console.log('trialText: ', trialText);
  
  var values = [ [
    req.session.faculty,
    req.session.age,
    req.session.gender,
    experimentText,
    trialText
    ]
  ];

  // console.log('value: ', values);
  // console.log('req.session.payload.answers[sumNo]: ', req.session.payload.answers[sumNo]);
  if(answer == req.session.payload.answers[sumNo]) {
    values[0].push('ถูก');
    values[0].push(time);

    sheets.submit(values, (err) => {
      if(!err)
        res.send(true);
    });
  } else {
    values[0].push('ผิด');
    values[0].push(time);
    
    sheets.submit(values, (err) => {
      if(!err)
        res.send(false);
    });
  }

});

router.post('/trial/:number', payloadUpdate('การทดสอบ'), auth, function(req, res, next) {
  var answer = req.body.answer;
  var trial_no = req.params.number;
  req.session.payload.trial.push(trial_no);
  var values = [ [
      req.session.faculty,
      req.session.age,
      req.session.gender,
      parseInt(trial_no)+1
    ]
  ]
  if(answer == req.session.payload.answers[trial_no]) {
    values[0].push('ถูก');
    sheets.submit(values, (err) => {
      if(!err)
        res.send(true);
    });
  } else {
    values[0].push('ผิด');
    sheets.submit(values, (err) => {
      if(!err)
        res.send(false);
    });
  }
});

router.get('/instruction', payloadUpdate('การทดสอบ'), function(req, res, next) {
  res.render('instruction.ejs', { payload: req.session.payload });
});

router.get('/image-changing', payloadUpdate('การทดสอบ'), function(req, res, next) {
  res.render('image-changing.ejs', { payload: req.session.payload, trial_no: 0 });
});

router.post('/image', function(req, res, next) {
  var imgsrc = req.body.imgsrc;
  res.render('images.ejs', {imgsrc: imgsrc})
});

module.exports = router;
