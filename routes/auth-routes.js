const router = require('express').Router();
const passport = require('passport');
const User = require('../models/user-model');
const CookieTool = require("../tools/cookie");
const keys = require('../config/keys');

// GET /auth/logout
// this is the route middleware to authenticate the request. the first step of Google authentication that will involve redirect
router.get('/logout', (req, res) => {
    // init cookie for logout
    res.cookie('isConnected', false);
    res.cookie('user_google_id', '');
    res.cookie('user_username', '');
    res.cookie('user_thumbnail', '');
    // logout with passeport
    req.logout();
    // redirect to front-end
    res.redirect(keys.front.uri + '/');
});

// GET /auth/google
// this is the route middleware to authenticate the request. the first step of Google authentication that will involve redirect
router.get('/google',
    passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/plus.login'] })
);

// GET /auth/google/redirect
// this is the route middleware to authenticate the request.  this request is the callback, used by google
router.get('/google/redirect',
    passport.authenticate('google', { failureRedirect: keys.front.uri + '/auth/error' }),
    function(req, res) {
        var cookieTool = new CookieTool;
        var cookies = cookieTool.parseCookies(req);
        var sid = cookies['connect.sid'];
        User.findById(req.user._id, function (err, user) {
            if (err) return handleError(err);
            user.set({ sid: sid });
            user.save(function (err, updatedUser) {
                if (err) return handleError(err);
                console.log('save sid with success');
            });
        });
        // init cookie
        res.cookie('isConnected', true);
        res.cookie('user_google_id', req.user.googleId);
        res.cookie('user_username', req.user.username);
        res.cookie('user_thumbnail', req.user.thumbnail);
        // redirect to front-end
        res.redirect(keys.front.uri + '/auth/confirmation');
    }
);

// GET /auth/google/profile
// for get connected user information
router.get("/profile", (req, res, next) => {
    var connectSidAngular = req.query.connectSidAngular;
    User.findOne({sid: connectSidAngular}).then((currentUser) => {
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
