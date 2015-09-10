/**
 * Helper function to build a full url from request parameters
 */

'use strict';

var queryString = require('querystring'),

    urlBuilder = function (req, params) {
        var query = queryString.stringify(params);

        query = query.length ? '?' + query : '';
        return req.protocol + '://' + req.get('host') + req.baseUrl + req.path + query;
    };

module.exports = urlBuilder;
