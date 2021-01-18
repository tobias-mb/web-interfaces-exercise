var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const passport = require('passport');
const passportHttp = require('passport-http');
const bcrypt = require('bcryptjs');

const db = require('./db');
/* ---------------- routers go here ---------------- */
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var loginRouter = require('./routes/login');
var productsRouter = require('./routes/products');
/* ---------------- routers done ---------------- */

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(cors());  
app.use(helmet());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

/* ---------------- routes go here ---------------- */
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/login', loginRouter);
app.use('/products', productsRouter);
/* ---------------- routes done -------------------- */

//Authorization need username & hashed password in Auth field of request
passport.use(new passportHttp.BasicStrategy(function(username, password, done) {
  if (!username || !password) return done(null, false); // check for empty string
  let foundUser = null;
  db.query('select * from user_table where username=$1', [username])
  .then( result => {
    if(result.rows.length === 0){  //user doesn't exist'
      return false;
    }
    foundUser = result.rows[0];
    if(!foundUser.activated){ //user has not verified email
      return false;
    }
    return bcrypt.compare(password, result.rows[0].password);
  })
  .then( result => {
    if(!result){  //wrong pw
      return done(null, false);
    }
    done(null, foundUser);
  })
  .catch(err => {
    console.error(err)
  })
  
}));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

/* ---------------- DB init ---------------- */
Promise.all(
  [
      db.query(`CREATE TABLE IF NOT EXISTS public.user_table(
        id SERIAL PRIMARY KEY,
        username VARCHAR(64) UNIQUE,
        email VARCHAR(128) UNIQUE,
        password VARCHAR(128),
        activated BOOLEAN
      )`),
      db.query(`CREATE TABLE IF NOT EXISTS public.validation_table(
        id SERIAL PRIMARY KEY,
        username VARCHAR(64),
        validationkey VARCHAR(64)
      )`),
      db.query(`CREATE TABLE IF NOT EXISTS public.resetpw_table(
        id SERIAL PRIMARY KEY,
        username VARCHAR(64),
        validationkey VARCHAR(64)
      )`),
      db.query(`CREATE TABLE IF NOT EXISTS public.products_table(
        id SERIAL PRIMARY KEY,
        title VARCHAR(128),
        description TEXT,
        category VARCHAR(128),
        location VARCHAR(255),
        images VARCHAR(64),
        price NUMERIC(12,2),
        posting_date DATE NOT NULL DEFAULT CURRENT_DATE,
        delivery VARCHAR(255),
        seller INT
      )`),
      db.query(`CREATE TABLE IF NOT EXISTS public.images_table(
        id SERIAL PRIMARY KEY,
        ownerPosting INT,
        title VARCHAR(64),
        link VARCHAR(128)
      )`)
      // Add more create table statements here
  ]
).then(() => {
  console.log('database initialized');
})
.catch(error => console.log(error));

module.exports = app;
