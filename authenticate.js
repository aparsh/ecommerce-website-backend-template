var pssport = require('passport');
var LocalStratergy = require('passport-local').Strategy;
var User = require('./models/user');
const passport = require('passport');
var JwtStratergy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var config = require('./config');
const { NotExtended } = require('http-errors');
const express = require('express');



exports.local = passport.use(new LocalStratergy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


exports.getToken = function(user){
    return jwt.sign(user,config.secretKey,
        {expiresIn:3600});
}

var opts={};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = config.secretKey;

exports.jwtPassport = passport.use(new JwtStratergy(opts,
    (jwt_paylod,done)=>{
        console.log('JWT Payload: '+jwt_paylod);
        User.findOne({_id:jwt_paylod._id}, (err,user)=>{
            if(err){
                return done(err,false);
            }
            else if(user){
                return done(null,user);
            }
            else{
                return done(null,false);
            }
        });
    }));

exports.veryUser = passport.authenticate('jwt',{session:false});

exports.UserLogin = (req, res, next) => {
    User.findOne({username:req.body.username})
    .then((user)=>{
        console.log(user);
        if(user){
            bcrypt.compare(req.body.password, user.password, (err,result) => {
                if(result)
                {
                    req.body._id = user._id;
                    next();
                }
                else
                {
                    err = new Error('Invalid Password!!!');
                    err.statusCode = 403;
                    next(err);
                }
              })
        }
    },(err)=> next(err))
    .catch((err)=> next(err)) 
}

exports.verifyAdmin = (user) =>{
    if(user.admin){
        return true;
    }
    else{
        return false;
    }
};

exports.verifyAdminInLine = (req, res, next) => {
    if(req.user.admin)
    {
        next();
    }
    else
    {
        err = new Error('Only admins can do that!!');
        err.statusCode = 403;
        next(err);
    }
}