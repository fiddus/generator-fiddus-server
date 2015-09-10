'use strict';

var router = require('express').Router(),
    responseFormatter = require('express-format-response'),
    template = require('../../config/responseTemplate'),
    handleFacebookAuth = require('./localAdaptor');

router.post('/', handleFacebookAuth, responseFormatter(template));

module.exports = router;
