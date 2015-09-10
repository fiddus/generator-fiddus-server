/**
 * responseStuffing
 * This middleware puts data inside the response
 * object in order for the response template to
 * work. @see express-format-response and responseTemplate.js
 */

'use strict';

var config = require('./environment'),

    stuff = function () {
        return function (req, res, next) {
            res.fiddus = {
                apiVersion: config.apiVersion,
                href: req.protocol + '://' + req.get('host') + req.originalUrl
            };
            next();
        };
    };

module.exports = stuff;
