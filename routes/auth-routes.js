const router = require('express').Router();
const passport = require('passport');
const User = require('../models/user-model');
const CookieTool = require("../modules/cookie");
const keys = require('../config/keys');

// GET /auth/logout
// this is the route middleware to authenticate the request. the first step of Google authentication that will involve redirect
router.get('/logout', (req, res) => {
    // init cookie for logout
    res.cookie('isConnected', false);
    res.cookie('user_google_id', '');
    res.cookie('user_username', '');
    res.cookie('user_thumbnail', '');
    res.cookie('user_email', '');
    // logout with passeport
    req.logout();
    // redirect to home page front-end
    res.redirect(keys.front.uri + '/auth/signin');
});

// POST /auth/login
router.post('/login',
    passport.authenticate('local', { failureRedirect: '/auth/error' }),
    function (req, res) {
        // recover the sid from the client
        var sid = req.body.sid;

        // search user by id
        User.findById(req.user._id, function (err, user) {
            if (err) {
                console.log('error to find user :', err);
                res.json({ error: true });
            } else {
                // update sid for new connection user
                user.set({ sid: sid });
                console.log('save-sid', sid);

                user.save(function (err, updatedUser) {
                    if (err) {
                        console.log('error to save user :', err);
                        res.json({ error: true });
                    } else {
                        console.log('save sid with success');
                        // send response
                        res.json({
                            error: false,
                            isConnected: true,
                            sid: sid
                        });
                    }

                });
            }

        });
    }
);

// GET /auth/error
// this page is used when /auth/login generates an error. it allows to return a JSON
router.get('/error', (req, res) => {
    res.json({ error: true });
});


// GET /auth/signin/redirect
router.get('/signin/redirect', (req, res) => {

    // get sid in cookie
    var cookieTool = new CookieTool;
    var cookies = cookieTool.parseCookies(req);
    var sid = cookies['connect.sid'];

    // search user by sid
    User.findOne({sid: sid}).then((currentUser) => {
        if(currentUser){ // if the sid is a connected user
            // init cookie
            res.cookie('isConnected', true);
            res.cookie('user_username', currentUser.username);
            res.cookie('user_email', currentUser.email);
            // if the user is found, redirects to the confirmation page
            res.redirect(keys.front.uri + '/auth/confirmation');
        } else {
            // if the user is not found, redirects to the error page
            res.redirect(keys.front.uri + '/auth/error');
        }

    });
});

// GET /auth/google
// this is the route middleware to authenticate the request. the first step of Google authentication that will involve redirect
router.get('/google',
    passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/plus.login'] })
);

// GET /auth/google/redirect
// this is the route middleware to authenticate the request. this request is the callback, used by google
router.get('/google/redirect',
    passport.authenticate('google', { failureRedirect: keys.front.uri + '/auth/error' }),
    function(req, res) {
        // get sid in cookie
        var cookieTool = new CookieTool;
        var cookies = cookieTool.parseCookies(req);
        var sid = cookies['connect.sid'];

        // find by id
        User.findById(req.user._id, function (err, user) {
            if (err) {
                console.log('error to find user :', err);
                // redirect to front-end
                res.redirect(keys.front.uri + '/auth/error');
            } else {
                // update sid for new connection user
                user.set({ sid: sid });
                console.log('save-sid', sid);

                user.save(function (err, updatedUser) {
                    if (err) {
                        console.log('error to save user :', err);
                        // redirect to front-end
                        res.redirect(keys.front.uri + '/auth/error');
                    } else {
                        console.log('save sid with success');
                        // init cookie
                        res.cookie('isConnected', true);
                        res.cookie('user_google_id', req.user.googleId);
                        res.cookie('user_username', req.user.username);
                        res.cookie('user_thumbnail', req.user.thumbnail);
                        // redirect to front-end
                        res.redirect(keys.front.uri + '/auth/confirmation');
                    }
                });
            }
        });

    }
);

// GET /auth/google/profile
// for get connected user information
router.get("/profile", (req, res, next) => {
    var sid = req.query.connectSidAngular;
    User.findOne({sid: sid}).then((currentUser) => {
        if(currentUser){
            // if the sid is a connected user
            console.log('user is: ', currentUser);
            res.json({
                username: currentUser.username,
                googleId: currentUser.googleId,
                thumbnail: currentUser.thumbnail,
                sid: currentUser.sid
            });
        } else {
            // if user not find
            res.json(null);
        }
    });
});

module.exports = router;
