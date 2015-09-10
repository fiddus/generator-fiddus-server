/**
 * Express Configuration File
 */


'use strict';

var bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    errorHandler = require('errorhandler'),
    logger = require('express-bunyan-logger'),
    logDir = process.cwd() + '/logs/',
    stuffResponse = require('./responseStuffing'),
    seed = require('./seeds');

seed();

module.exports = function (app) {
    app.use(function (req, res, next) {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
        next();
    });
    app.use(bodyParser.urlencoded({extended: false}));
    app.use(bodyParser.json());
    app.use(cookieParser());
    app.use(logger({
        name: 'Admin',
        streams: [{
            level: 'info',
            path: logDir + 'info.log'
        }, {
            level: 'warn',
            path: logDir + 'warn.log'
        }, {
            level: 'error',
            path: logDir + 'error.log'
        }]
    }));
    app.use(stuffResponse());
    app.use(errorHandler());
    app.set('view engine', 'ejs');
    app.set('views', process.cwd() + '/resources/templates');
};
