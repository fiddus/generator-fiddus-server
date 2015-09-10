/**
 * User Controller
 */

'use strict';

var User = require('./userModel'),
    Log = require('../logs/logModel'),
    config = require('../../config/environment'),
    _ = require('lodash'),
    async = require('async'),
    mask = require('json-mask'),
    userMask = 'id,name,email,phone,role,activeStatus,createdAt,updatedAt',
    auth = require('../../auth/authService'),
    paginationBuilder = require('../../lib/util/paginationBuilder'),
    paginationInfoBuilder = require('../../lib/util/buildPaginationInfo'),
    collection = 'users',

    handleError = function (err, res, next, status) {
        res.responseStatus = status || 500;
        res.fiddus.info = 'Some error occured';
        res.fiddus.data = err;
        return next();
    },

    userController = {

        create: function (req, res, next) {

            var user = req.body;

            if (!user.name) {
                res.responseStatus = 400;
                res.fiddus.info = 'No name was provided. Please repeat request providing a name for the new user';

                return next();
            }

            if (!user.password) {
                res.responseStatus = 400;
                res.fiddus.info =
                    'No password was provided. Please repeat request providing a password for the new user';

                return next();
            }

            user = new User(user);

            if (!user.role) {
                user.role = 'user';
            }

            user.save(function (err, user) {
                if (err) {
                    res.fiddus.info = err.code === 11000 ? 'This email already exists.' : 'Database error';
                    res.fiddus.data = err;
                    res.responseStatus = err.code === 11000 ? 400 : 500;
                    return next();
                }

                var token = auth.signToken(user);

                res.responseStatus = 201;
                res.fiddus.info = 'New user created';
                res.fiddus.data = mask(user, '_id,name,email,phone');
                res.fiddus.data.token = token;

                // Logging
                Log.create({
                    userId: user._id,
                    action: 'Created',
                    target: {
                        collection: collection,
                        id: user._id
                    }
                });

                // activator stuff
                req.user = user;
                next();
            });
        },

        read: function (req, res, next) {
            var userId = req.params.id,
                fields = req.query.fields;

            User.findOne({_id: userId}, function (err, user) {
                if (err) {
                    return handleError(err, res, next);
                }

                var userSent = mask(user, userMask);

                // Logging
                Log.create({
                    userId: req.user._id,
                    action: 'Read',
                    target: {
                        collection: collection,
                        id: user._id
                    }
                });

                res.fiddus.info = 'Got user ' + userId;
                res.fiddus.data = fields ? mask(userSent, fields) : userSent;
                next();
            });
        },

        me: function (req, res, next) {
            var userId = req.user._id,
                fields = req.query.fields;

            User.findOne({_id: userId}, function (err, user) {
                if (err) {
                    return handleError(err, res, next);
                }

                var userSent = mask(user, userMask);

                // Logging
                Log.create({
                    userId: req.user._id,
                    action: 'Read',
                    target: {
                        collection: collection,
                        id: user._id
                    }
                });

                res.fiddus.info = 'Got own profile';
                res.fiddus.data = fields ? mask(userSent, fields) : userSent;
                next();
            });
        },

        updateMe: function (req, res, next) {
            var updateObject = req.body,
                user = req.user;

            async.series([
                function (cb) {
                    if (updateObject && updateObject.email && updateObject.email !== user.name) {
                        res.responseStatus = 403;
                        res.fiddus.info = 'It is not allowed to change the user email';
                        return next();
                    }
                    cb(null);
                },
                function (cb) {
                    if (updateObject && updateObject.role && updateObject.role !== user.role) {
                        res.responseStatus = 403;
                        res.fiddus.info = 'User not allowed to change own role';
                        return next();
                    }
                    cb(null);
                },
                function (cb) {
                    if (updateObject && updateObject.activeStatus) {
                        res.responseStatus = 403;
                        res.fiddus.info = 'User not allowed to change own active status';
                        return next();
                    }
                    cb(null);
                },
                function (cb) {
                    // User can update only own name, password and phone
                    updateObject = mask(updateObject, 'name,password,phone');

                    User.findOne({_id: user.id}, function (err, user) {

                        _.forOwn(updateObject, function (value, key) {
                            user[key] = updateObject[key];
                        });

                        user.save(function (err) {
                            if (err) {
                                cb(err);
                            }

                            // Logging
                            Log.create({
                                userId: req.user._id,
                                action: 'Update',
                                target: {
                                    collection: collection,
                                    id: user._id
                                }
                            });

                            res.fiddus.info = 'User password updated';
                            res.fiddus.data = mask(user, userMask);
                            return next();
                        });
                    });

                }

            ], function (err) {
                return handleError(err, res, next);
            });
        },

        update: function (req, res, next) {
            var userToBeUpdatedId = req.params.id,
                updateObject = req.body;

            async.waterfall([
                function (cb) {
                    if (updateObject.email) {
                        res.fiddus.info = 'It is not allowed to change user email';
                        res.responseStatus = 403;
                        return next();
                    }

                    // Admin can change user's name, phone, password, role and activeStatus
                    updateObject = mask(updateObject, 'name,phone,password,role,activeStatus');
                    cb(null);
                },
                function (cb) {
                    if (updateObject.role) {

                        var validRole = config.userRoles.some(function (role) {
                            return updateObject.role === role;
                        });

                        if (validRole) {
                            return cb(null);
                        }
                        res.responseStatus = 403;
                        res.fiddus.info = 'User role not allowed';
                        return next();
                    }
                    cb(null);
                },
                function (cb) {
                    User.findOne({_id: userToBeUpdatedId}, function (err, user) {
                        if (err) {
                            cb(err);
                        }

                        cb(null, user);
                    });
                },
                function (user, cb) {
                    _.forOwn(updateObject, function (value, key) {
                        user[key] = updateObject[key];
                    });

                    user.save(function (err) {
                        if (err) {
                            cb(err);
                        }

                        // Logging
                        Log.create({
                            userId: req.user._id,
                            action: 'Update',
                            target: {
                                collection: collection,
                                id: user._id
                            }
                        });

                        res.fiddus.info = 'Updated user ' + user._id;
                        res.fiddus.data = mask(user, userMask);
                        return next();
                    });
                }
            ], function (err) {
                return handleError(err, res, next);
            });
        },

        delete: function (req, res, next) {
            var userToBeDeletedId = req.params.id;

            User.remove({_id: userToBeDeletedId}, function (err) {
                if (err) {
                    return handleError(err, res, next);
                }

                // Logging
                Log.create({
                    userId: req.user._id,
                    action: 'Delete',
                    target: {
                        collection: collection,
                        id: userToBeDeletedId
                    }
                });

                res.status(204).send();
            });
        },

        list: function (req, res, next) {
            var fields = req.query.fields,
                paginationInfo;

            async.series([
                function (cb) {
                    paginationInfoBuilder(req, User, {}).done(function (info) {
                        paginationInfo = info;
                        cb(null);
                    }, function (err) {
                        cb(err);
                    });
                },
                function (callback) {
                    User.find({})
                        .limit(paginationInfo.limit)
                        .skip((paginationInfo.page - 1) * paginationInfo.limit)
                        .sort(paginationInfo.sort)
                        .exec(function (err, users) {

                            // Apply mask to all users found, asynchronously
                            async.mapSeries(users, function (user, cb) {
                                var userSent = mask(user, userMask);
                                userSent = fields ? mask(userSent, fields) : userSent;
                                cb(null, userSent);
                            }, function (err, results) {
                                if (err) {
                                    callback(err);
                                }

                                // Logging
                                Log.create({
                                    userId: req.user._id,
                                    action: 'List',
                                    target: {
                                        collection: collection
                                    }
                                });

                                res.fiddus.info = 'Users list';
                                res.fiddus.data = results;
                                res.fiddus.pagination = paginationBuilder(req,
                                    paginationInfo.limit, paginationInfo.numPages);
                                return next();
                            });
                        });
                }],
                function (err) {
                    return handleError(err, res, next);
                });
        },

        activateUser: function (req, res, next) {

            if (req.activator.code === 200) {
                User.findOne({_id: req.params.user}, function (err, user) {
                    if (err) {
                        return handleError(err, res, next);
                    }

                    // Logging
                    Log.create({
                        userId: user._id,
                        action: 'Activate',
                        target: {
                            collection: collection,
                            id: user._id
                        }
                    });

                    res.fiddus.info = 'User activated';
                    res.fiddus.data = mask(user, userMask);
                    return next();
                });
            } else {
                return handleError(req.activator, res, next, req.activator.code);
            }
        },

        passwordResetRequest: function (req, res, next) {
            var email = req.body.email;
            User.findOne({email: email}, function (err, user) {
                if (err) {
                    return res.status(400).send({ok: false, msg: err});
                }

                if (!user) {
                    return res.status(400).send({ok: false, msg: 'user not found'});
                }

                // Activator stuff
                req.params.user = user._id.toString();

                next();
            });
        },

        passwordResetRequestResponse: function (req, res, next) {
            if (req.activator.code === 201) {
                User.findOne({_id: req.params.user}, function (err, user) {
                    if (err) {
                        res.responseStatus = 500;
                        res.fiddus.info = 'Some error occurred';
                        res.fiddus.data = err;
                        return next();
                    }

                    // Logging
                    Log.create({
                        userId: user._id,
                        action: 'Password reset request',
                        target: {
                            collection: collection,
                            id: user._id
                        }
                    });

                    res.fiddus.info = 'Password reset required successfully';
                    res.responseStatus = 201;
                    res.fiddus.data = mask(user, userMask);
                    return next();
                });
            } else {
                res.fiddus.info = 'An error occured while trying to request a passord reset. Please try again.';
                next();
            }
        },

        newPasswordPage: function (req, res) {
            res.render('emailRecovery', {
                userId: req.params.user,
                passwordResetCode: req.query.code
            });
        },

        passwordResetFulfill: function (req, res, next) {
            if (req.activator.code === 200) {
                User.findOne({_id: req.params.user}, function (err, user) {
                    if (err) {
                        res.responseStatus = 500;
                        res.fiddus.info = 'Some error occurred';
                        res.fiddus.data = err;
                        return next();
                    }

                    // Logging
                    Log.create({
                        userId: user._id,
                        action: 'Password reset fulfill',
                        target: {
                            collection: collection,
                            id: user._id
                        }
                    });

                    res.fiddus.info = 'Password reset completed successfully';
                    res.fiddus.data = mask(user, userMask);
                    return next();
                });
            } else {
                res.fiddus.info = 'An error occured while trying to fulfill password reset. Please try again';
                next();
            }
        }
    };

module.exports = userController;
