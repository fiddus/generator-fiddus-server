/**
 * Server application main file
 */

'use strict';

var express = require('express'),
    config = require('./config/environment'),
    mongoose = require('mongoose'),
    app = express(),
    server = require('http').createServer(app),
    async = require('async'),
    MONGODB_URI = config.db.baseUrl + config.db.appDB;

require('./config/express')(app);
require('./routes')(app);

async.series([
    function connectToMongoDB (next) {
        mongoose.connect(MONGODB_URI, {}, function (err) {

            if (err) {
                return console.log('Erro connecting to mongoDB', err);
            } else {
                if (app.get('env') !== 'test') {
                    console.log('Connected to mongoDB.');
                }
                next();
            }
        });
    },
    function startListening () {
        server.listen(config.port, function () {
            if (app.get('env') !== 'test') {
                console.log('Express server listening on port', config.port, 'on', app.get('env'), 'mode');
            }
        });
    }
]);

module.exports = app;
