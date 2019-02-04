const router = require('express').Router();
const passport = require('passport');
const User = require('../models/user-model');
const CookieTool = require("../tools/cookie");

// auth login
router.get('/login', (req, res) => {
    res.render('login', { user: req.user });
});

// auth logout
router.get('/logout', (req, res) => {
    res.cookie('isConnected', false);
    // handle with passport
    req.logout();
    res.redirect('http://localhost:4200/');
});

// // auth with google+
// router.get('/google', passport.authenticate('google', {
//     scope: ['profile']
// }));
//
// // callback route for google to redirect to
// router.get('/google/redirect', passport.authenticate('google'), (req, res) => {
// // router.get('/google/redirect', (req, res) => {
//     res.send('you reached the redirect URI');
// });
// // router.get('/google/redirect', passport.authenticate('google', {
// //         successRedirect : '/',
// //         failureRedirect : '/'
// // }));


// GET /auth/google
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Google authentication will involve
//   redirecting the user to google.com.  After authorization, Google
//   will redirect the user back to this application at /auth/google/callback
router.get('/google',
    passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/plus.login'] })
);

// GET /auth/google/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
// router.get('/google/redirect',
//     passport.authenticate('google', { failureRedirect: '/auth/login' }),
//     function(req, res) {
//         res.redirect('/profile');
//     }
// );


router.get('/signin-google',
    passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/plus.login'] })
);

router.get('/google/redirect',
    passport.authenticate('google', { failureRedirect: 'http://localhost:4200/auth/error' }),
    function(req, res) {
        var cookieTool = new CookieTool;
        var cookies = cookieTool.parseCookies(req);
        var sid = cookies['connect.sid'];
        // console.log('Cookies: ', sid);
        // console.log('googleId: ', req.user.googleId);
        User.findById(req.user._id, function (err, user) {
            if (err) return handleError(err);

            //user.add({ "sid": sid });
            user.set({ sid: sid });
            user.save(function (err, updatedUser) {
                if (err) return handleError(err);
                //res.send(updatedUser);
                // console.log(updatedUser);
            });
        });
        res.cookie('isConnected', true);
        res.cookie('user_google_id', req.user.googleId);
        res.cookie('user_username', req.user.username);
        res.cookie('user_thumbnail', req.user.thumbnail);
        res.redirect('http://localhost:4200/auth/confirmation');
    }
);

router.get("/profile", (req, res, next) => {
    var connectSidAngular = req.query.connectSidAngular;
    console.log(connectSidAngular);

    User.findOne({sid: connectSidAngular}).then((currentUser) => {
        if(currentUser){
            // already have this user
            console.log('user is: ', currentUser);
            res.json({
                username: currentUser.username,
                googleId: currentUser.googleId,
                thumbnail: currentUser.thumbnail,
                sid: currentUser.sid
            });
            // done(null, currentUser);
            // do something
        } else {
            // if user not find
            res.json(null);
        }

    });

    // if(!req.user){
    //     res.json(null);
    // } else {
    //     res.json({username: req.user.username, googleId: req.user.googleId, thumbnail: req.user.thumbnail });
    // }
});

module.exports = router;
