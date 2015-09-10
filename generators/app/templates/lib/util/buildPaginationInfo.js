'use strict';

/**
 * Builds information to paginate the request
 * @param req {Object} Request Object
 * @param Model {Object} Model being queried, for which pagination is desired
 * @param searchCriteria {Object} Criteria for searching db
 * @returns {Promise} Returns a promise that when fulfilled will have the pagination info
 */
var config = require('../../config/environment'),
    Promise = require('promise'), // jshint ignore:line

    paginationInfo = function (req, Model, searchCriteria) {

        var page = Number(req.query.page) || 1,
            sort = req.query.sort,
            sortOrder = Number(req.query.sortOrder),
            limit = Number(req.query.limit) || config.defaultObjectsPerRequest,
            maxLimit = config.maxObjectsPerRequest;

        limit = limit > maxLimit ? maxLimit : limit;
        sort = (sort && sortOrder && sortOrder === -1) ? '-' + sort : sort;
        searchCriteria = searchCriteria || {};

        return new Promise(function (fullfill, reject) {
            Model.count(searchCriteria, function (err, count) {
                if (err) {
                    reject(err);
                }
                fullfill({
                    page: page,
                    sort: sort,
                    limit: limit,
                    numPages: Math.ceil(count / limit),
                    numElements: count
                });
            });
        });
    };

module.exports = paginationInfo;
