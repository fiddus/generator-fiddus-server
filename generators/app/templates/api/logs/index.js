/**
 * Action Logging API Route
 */

'use strict';

var router = require('express').Router(),
    controller = require('./logController'),
    auth = require('../../auth/authService'),
    formatResponse = require('express-format-response'),
    template = require('../../config/responseTemplate'),
    responseFormatter = formatResponse(template);

router.get('/', auth.hasRole('admin'), controller.list, responseFormatter);

module.exports = router;
