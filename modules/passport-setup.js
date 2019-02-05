const passportSetup = require('passport');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const LocalStrategy = require('passport-local').Strategy;
const keys = require('../config/keys');
const User = require('../models/user-model');

passportSetup.serializeUser((user, done) => {
    done(null, user.id);
});

passportSetup.deserializeUser((id, done) => {
    User.findById(id).then((user) => {
        done(null, user);
    });
});

passportSetup.use(
    new GoogleStrategy({
        // options for google strategy
        clientID: keys.google.clientID,
        clientSecret: keys.google.clientSecret,
        callbackURL: keys.google.callbackUrl
    }, (accessToken, refreshToken, profile, done) => {
        // check if user already exists in our own db
        User.findOne({googleId: profile.id}).then((currentUser) => {
            if(currentUser){
                // already have this user
                console.log('user is: ', currentUser);
                done(null, currentUser);
            } else {
                // if not, create user in our db
                 new User({
                    googleId: profile.id,
                    username: profile.displayName,
                    thumbnail: profile._json.image.url,
                    type: 'google'
                }).save().then((newUser) => {
                    console.log('created new user: ', newUser);
                    done(null, newUser);
                });
            }

        });
    })
);

passportSetup.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password'
    },
    function(email, password, done) {
        console.log(email);
        User.findOne({email: email}).then((currentUser) => {
            if(currentUser){
                // already have this user
                console.log('user is: ', currentUser);
                // if correct password
                if( currentUser.password === password ) {
                    return done(null, currentUser);
                } else {
                    // if incorrect password
                    return done(null, false, { message: 'Incorrect password.' });
                }
            } else {
                // if user not exist
                return done(null, false, { message: 'Incorrect email.' });
            }

        });
    }
));
