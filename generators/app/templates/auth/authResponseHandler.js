'use strict';

var passport = require('passport'),
    auth = require('./authService'),

    handler = function (strategy) {
        return function (req, res, next) {
            passport.authenticate(strategy, function (err, user, info) {
                var error = err || info;

                if (error) {
                    res.responseStatus = 401;
                    res.fiddus.info = error;
                    return next();
                }

                if (!user) {
                    res.responseStatus = 401;
                    res.fiddus.info = 'Something went wrong, please try again';
                    return next();
                }

                var token = auth.signToken(user);
                res.responseStatus = 200;
                res.fiddus.info = 'User logged in';
                res.fiddus.data = {
                    name: user.name,
                    email: user.email,
                    token: token
                };
                return next();
            })(req, res, next);
        };
    };

module.exports = handler;
