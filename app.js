const express = require('express');
const authRoutes = require('./routes/auth-routes');
const passport = require('passport');
const passportSetup = require('./modules/passport-setup');
const mongoose = require('mongoose');
const keys = require('./config/keys');
const app = express();
const session = require("express-session");
const bodyParser = require("body-parser");



//initialize for passport
app.use(express.static("public"));
app.use(session({
    maxAge: 24 * 60 * 60 * 1000,
    secret: keys.session.cookieKey,
    cookie: { httpOnly: false }
}));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json()); // allows to parse the data received in json
app.use(passport.initialize());
app.use(passport.session());


// Add headers for connection cross-domain
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');
    // res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');//todo:

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    // res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

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


// set up routes /auth/*
app.use('/auth', authRoutes);


// GET /
// create home route
app.get('/', (req, res) => {
    res.json({'status-serveur':'up'});
});


app.listen(3000, () => {
    console.log('app now listening for requests on port 3000');
});
