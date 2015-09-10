/**
 * Application main routes
 */

'use strict';

module.exports = function (app) {
    app.use('/api/users', require('./api/users'));
    app.use('/api/logs', require('./api/logs'));
    app.use('/auth', require('./auth'));
};
