var express = require('express');
const bodyParser = require('body-parser');
var User = require('../models/user');
var passport = require('passport');
var authenticate = require('../authenticate');
var bcrypt = require('bcryptjs');
const cors = require('./cors');
var emailController = require('../src/controller/email.controller');
var router = express.Router();
router.use(bodyParser.json());

/* GET users listing. */
router.get('/', cors.corsWithOptions ,authenticate.veryUser ,function(req, res, next) {
  if(authenticate.verifyAdmin(req.user)){
    User.find({})
    .then((users)=>{
      res.statusCode=200;
      res.setHeader('Content-Type','application/json');
      res.json(users);
    },(err) => next(err) )
    .catch((err) => next(err));
  }
  else{
    res.statusCode = 403;
    res.setHeader('Content-Type','Plain-Text');
    res.end('Only admins are allowed to do a delete operation!!');
  }
});

router.post('/signup',cors.corsWithOptions, (req,res,next) => {

bcrypt.hash(req.body.password, 10, (err, hash)=>{
  if(err)
  {
    next(err);
  }
  User.register(new User({username : req.body.username, password: hash}),
  req.body.password, (err,user) => {
    console.log(user);
    if(err)
    {
      res.statusCode = 500;
      res.setHeader('Content-Type','application/json');
      res.json({err : err});
    }
    else{
      if(req.body.firstname){
        user.firstname = req.body.firstname;
      }
      if(req.body.lastname){
        user.lastname = req.body.lastname;
      }
      if(req.body.email){
        user.email = req.body.email;
      }

      user.save((err,user)=>{
        if(err){
          console.log('error2');
          res.statusCode = 500;
          res.setHeader('Content-Type','application/json');
          res.json({err : err});
          return;
        }
        bcrypt.compare(req.body.password, user.password, (err,result) => {
          if(result)
          {
            var token = authenticate.getToken({_id:user._id});
            res.statusCode = 200;
            res.setHeader('Content-Type','application/json');
            res.json({success:true,token: token, status: 'Resgistration Successful!'});
          }
          else
          {
            next(err);
          }
        })
      });
    }
  });
})
  
});


router.post('/login',cors.corsWithOptions,
authenticate.UserLogin , (req,res,next)=>{
  var token = authenticate.getToken({_id:req.body._id});
  res.statusCode = 200;
  res.setHeader('Content-Type','application/json');
  res.json({success:true,token: token,status: 'Login Successful!'});  
});

router.get('/logout', cors.corsWithOptions, (req,res,next) => {
  if(req.session)
  {
    req.session.destroy();
    res.clearCookie('session-id');
    res.redirect('/');
  }
  else 
  {
    var err = new Error('JWT no logout needed!!');
    err.status=403;
    return next(err);
  }
});

router.post('/reset_password',cors.corsWithOptions,emailController.sendPasswordResetEmail);

router.post('/receive_new_password/:userId/:token',cors.corsWithOptions, 
emailController.receiveNewPassword, (req,res)=>{
  var token = authenticate.getToken({_id:req.params.userId});
  res.statusCode = 200;
  res.setHeader('Content-Type','application/json');
  res.json({success:true,token: token,status: 'Password Updated!'});
});

module.exports = router;
