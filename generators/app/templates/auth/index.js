'use strict';

var router = require('express').Router(),
    User = require('../api/users/userModel');

require('./local/passport').setup(User);

router.use('/local', require('./local'));
router.use('/facebook', require('./facebook'));

module.exports = router;
