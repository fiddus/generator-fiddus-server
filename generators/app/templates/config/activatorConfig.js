/**
 * Activator Module Configuration Object
 * @see https://github.com/deitch/activator
 */

'use strict';

var User = require('../api/users/userModel'),
    _ = require('lodash'),
    mailer = require('nodemailer'),
    mg = require('nodemailer-mailgun-transport'),
    stubTransport = require('nodemailer-stub-transport'),
    mailGunAuth = {
        auth: {
            /* jshint ignore:start */
            /* jscs:disable */
            api_key: process.env.MAILGUN_APIKEY,
            /* jshint ignore:end */
            /* jscs:enable */
            domain: '<%= domain %>'
        }
    },
    config = require('./environment/'),
    transport =
        config.env === 'test' ? mailer.createTransport(stubTransport()) : mailer.createTransport(mg(mailGunAuth)),

    activatorConfig = {
        user: {
            find: function (id, callback) {
                User.findOne({_id: id}, function (err, user) {
                    if (err) {
                        return callback(err);
                    }

                    if (!user) {
                        return callback(null, null);
                    }

                    callback(null, user);
                });
            },
            save: function (id, data, callback) {
                User.findOne({_id: id}, function (err, user) {
                    if (err) {
                        return callback(err);
                    }

                    if (!user) {
                        return callback(new Error('Never found the user. Don\'t know why...'));
                    }

                    _.merge(user, data);

                    user.save(function (err) {
                        if (err) {
                            return callback(err);
                        }
                        callback(null);
                    });

                });
            }
        },
        transport: transport,
        templates: process.cwd() + '/resources/emailTemplates',
        from: '<%= fromEmail %>'
    };

module.exports = activatorConfig;
