var express = require('express');
var router = express.Router();
const db = require('../db');
const passport = require('passport');

//for log in needs username + password in Auth field
router.post('/', passport.authenticate('basic', {session : false}), (req, res) => {
    console.log("successful log in for user:")
    console.log(req.user);
    res.status(200);
    res.json({
      id: req.user.id,
      username: req.user.username,
      email: req.user.email
    })
  })

module.exports = router;