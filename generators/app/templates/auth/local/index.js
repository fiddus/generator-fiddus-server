'use strict';

var router = require('express').Router(),
    authHandler = require('../authResponseHandler'),
    responseFormatter = require('express-format-response'),
    template = require('../../config/responseTemplate');

router.post('/', authHandler('local'), responseFormatter(template));

module.exports = router;
