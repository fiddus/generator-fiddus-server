/**
 * Authentication Service
 */

'use strict';

var config = require('../config/environment'),
    jwt = require('jsonwebtoken'),
    expressJwt = require('express-jwt'),
    compose = require('composable-middleware'),
    User = require('../api/users/userModel'),
    validateJwt = expressJwt({secret: config.secrets.session}),

    /**
     * Attaches user object to the request, if authenticated
     * Otherwise returns 403
     */
    isAuthenticated = function () {
        return compose()
            // Allow accessToken to be passed through query parameter as well
            .use(function (req, res, next) {
                if (req.query && req.query.hasOwnProperty('accessToken')) {
                    req.headers.authorization = 'Bearer ' + req.query.accessToken;
                }

                if (!req.headers.authorization) {
                    return res.status(401).json({ok: false, info: 'Unauthorized access'});
                }

                validateJwt(req, res, next);
            })
            // Attach user to request
            .use(function (req, res, next) {
                User.findById(req.user._id, function (err, user) {

                    if (err) {
                        return next(err);
                    }

                    if (!user) {
                        return res.status(401).json({ok: false, info: 'User not found'});
                    }

                    req.user = user;
                    next();
                });
            });
    },

    /**
     * Checks if user meets minimum requirements of the route
     * @param requiredRole Required role for the route
     */
    hasRole = function (requiredRole) {
        if (!requiredRole) {
            throw new Error('Required role needs to be set');
        }

        return compose()
            .use(isAuthenticated())
            .use(function meetsRequirements (req, res, next) {
                if (config.userRoles.indexOf(req.user.role) >= config.userRoles.indexOf(requiredRole)) {
                    next();
                } else {
                    res.status(401).json({ok: false, info: 'User doesn\'t have required role for this action.'});
                }
            });
    },

    /**
     * Method signToken
     * Creates a signed jwt
     * @param user The user who will receive the token
     * @returns signed jwt
     */
    signToken = function (user) {
        return jwt.sign(
            {_id: user.id, role: user.role, name: user.name},
            config.secrets.session,
            {expiresInMinutes: 60 * 5}
        );
    },

    /**
     * Method setTokenCookie
     * Sets a cookie on the response object with a token for user access
     * @param req The request object
     * @param res The response object
     */
    setTokenCookie = function (req, res) {
        if (!req.user) {
            return res.status(404).json({ok: false, info: 'Something went wrong, please try again.'});
        }

        var token = signToken(req.user);
        res.cookie('token', JSON.stringify(token));
        res.redirect('/');
    };

module.exports = {
    isAuthenticated: isAuthenticated,
    hasRole: hasRole,
    signToken: signToken,
    setTokenCookie: setTokenCookie
};
