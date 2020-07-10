var jwt =  require('jsonwebtoken');
var bcrypt  = require('bcryptjs');
var User = require('../../models/user');
var Email = require('../email/emails');
var config = require('../../config');
var authenticate = require('../../authenticate');
// `secret` is passwordHash concatenated with user's createdAt,
// so if someones gets a user token they still need a timestamp to intercept.
const usePasswordHashToMakeToken = (user)=>{
  //console.log(user);
  return authenticate.getToken({_id:user._id});
}

/*** Calling this function with a registered user's email sends an email IRL ***/
/*** I think Nodemail has a free service specifically designed for mocking   ***/
exports.sendPasswordResetEmail = async (req, res, next) => {
  User.findOne({ email : req.body.email})
  .then((user)=>{
    if(user)
    {
      const token = usePasswordHashToMakeToken(user)
      const url = Email.getPasswordResetURL(user, token)
      const emailTemplate = Email.resetPasswordTemplate(user, url)
    
      const sendEmail = () => {
        Email.transporter.sendMail(emailTemplate, (err, info) => {
          if (err) {
            res.status(500).json("Error sending email");
            console.log(err);
          }
          else
          {
            console.log(`** Email sent **`, info);
            res.statusCode = 200;
            res.setHeader('Content-Type','Plain-Text');
            res.end('Mail sent to ' + user.email);
          }
        })
      }
      sendEmail();
    }
    else
    {
      var err = new Error('No user with that email!!!');
      err.status = 403;
      next(err);
    }
  },(err) => next(err) )
  .catch((err) => next(err));
  
}

exports.receiveNewPassword = (req, res,next) => {

  User.findById(req.params.userId)
    .then((user) => {
      if(!user)
      {
        res.status = 500;
        res.setHeader('Content-Type','Plain-Text');
        res.end('User not found!!!');
        next();
      }
      const payload = jwt.decode(req.params.token, config.secretKey);
      console.log(payload);
      if (payload._id === user.id) {
        bcrypt.hash(req.body.password, 10, (err, hash)=>{
          if(err)
          {

          }
          else{
            user.password = hash;
            user.save()
            .then((user)=>{
              next();
            },(err)=>next(err))
            .catch((err)=>next(err))
          }
        })      
      }
      else
      {
        res.status = 500;
        res.setHeader('Content-Type','Plain-Text');
        res.end('User not found!!!');
        next();
      }
    },(err) => next(err))
    .catch(() => {
      res.status(404).json("Invalid user")
    })
}