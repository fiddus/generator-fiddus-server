/**
 * Helper function to build pagination object.
 */

'use strict';

var urlBuilder = require('./fullUrlBuilder'),
    _ = require('lodash'),

    /**
     * Pagination Builder Function
     * Builds a pagination object to be injected in response, when using pagination
     * @param req Request Object
     * @param limit Number of Elements per page
     * @param numPages Number of Pages in response
     * @param additionalQueryParams Object containing additional parameters to be inserted in next and previous
     * urls
     * @returns {{current: number, next: (*|exports), previous: null, limit: *, last: *}}
     */
    paginationBuilder = function (req, limit, numPages, additionalQueryParams) {

        var page = Number(req.query.page) || 1,
            sort = req.query.sort,
            sortOrder = req.query.sortOrder,
            fields = req.query.fields,
            params = {
                sort: sort,
                sortOrder: sortOrder,
                fields: fields,
                limit: limit
            };

        _.merge(params, additionalQueryParams);

        _.forOwn(params, function (value, key) {
            if (!value) {
                delete params[key];
            }
        });

        return {
            current: page,
            next: page < numPages ? urlBuilder(req, _.merge(params, {page: page + 1})) : null,
            previous: page === 1 ? null : urlBuilder(req, _.merge(params, {page: page - 1})),
            limit: limit,
            last: numPages
        };
    };

module.exports = paginationBuilder;
