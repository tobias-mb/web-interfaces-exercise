var express = require('express');
var router = express.Router();
var nodemailer = require("nodemailer");
const db = require('../db');
const passport = require('passport');
const bcrypt = require('bcryptjs');
const emailAuth = require('../emailAuth.json');
const client = require('../client.json');

const saltrounds = 10;

//email service
var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
      user: emailAuth.username,
      pass: emailAuth.password
  }
});

//check if something is an email address
function ValidateEmail(mail) 
{
 if (/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(mail))
  {
    return (true)
  }
    return (false)
}

/* create new user
needs username, email, password in req.body  */
router.post('/', (req,res) => {
  if(!req.body.password || !req.body.username || !req.body.email ){ //bad request
    console.log("username or password missing");
    res.status(400);
    res.send("username or password missing");
    return;
  }
  if(!ValidateEmail(req.body.email) ){ // not an email address
    console.log("invalid email");
    res.status(400);
    res.send("invalid email")
    return;
  }

  let validationKey = Math.floor(Math.random()*10000000);
  let link = `${client.address}/users/validation/newUser/${req.body.username}/${validationKey}`;
  let mailOptions={
    from: emailAuth.username,
    to : req.body.email,
    subject : "Please verify your email.",
    text : "Please use this link to verify your email: \n" + link
  }
  
  bcrypt.hash(req.body.password, saltrounds)
  .then(hash => {
    return db.query('insert into user_table (username, email, password, activated) values($1, $2, $3, $4)', [req.body.username, req.body.email, hash, false])
  })
  .then(result => {
    console.log('created new user: ' + req.body.username + ' (not validated yet)');
    return db.query('insert into validation_table (username, validationkey) values($1, $2)', [req.body.username, validationKey]);
  })
  .then(result => {
    return transporter.sendMail(mailOptions);
  })
  .then(result => {
    console.log("email sent")
    res.status(201);
    res.json({
      username: req.body.username,
      validationKey: validationKey
    })
  })
  .catch(error => {
    console.log('create user failed (users must be unique)');
    console.error(error);
    res.status(409);
    res.send('username and email must be unique ');
  })
})

//validate email address of a user
router.get('/validation/newUser/:username/:validationKey', (req, res) => {
  let foundUser = null;
  db.query('select * from validation_table where username=$1', [req.params.username])
  .then( result => {
    if(result.rows.length === 0){  //user doesn't exist'
      throw new Error("noUser")
    }
    foundUser = result.rows[0];
    if(foundUser.validationkey != req.params.validationKey ){ //wrong code
      throw new Error("wrongCode")
    }
    return db.query('update user_table set activated=$1 where username=$2', [true, req.params.username]);
  })
  .then( result => {
    console.log('user: ' + req.params.username + ' is now validated');
    return db.query('delete from validation_table where username=$1', [req.params.username]); // no need to keep it
  })
  .then(result => {
    res.render('validation', { title: req.params.username });
  })
  .catch(error => {
    console.error(error);
    res.status(404);
    res.send(error.message);
  })
})

// reset account password. Needs email of the user in req.body
router.post('/restore', (req, res) => {
  if( !req.body.email || !ValidateEmail(req.body.email) ){ // not an email address
    console.log("invalid email");
    res.status(400);
    res.send("invalid email");
    return;
  }

  let validationKey = Math.floor(Math.random()*10000000);
  let link = null;
  let mailOptions=null;

  let foundUser = null;
  db.query('select * from user_table where email=$1', [req.body.email])
  .then(result => {
    if(result.rows.length === 0){  //not found
      throw new Error("noUser")
    }
    foundUser = result.rows[0];
    return db.query('insert into resetpw_table (username, validationkey) values($1, $2)', [foundUser.username, validationKey]);
  })
  .then(result => {
    link = `${client.address}/users/validation/restorePw/${foundUser.username}/${validationKey}`;
    mailOptions={
      from: emailAuth.username,
      to : req.body.email,
      subject : "Account reset request from Pizza Palace.",
      text : `Your Pizza Palace username is: ${foundUser.username} \n` + "If you wish to reset your Password, follow the Link below. \n"
        + "If you do not want to change your Password, you don't need to do anything.\n" + link
    }
    return transporter.sendMail(mailOptions);      
  })
  .then(result => {
    console.log("email sent");
    res.status(201);
    res.json({
      username: foundUser.username,
      validationKey : validationKey
    })
  })
  .catch(err => {
    res.status(404);
    console.error(err);
    res.send(error.message);
  })
})

// password reset confirmation
router.get('/validation/restorePw/:username/:validationKey', (req, res) => {
  let newPw = null;
  db.query('select * from resetpw_table where username = $1',[req.params.username])
  .then(result => {
    if(result.rows.length === 0) { // not found
      throw new Error("noUser");
    }
    let testvar = false;
    for (let i = 0; i < result.rows.length; i++){ // in case someone does multiple change pw requests
      if(result.rows[i].validationkey == req.params.validationKey){
        testvar = true;
      }
    }
    if(!testvar) {  //wrong code
      throw new Error("wrongCode");
    }
    newPw = Math.floor(Math.random()*10000000);
    return bcrypt.hash(newPw.toString(), saltrounds);
  })
  .then(hash => {
    return db.query('update user_table set password=$1 where username=$2', [hash, req.params.username]);
  })
  .then(result => {
    console.log("pw has been updated")
    return db.query('select * from user_table where username = $1',[req.params.username])
  })
  .then(result => {
    if(result.rows.length === 0) { // not found
      throw new Error("noUser2");
    }
    mailOptions={
      from: emailAuth.username,
      to : result.rows[0].email,
      subject : "New Pizza Palace Password.",
      text : `Your new Pizza Palace password is: ${newPw}`
    }
    return transporter.sendMail(mailOptions);
  })
  .then(result => {
    console.log("email send.")
    return db.query('delete from resetpw_table where username=$1', [req.params.username]); // no need to keep it 
  })
  .then(result => {
    res.render('resetpw');
  })
  .catch(error => {
    console.error(error);
    res.status(404);
    res.send(error.message);
  })
})

//return email for the username in req.query
router.get('/email', (req, res) => {
  if(!req.query.username){
    res.status(400);
    res.send("missing username");
    return;
  }
  db.query('select * from user_table where username = $1', [req.query.username])
  .then(result => {
    if(result.rows.length === 0) {  // no such user
      throw new Error("noUser");
    }
    res.json(result.rows[0].email);
  })
  .catch(error => {
    console.error(error);
    res.status(404);
    res.send("user doesn't exist");
  })
})

//change email of a user. needs new email in req.body
router.put('/changeEmail', passport.authenticate('basic', {session : false}), (req, res) => {
  if(!req.body.email){
    res.status(400);
    res.send("missing email");
    return;
  }
  db.query('update user_table set email=$1 where username=$2', [req.body.email, req.user.username])
  .then(result => {
    res.sendStatus(200);
  })
  .catch(error => {
    console.error(error);
    res.status(409);
    res.send("This email already has an account");
  })
})

//change Pw of user. needs new password in req.body
router.put('/changePassword', passport.authenticate('basic', {session : false}), (req, res) => {
  if(!req.body.password) {
    res.status(400);
    res.send("password missing");
    return;
  }
  bcrypt.hash(req.body.password, saltrounds)
  .then(hash => {
    return db.query('update user_table set password=$1 where username=$2', [hash, req.user.username])
  })
  .then(result => {
    res.sendStatus(200);
  })
  .catch(error => {
    console.error(error);
    res.sendStatus(500);
  })
})

//return id of the username in req.query
router.get('/id', (req, res) => {
  if(!req.query.username){
    res.status(400);
    res.send("username missing");
    return;
  }
  db.query('select * from user_table where username = $1', [req.query.username])
  .then(result => {
    if(result.rows.length === 0) {  // no such user
      throw new Error("noUser");
    }
    res.json(result.rows[0].id);
  })
  .catch(error => {
    console.error(error);
    res.status(404);
    res.send("user doesn't exist.");
  })
})

module.exports = router;