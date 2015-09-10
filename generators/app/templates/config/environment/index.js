/**
 * Environment Definitions
 * In this file, the default configurations are set.
 * For particular configurations of individual environments,
 * see appropriate file (prod.js, dev.js, test.js) in this same
 * directory.
 */

'use strict';

var _ = require('lodash'),

    all = {
        env: process.env.NODE_ENV,
        apiVersion: 1,
        port: 9000,
        maxObjectsPerRequest: 100,
        defaultObjectsPerRequest: 10,
        db: {
            baseUrl: 'mongodb://localhost/'
        },
        secrets: {
            session: process.env.APP_SECRET || 'd6c8f42d6c2d04d1ed5c21ec2f199b59'
        },
        userRoles: ['user', 'admin']
    };

module.exports = _.merge(all, require('./' + process.env.NODE_ENV + '.js') || {});
