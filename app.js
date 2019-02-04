const express = require('express');
const authRoutes = require('./routes/auth-routes');
const profileRoutes = require('./routes/profile-routes');
const passport = require('passport');
const passportSetup = require('./config/passport-setup');
const mongoose = require('mongoose');
const keys = require('./config/keys');

const app = express();

const session = require("express-session");
const bodyParser = require("body-parser");
const CookieTool = require("./tools/cookie");

// const cookieParser = require('cookie-parser');
// app.use(cookieParser());

app.use(express.static("public"));
app.use(session({
    maxAge: 24 * 60 * 60 * 1000,
    secret: keys.session.cookieKey,
    cookie: { httpOnly: false }
}));
app.use(bodyParser.urlencoded({ extended: false }));
//initialize passport
app.use(passport.initialize());
app.use(passport.session());

// set view engine
app.set('view engine', 'ejs');

// Add headers
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

// connect to mongodb
mongoose.connect(keys.mongodb.dbURI, function(err) {
    if (err) {
        throw err;
    } else {
        console.log('connected to mongodb');
    }
});

// set up routes
app.use('/auth', authRoutes);
app.use('/profile', profileRoutes);

// create home route
app.get('/', (req, res) => {
    var cookieTool = new CookieTool();
    var cookies = cookieTool.parseCookies(req);
    // console.log(cookies);
    console.log('Cookies: ', cookies['connect.sid']);
    res.render('home', { user: req.user });
});

app.listen(3000, () => {
    console.log('app now listening for requests on port 3000');
});
