/**
 * Local Facebook Adaptor
 * Gets data from facebook and either creates a new local user
 * or authenticates user
 */

'use strict';

var request = require('request'),
    auth = require('../authService'),
    async = require('async'),
    mask = require('json-mask'),
    User = require('../../api/users/userModel'),
    crypto = require('crypto'),

    prepareResponse = function (res, error, data, info) {

        if (error) {
            res.responseStatus = 500;
            res.fiddus.info = error;
            return;
        }

        res.fiddus.info = info;
        res.fiddus.data = data;
    },

    formatUser = function (user) {
        var formatted = mask(user, 'name,email');
        formatted.token = auth.signToken(user);
        return formatted;
    },

    lA = function (req, res, next) {
        var graphApiUrl = 'https://graph.facebook.com/v2.3/me',
            accessToken = req.body.accessToken,
            profile;


        async.series([
            // With the provided accessToken, get the user profile
            function (cb) {
                request.get({
                        url: graphApiUrl,
                        // jscs:disable
                        qs: {access_token: accessToken}, //jshint ignore:line
                        // jscs:enable
                        json: true
                    },
                    function (err, response, userProfile) {
                        if (err) {
                            prepareResponse(res, err);
                            return next();
                        }

                        if (response.statusCode !== 200) {
                            prepareResponse(res, userProfile);
                            return next();
                        }

                        profile = userProfile;

                        cb();
                    });
            },

            // With the profile retrieved, try to find user by facebook id
            function (cb) {
                User.findOne({facebookId: profile.id}, function (err, user) {
                    if (err) {
                        prepareResponse(res, err);
                        return next();
                    }

                    if (!user) {
                        return cb();
                    }

                    prepareResponse(res, null, formatUser(user), 'User authenticated');
                    return next();
                });
            },

            // If user was not found by facebook id, try to find by email
            function (cb) {
                if (profile.email) {
                    User.findOne({email: profile.email}, function (err, user) {
                        if (err) {
                            prepareResponse(res, err);
                            return next();
                        }

                        if (!user) {
                            return cb();
                        }

                        // If found user with same email as facebook profile email,
                        // Update local data to include facebook id
                        user.facebookId = profile.id;

                        user.save(function (err) {
                            if (err) {
                                prepareResponse(res, err);
                                return next();
                            }

                            prepareResponse(res, null, formatUser(user), 'User authenticated');
                            return next();
                        });
                    });
                } else {
                    prepareResponse(res, new Error('No email found on facebook profile'));
                    return next();
                }
            },

            // If user didn' exist, create user
            function () {
                var shasum = crypto.createHash('sha1'),
                    user,
                    password = 'facebook' + profile.id + (new Date()).valueOf();

                shasum.update(password);

                // If user not found, create user and return signed token
                user = new User({
                    // jscs:disable
                    name: profile.first_name + ' ' + profile.last_name, // jshint ignore:line
                    // jscs:enable
                    email: profile.email,
                    activeStatus: true,
                    facebookId: profile.id,
                    password: shasum.digest('hex')
                });

                user.save(function (err) {
                    if (err) {
                        prepareResponse(res, err);
                        return next();
                    }

                    prepareResponse(res, null, formatUser(user), 'User authenticated');
                    return next();
                });

            }
        ]);
    };

module.exports = lA;
