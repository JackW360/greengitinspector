const router = require('express').Router();
const passport = require('passport');
const Octokit = require('@octokit/rest');
const api_calls = require('../api_calls.js');

//this middleware will be used to check if a user is logged in
const loggedInCheck = (req, res, next) => {
    if(!req.user){
        //if user is not logged in, redirect them to the login page
        res.redirect('/login');
    }
    else{
        next();
    }
}

//login route
router.get('/login', (req, res) => {
    res.render('login');
});

router.get('/login/github', passport.authenticate('github', {
        scope: [] //might need to include stuff in here
    })
);


router.get('/login/github/callback', passport.authenticate('github'), (req, res) =>{
    //res.send('you reached the callback uri');
    res.redirect('/home');
});



router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('login');
});


router.get('/home', loggedInCheck, (req, res) => {
  //console.log(req.user)

    res.render('index', {user: req.user});
});

router.get('/', loggedInCheck, (req, res) =>{
  res.redirect('/home');
})


router.get('/', loggedInCheck, (req, res) => {
    res.render('index', { user: req.user});
});

router.get('/home/search', loggedInCheck, (req, res) => {
  //console.log(req.user.accessToken);
    //instantiating the octokit object to use for github api api calls

    api_calls(req.query, req.user.accessToken).then((results)=>{

      res.send(results);

    }).catch( (error) =>{
      console.log(error);
    })
});


module.exports = router;
