/**
 * Activity Logging Controller
 * Allows admin to list activity logs
 */

'use strict';

var moment = require('moment'),
    Log = require('./logModel'),
    async = require('async'),
    mask = require('json-mask'),
    logMask = 'timestamp,userId,action,target',
    paginationBuilder = require('../../lib/util/paginationBuilder'),
    paginationInfoBuilder = require('../../lib/util/buildPaginationInfo'),

    logController = {

        /**
         * Lists log entries
         * May filter by date (through query params startDate and endDate,
         * that must be convertible to moment objects. @see http://momentjs.com)
         * and by userId. If no filter parameter is specified, all data will be
         * returned.
         * @param req Request Object
         * @param res Response Object
         * @param next
         */
        list: function (req, res, next) {
            var startDate = req.query.startDate ? moment(req.query.startDate) : null,
                endDate = req.query.endDate ? moment(req.query.endDate) : null,
                userId = req.query.userId,
                paginationInfo,
                searchCriteria = {};

            async.series([

                // Build query parameters
                function (cb) {
                    if (startDate && startDate.isValid()) {
                        searchCriteria.timestamp = {$gt: startDate};
                    }

                    if (endDate && endDate.isValid()) {
                        if (searchCriteria.timestamp) {
                            searchCriteria.timestamp.$lt = endDate;
                        } else {
                            searchCriteria.timestamp = {$lt: endDate};
                        }
                    }

                    if (userId) {
                        searchCriteria.userId = userId;
                    }

                    cb(null);
                },
                // Build pagination info
                function (cb) {
                    paginationInfoBuilder(req, Log, searchCriteria).done(function (info) {
                        paginationInfo = info;
                        cb(null);
                    }, function (err) {
                        cb(err);
                    });
                },
                function (callback) {
                    Log.find(searchCriteria)
                        .limit(paginationInfo.limit)
                        .skip((paginationInfo.page - 1) * paginationInfo.limit)
                        .sort(paginationInfo.sort)
                        .exec(function (err, logs) {
                            // Apply mask to all logs found, asynchronously
                            async.mapSeries(logs, function (log, cb) {
                                cb(null, mask(log, logMask));
                            }, function (err, results) {
                                if (err) {
                                    callback(err);
                                }

                                res.fiddus.info = 'Logs list';
                                res.fiddus.data = results;
                                res.fiddus.pagination = paginationBuilder(req, paginationInfo.limit,
                                    paginationInfo.numPages);
                                return next();
                            });
                        });
                }
            ], function (err) {
                res.statusCode = 500;
                res.fiddus.info = 'Some error occurred';
                res.fiddus.data = err;
                return next();
            });
        }
    };

module.exports = logController;
