const passport = require('passport');
const GithubStrategy = require('passport-github');
require('dotenv').config();
const User = require('./models/user_model');

//serializing the user's id for a cookie
passport.serializeUser((user, done) => {
    done(null, user.id);
})

//deserializing the user's id from a cookie
passport.deserializeUser((id, done) => {
    User.findById(id)
    .then((user) =>{
        done(null, user);
    });
})


passport.use(
    new GithubStrategy({

        // github strategy options
        callbackURL: 'https://greengitinspector.herokuapp.com/login/github/callback',
        clientID: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET

    }, (accessToken, refreshToken, profile, done) => {
        // callback function

        //check if user exists in DB
        User.findOne({githubId: profile.id}).then((currentUser)=>{
            if (currentUser) {
                //if user exists in DB

                //updates the access token associated with the user, if it has changed
                if (currentUser.accessToken != accessToken){
                    currentUser.set('accessToken', accessToken);
                    currentUser.save();
                }
                done(null, currentUser);
            }
            else{
                //user does not exist in DB, so add them
                new User({
                    username: profile.username,
                    githubId: profile.id,
                    icon_url: profile._json.avatar_url,
                    accessToken: accessToken
                }).save().then((newUser)=>{
                    console.log('new user:' + newUser);
                    done(null, newUser);
                })
            }
        })
    })
)
