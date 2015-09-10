/**
 * Seeds.js
 * Pre-populates User database
 */

'use strict';

var User = require('../api/users/userModel');

module.exports = function () {
    if (process.env.NODE_ENV !== 'test') {
        User.find({role: 'admin'}, function (err, users) {
            if (users.length === 0) {
                User.create({
                    name: 'admin',
                    password: 'admin',
                    role: 'admin',
                    email: 'admin@<%= domain %>'
                });
            }
        });
    }
};
