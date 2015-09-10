/**
 * Passport Local Strategy Configuration
 */

'use strict';

var passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy;

module.exports = {
    setup: function (User) {
        passport.use(new LocalStrategy({
            usernameField: 'email',
            passwordField: 'password'
        }, function (email, password, done) {
                User.findOne({
                    email: email
                }, function (err, user) {
                    if (err) {
                        return done(err);
                    }

                    if (!user) {
                        return done(null, false, {message: 'Incorrect Email or Password'});
                    }

                    if (!user.authenticate(password)) {
                        return done(null, false, {message: 'Incorrect Email or Passord'});
                    }

                    return done(null, user);
                });
            }
        ));
    }
};
