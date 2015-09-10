/**
 * responseTemplate.js
 * This file defines the response template to be used throughout the application
 * For this to work, the npm module express-format-response is necessary
 */

'use strict';

var template = {
    response: {
        info: '<%%= res.fiddus.info %>',
        version: '<%%= res.fiddus.apiVersion %>',
        code: '<%%= res.responseStatus %>',
        method: '<%%= req.method %>',
        href: '<%%= res.fiddus.href %>'
    },
    data: '<%%= res.fiddus.data %>',
    pagination: '<%%= res.fiddus.pagination %>'
};

module.exports = template;
