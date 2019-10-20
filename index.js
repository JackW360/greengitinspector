//import Octokit from '@octokit/rest';
const Octokit = require('@octokit/rest');
const express = require('express');
const superagent = require('superagent');
const app = express();
require('dotenv').config();
const api_calls = require('./api_calls.js');
const authRoutes = require('./routes/routes');
const passportConfig = require('./passport_config');
const passport = require('passport');
const mongoose = require('mongoose');
const cookieSession = require('cookie-session');


app.set('view engine', 'ejs');

app.use(cookieSession({
  maxAge: 1000 * 60 * 60 * 2, // cookie will keep user logged in for 5 hours
  keys: [process.env.COOKIE_KEY]
}));

app.use(passport.initialize());
app.use(passport.session());

app.get('/login', (req, res) => {
  res.render('login');
})

mongoose.connect(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true }, () => {
  console.log('connected to mongo db');
});

app.use(express.static('views'))

app.use('/', authRoutes);


const port = process.env.PORT || 3000;

app.listen(port, ()=>{
	console.log('listening at port ' + port)
});
