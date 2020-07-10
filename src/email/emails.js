var nodemailer = require('nodemailer');
var xouth2 = require('xoauth2');
var config = require('../../config');

exports.transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
  auth: {
    type: 'OAuth2',
    user: 'aparsh.gupta@gmail.com',
    clientId: config.clientId,
    clientSecret: config.clientSecret,
    refreshToken: config.refreshToken,
    accessToken: config.accessToken 
  }
})

exports.getPasswordResetURL = (user, token) =>
{
    var url = 'https://localhost:3443/users/receive_new_password/'+user._id+'/'+token;
    return url;
}


exports.resetPasswordTemplate = (user, url) => {
console.log(user.email);
  const from = "aparsh.gupta@gmail.com"
  const to = user.email
  const subject = "Backwoods Password Reset"
  const html = `
  <p>Hey ${user.username || user.email},</p>
  <p>We heard that you lost your Backwoods password. Sorry about that!</p>
  <p>But don’t worry! You can use the following link to reset your password:</p>
  <a href=${url}>${url}</a>
  <p>If you don’t use this link within 1 hour, it will expire.</p>
  <p>Do something outside today! </p>
  <p>–Your friends at Backwoods</p>
  `

  return { from:from, to:to, subject:subject, text: html }
}