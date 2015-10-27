'use strict';

var router = require('express').Router();

router.use('/', function(req,res){
	res.end("Hello world! Everything is running..");
});

module.exports = router;