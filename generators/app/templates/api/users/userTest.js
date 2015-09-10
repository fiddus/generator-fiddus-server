/**
 * User API Controller Tests
 */
/* global describe, it, before, after, beforeEach, afterEach */

'use strict';

var app = require('../../app'),
    async = require('async'),
    request = require('supertest'),
    expect = require('chai').expect,
    User = require('./userModel'),
    _ = require('lodash');

describe('User API Controller Tests', function () {

    var user = {
            name: 'user',
            email: 'user@fiddus.com.br',
            password: 'password',
            role: 'user'
        },
        admin = {
            name: 'admin',
            email: 'admin@fiddus.com.br',
            password: 'password',
            role: 'admin'
        };

    describe('Create User Tests', function () {

        var token;

        before(function (done) {
            User.remove({}, function (err) {
                if (err) {
                    return done(err);
                }
                done();
            });
        });

        // Clear database once again, after tests
        after(function (done) {
            User.remove({}, function (err) {
                if (err) {
                    return done(err);
                }
                done();
            });
        });

        it('should create user without authentication', function (done) {
            request(app)
                .post('/api/users')
                .send({
                    name: 'João da Silva',
                    email: 'joao@silva.com',
                    password: 'abcde',
                    phone: '+554899993333'
                })
                .expect('Content-Type', /json/)
                .expect(201)
                .expect(function (res) {
                    expect(res.body.response).to.be.an('object');
                    expect(res.body.response.info).to.equal('New user created');
                    expect(res.body.response.code).to.equal(201);
                    expect(res.body.data).to.be.an('object');
                    expect(res.body.data.name).to.equal('João da Silva');
                    expect(res.body.data.email).to.equal('joao@silva.com');
                    expect(res.body.data.phone).to.equal('+554899993333');
                    expect(res.body.data.token).to.exist;
                })
                .end(done);
        });

        it('should not create user when no name was provided', function (done) {
            request(app)
                .post('/api/users')
                .set('authorization', 'Bearer ' + token)
                .send({
                    password: 'no name provided'
                })
                .expect('Content-Type', /json/)
                .expect(400)
                .expect(function (res) {
                    expect(res.body.response.info)
                        .to.equal('No name was provided. Please repeat request providing a name for the new user');
                })
                .end(done);
        });

        it('should not create user when no password was provided', function (done) {
            request(app)
                .post('/api/users')
                .set('authorization', 'Bearer ' + token)
                .send({
                    name: 'No password'
                })
                .expect('Content-Type', /json/)
                .expect(400)
                .expect(function (res) {
                    expect(res.body.response.info)
                        .to.equal('No password was provided. ' +
                        'Please repeat request providing a password for the new user');
                })
                .end(done);
        });
    });

    describe('Read User Tests', function () {
        var adminToken,
            userToken,
            userId,
            adminId;

        before(function (done) {
            async.series([
                function clearDb (cb) {
                    User.remove({}, function (err) {
                        if (err) {
                            return done(err);
                        }
                        cb();
                    });
                },
                function createAdminUser (cb) {
                    User.create(admin, function (err, user) {
                        adminId = user._id;
                        request(app)
                            .post('/auth/local')
                            .send({email: user.email, password: user.password})
                            .expect(function (res) {
                                adminToken = res.body.data.token;
                            })
                            .end(cb);
                    });
                },
                function createNormalUser () {
                    User.create(user, function (err, user) {
                        if (err) {
                            return done(err);
                        }
                        request(app)
                            .post('/auth/local')
                            .send({email: user.email, password: user.password})
                            .expect(function (res) {
                                userToken = res.body.data.token;
                            })
                            .end(function () {
                                userId = user._id;
                                done();
                            });
                    });
                }
            ]);
        });

        // Clear Database once again, after tests
        after(function (done) {
            User.remove({}, function (err) {
                if (err) {
                    return done(err);
                }
                done();
            });
        });

        it('should allow admin to read user profile', function (done) {
            request(app)
                .get('/api/users/' + userId)
                .set('authorization', 'Bearer ' + adminToken)
                .expect(200)
                .expect(function (res) {
                    expect(res.body.response).to.be.an('object');
                    expect(res.body.response.info).to.equal('Got user ' + userId);
                    expect(res.body.data).to.be.an('object');
                    expect(res.body.data.id).to.equal(userId.toString());
                    expect(res.body.data.name).to.equal(user.name);
                    expect(res.body.data.email).to.equal(user.email);
                    expect(res.body.data.activeStatus).to.equal(false);
                })
                .end(done);
        });

        it('should not allow user to read admin profile', function (done) {
            request(app)
                .get('/api/users/' + adminId)
                .set('authorization', 'Bearer ' + userToken)
                .expect(401)
                .expect(function (res) {
                    expect(res.body.ok).to.be.false;
                })
                .end(done);
        });

        it('should filter fields from user data, if fields property is set in query string', function (done) {
            request(app)
                .get('/api/users/' + userId + '?fields=name,email')
                .set('authorization', 'Bearer ' + adminToken)
                .expect(200)
                .expect(function (res) {
                    expect(res.body.data).to.deep.equal({name: user.name, email: user.email});
                })
                .end(done);
        });
    });

    describe('Read Own User Profile Tests', function () {

        var token,
            userId;

        before(function (done) {

            async.series([
                function clearDb (cb) {
                    User.remove({}, function (err) {
                        if (err) {
                            return done(err);
                        }
                        cb();
                    });
                },
                function createRegularUser () {
                    User.create(user, function (err, user) {
                        userId = user._id;
                        request(app)
                            .post('/auth/local')
                            .send({email: user.email, password: user.password})
                            .expect(function (res) {
                                token = res.body.data.token;
                            })
                            .end(done);
                    });
                }
            ]);
        });

        // Clear database once again, after tests
        after(function (done) {
            User.remove({}, function (err) {
                if (err) {
                    return done(err);
                }
                done();
            });
        });

        it('should show own user profile when requests /api/users/me', function (done) {
            request(app)
                .get('/api/users/me')
                .set('authorization', 'Bearer ' + token)
                .expect(200)
                .expect(function (res) {
                    expect(res.body.response.info).to.equal('Got own profile');
                    expect(res.body.data).to.be.an('object');
                    expect(res.body.data.id).to.equal(userId.toString());
                    expect(res.body.data.name).to.equal(user.name);
                    expect(res.body.data.email).to.equal(user.email);
                    expect(res.body.data.activeStatus).to.equal(false);
                })
                .end(done);
        });

        it('should not show an user profile if not authenticated', function (done) {
            request(app)
                .get('/api/users/me')
                .expect(401)
                .end(done);
        });

        it('should filter fields from response, if fields property is set in query string', function (done) {
            request(app)
                .get('/api/users/me?fields=name,email')
                .set('authorization', 'Bearer ' + token)
                .expect(200)
                .expect(function (res) {
                    expect(res.body.data).to.deep.equal({name: user.name, email: user.email});
                })
                .end(done);
        });
    });

    describe('Update Own User Profile Tests', function () {
        var token,
            userId;

        before(function (done) {

            async.series([
                function clearDb (next) {
                    User.remove({}, function (err) {
                        if (err) {
                            return done(err);
                        }
                        next();
                    });
                },
                function createRegularUser () {
                    User.create(user, function (err, user) {
                        userId = user._id;
                        request(app)
                            .post('/auth/local')
                            .send({email: user.email, password: user.password})
                            .expect(function (res) {
                                token = res.body.data.token;
                            })
                            .end(done);
                    });
                }
            ]);
        });

        // Clear database once again, after tests
        after(function (done) {
            User.remove({}, function (err) {
                if (err) {
                    return done(err);
                }
                done();
            });
        });

        it('should be able to update own user password', function (done) {
            request(app)
                .put('/api/users/me')
                .set('authorization', 'Bearer ' + token)
                .send({password: 'newPassword'})
                .expect(200)
                .expect(function (res) {
                    expect(res.body.response.info).to.equal('Updated own user');
                    expect(res.body.data.name).to.equal(user.name);
                    expect(res.body.data.email).to.equal(user.email);
                    expect(res.body.data.role).to.equal(user.role);
                    expect(res.body.data.activeStatus).to.exist();
                    expect(res.body.data.createdAt).to.exist();
                    expect(res.body.data.updatedAt).to.exist();
                })
                .end(function () {
                    request(app)
                        .post('/auth/local')
                        .send({email: user.email, password: 'newPassword'})
                        .expect(200)
                        .end(done);
                });
        });

        it('should not be able to update own user email', function (done) {
            request(app)
                .put('/api/users/me')
                .set('authorization', 'Bearer ' + token)
                .send({email: 'new@email.com'})
                .expect(403)
                .end(done);
        });

        it('should not be able to update own user role', function (done) {
            request(app)
                .put('/api/users/me')
                .set('authorization', 'Bearer ' + token)
                .send({role: 'admin'})
                .expect(403)
                .end(done);
        });

        it('should not be able to update own user activeStatus', function (done) {
            request(app)
                .put('/api/users/me')
                .set('authorization', 'Bearer ' + token)
                .send({activeStatus: true})
                .expect(403)
                .end(done);
        });

        it('should be able to update name and phone', function (done) {
            request(app)
                .put('/api/users/me')
                .set('authorization', 'Bearer ' + token)
                .send({name: 'new name', phone: '234565432'})
                .expect(200)
                .expect(function (res) {
                    expect(res.body.data.name).to.equal('new name');
                    expect(res.body.data.phone).to.equal('234565432');
                })
                .end(done);
        });
    });

    describe('Update User Tests', function () {
        var adminToken,
            userToken,
            userId,
            adminId;

        before(function (done) {

            async.series([
                function clearDb (next) {
                    User.remove({}, function (err) {
                        if (err) {
                            return done(err);
                        }
                        next();
                    });
                },
                function createAdminUser (next) {
                    User.create(admin, function (err, user) {
                        adminId = user._id;
                        request(app)
                            .post('/auth/local')
                            .send({email: user.email, password: user.password})
                            .expect(function (res) {
                                adminToken = res.body.data.token;
                            })
                            .end(next);
                    });
                },
                function createRegularUser () {
                    User.create(user, function (err, user) {
                        if (err) {
                            return done(err);
                        }
                        request(app)
                            .post('/auth/local')
                            .send({email: user.name, password: user.password})
                            .expect(function (res) {
                                userToken = res.body.data.token;
                            })
                            .end(function () {
                                userId = user._id;
                                done();
                            });
                    });
                }
            ]);
        });

        // Clear Database once again, after tests
        after(function (done) {
            User.remove({}, function (err) {
                if (err) {
                    return done(err);
                }
                done();
            });
        });

        it('should allow admin to update user password', function (done) {
            request(app)
                .put('/api/users/' + userId)
                .set('authorization', 'Bearer ' + adminToken)
                .send({password: 'newPassword'})
                .expect(200)
                .expect(function (res) {
                    expect(res.body.response).to.be.an('object');
                    expect(res.body.response.info).to.equal('Updated user ' + userId);
                    expect(res.body.data.id).to.equal(userId.toString());
                    expect(res.body.data.name).to.equal(user.name);
                    expect(res.body.data.email).to.equal(user.email);
                })
                .end(done);
        });

        it('should allow admin to update user role', function (done) {
            request(app)
                .put('/api/users/' + userId)
                .set('authorization', 'Bearer ' + adminToken)
                .send({role: 'admin'})
                .expect(200)
                .end(function () {
                    User.findOne({_id: userId}, function (err, user) {
                        expect(user.role).to.equal('admin');
                        done();
                    });
                });
        });

        it('should not allow admin to change user role to an inexistent role', function (done) {
            request(app)
                .put('/api/users/' + userId)
                .set('authorization', 'Bearer ' + adminToken)
                .send({role: 'non existent role'})
                .expect(403)
                .end(function () {
                    User.findOne({_id: userId}, function (err, user) {
                        expect(user.role).to.equal('admin');
                        done();
                    });
                });
        });

        it('should not allow admin to change user email', function (done) {
            request(app)
                .put('/api/users/' + userId)
                .set('authorization', 'Bearer ' + adminToken)
                .send({email: 'new@mail.com'})
                .expect(403)
                .end(done);
        });

        it('should be possible to admin to change user phone, name and activeStatus', function (done) {
            request(app)
                .put('/api/users/' + userId)
                .set('authorization', 'Bearer ' + adminToken)
                .send({
                    phone: '99991111',
                    name: 'new name',
                    activeStatus: true
                })
                .expect(200)
                .expect(function (res) {
                    expect(res.body.data.name).to.equal('new name');
                    expect(res.body.data.phone).to.equal('99991111');
                    expect(res.body.data.activeStatus).to.equal(true);
                })
                .end(done);
        });
    });

    describe('Delete User Tests', function () {
        var adminToken,
            userToken,
            userId,
            adminId;

        before(function (done) {

            async.series([
                function clearDb (next) {
                    User.remove({}, function (err) {
                        if (err) {
                            return done(err);
                        }
                        next();
                    });
                },
                function createAdminUser (next) {
                    User.create(admin, function (err, user) {
                        adminId = user._id;
                        request(app)
                            .post('/auth/local')
                            .send({email: user.email, password: user.password})
                            .expect(function (res) {
                                adminToken = res.body.data.token;
                            })
                            .end(next);
                    });
                },
                function createRegularUser () {
                    User.create(user, function (err, user) {
                        if (err) {
                            return done(err);
                        }
                        request(app)
                            .post('/auth/local')
                            .send({email: user.email, password: user.password})
                            .expect(function (res) {
                                userToken = res.body.data.token;
                            })
                            .end(function () {
                                userId = user._id;
                                done();
                            });
                    });
                }
            ]);
        });

        // Clear Database once again, after tests
        after(function (done) {
            User.remove({}, function (err) {
                if (err) {
                    return done(err);
                }
                done();
            });
        });

        it('should allow admin to delete user', function (done) {
            request(app)
                .delete('/api/users/' + userId)
                .set('authorization', 'Bearer ' + adminToken)
                .expect(204)
                .end(done);
        });

    });

    describe('List User Tests', function () {
        var adminToken,
            userToken,
            userId,
            adminId;

        before(function (done) {

            async.series([
                function clearDb (next) {
                    User.remove({}, function (err) {
                        if (err) {
                            return done(err);
                        }
                        next();
                    });
                },
                function createAdminUser (next) {
                    User.create(admin, function (err, user) {
                        adminId = user._id;
                        request(app)
                            .post('/auth/local')
                            .send({email: user.email, password: user.password})
                            .expect(function (res) {
                                adminToken = res.body.data.token;
                            })
                            .end(next);
                    });
                },
                function createRegularUser () {
                    User.create(user, function (err, user) {
                        if (err) {
                            return done(err);
                        }
                        request(app)
                            .post('/auth/local')
                            .send({email: user.email, password: user.password})
                            .expect(function (res) {
                                userToken = res.body.data.token;
                            })
                            .end(function () {
                                userId = user._id;
                                done();
                            });
                    });
                }
            ]);
        });

        // Clear Database once again, after tests
        after(function (done) {
            User.remove({}, function (err) {
                if (err) {
                    return done(err);
                }
                done();
            });
        });

        it('should allow admin to list users', function (done) {
            request(app)
                .get('/api/users')
                .set('authorization', 'Bearer ' + adminToken)
                .expect(200)
                .expect(function (res) {
                    var users = res.body.data;
                    expect(res.body.response.info).to.equal('Users list');
                    expect(users).to.be.an('array');
                    expect(users.length).to.equal(2);
                    expect(users.some(function (user) {
                        return user.name === admin.name;
                    })).to.equal(true);

                    expect(users.some(function (user) {
                        return user.name === user.name;
                    })).to.equal(true);
                })
                .end(done);
        });

        it('should filter data from response, if fields property is set in query string', function (done) {
            request(app)
                .get('/api/users?fields=name,email')
                .set('authorization', 'Bearer ' + adminToken)
                .expect(200)
                .expect(function (res) {
                    var users = res.body.data;
                    expect(users.some(function (usr) {
                        return _.isEqual(usr, {name: user.name, email: user.email});
                    })).to.equal(true);
                    expect(users.some(function (usr) {
                        return _.isEqual(usr, {name: admin.name, email: admin.email});
                    })).to.equal(true);
                })
                .end(done);
        });

        it('should sort data', function (done) {
            request(app)
                .get('/api/users?sort=name')
                .set('authorization', 'Bearer ' + adminToken)
                .expect(200)
                .expect(function (res) {
                    var users = res.body.data;
                    expect(users[0].name).to.equal(admin.name);
                    expect(users[1].name).to.equal(user.name);
                })
                .end(done);
        });

        it('should sort in reverse order', function (done) {
            request(app)
                .get('/api/users?sort=name&sortOrder=-1')
                .set('authorization', 'Bearer ' + adminToken)
                .expect(200)
                .expect(function (res) {
                    var users = res.body.data;
                    expect(users[0].name).to.equal(user.name);
                    expect(users[1].name).to.equal(admin.name);
                })
                .end(done);
        });

        it('should paginate response according to parameters', function (done) {
            var next;
            request(app)
                .get('/api/users?sort=name&limit=1')
                .set('authorization', 'Bearer ' + adminToken)
                .expect(200)
                .expect(function (res) {
                    var users = res.body.data,
                        pagination = res.body.pagination;

                    expect(users[0].name).to.equal(admin.name);
                    expect(pagination.current).to.equal(1);
                    expect(pagination.next).to.exist;
                    expect(pagination.previous).to.equal(null);
                    expect(pagination.limit).to.equal(1);
                    next = pagination.next.split(/\/+/g);
                    next.shift();
                    next.shift();
                    next = '/' + next.join('/');
                })
                .end(function () {
                    request(app)
                        .get(next)
                        .set('authorization', 'Bearer ' + adminToken)
                        .expect(200)
                        .expect(function (res) {
                            var users = res.body.data,
                                pagination = res.body.pagination;
                            expect(users[0].name).to.equal(user.name);
                            expect(pagination.current).to.equal(2);
                            expect(pagination.next).to.equal(null);
                            expect(pagination.previous).to.exist;
                            expect(pagination.limit).to.equal(1);
                        })
                        .end(done);
                });
        });
    });

    describe('Activate User Tests', function () {
        var userId,
            activationCode;

        before(function (done) {

            async.series([
                function clearDb (next) {
                    User.remove({}, function (err) {
                        if (err) {
                            return done(err);
                        }
                        next();
                    });
                },
                function getUserActivationCode () {
                    request(app)
                        .post('/api/users')
                        .send(user)
                        .expect(function (res) {
                            userId = res.body.data._id;
                        })
                        .end(function () {
                            User.findOne({_id: userId}, function (err, user) {
                                /* jshint camelcase: false */
                                if (err) {
                                    return done(err);
                                }
                                /* jscs:disable requireCamelCaseOrUpperCaseIdentifiers */
                                activationCode = user.activation_code; // jshint ignore:line
                                /* jscs:enable requireCamelCaseOrUpperCaseIdentifiers */
                                done();
                            });
                        });
                }
            ]);
        });

        // Clear database once again, after tests
        after(function (done) {
            User.remove({}, function (err) {
                if (err) {
                    return done(err);
                }
                done();
            });
        });

        it('should activate user', function (done) {
            request(app)
                .get('/api/users/activate/' + userId + '?code=' + activationCode)
                .expect(200)
                .expect(function (res) {
                    expect(res.body.response.info).to.equal('User activated');
                    expect(res.body.data).to.exist;
                })
                .end(function () {
                    User.findOne({_id: userId}, function (err, user) {
                        expect(user.activeStatus).to.equal(true);
                        done();
                    });
                });
        });

    });

    describe('Password Reset Tests', function () {
        var userId,
            passwordResetCode;

        beforeEach(function (done) {

            async.series([
                function clearDb (next) {
                    User.remove({}, function (err) {
                        if (err) {
                            return done(err);
                        }
                        next();
                    });
                },
                function createUser () {
                    User.create(user, function (err, user) {
                        userId = user._id;
                        done();
                    });
                }
            ]);
        });

        // Clear database once again, after tests
        afterEach(function (done) {
            User.remove({}, function (err) {
                if (err) {
                    return done(err);
                }
                done();
            });
        });

        it('should create a password reset request successfully', function (done) {
            request(app)
                .post('/api/users/passwordreset')
                .send({email: user.email})
                .expect(201)
                .expect(function (res) {
                    expect(res.body.response.info).to.equal('Password reset required successfully');
                    expect(res.body.data).to.exist;
                })
                .end(done);
        });

        it('should fulfill password reset successfully', function (done) {
            request(app)
                .post('/api/users/passwordreset')
                .send({email: user.email})
                .end(function () {
                    User.findOne({email: user.email}, function (err, user) {
                        /* jshint camelcase: false */
                        /* jscs:disable requireCamelCaseOrUpperCaseIdentifiers */
                        passwordResetCode = user.password_reset_code;
                        /* jscs:enable requireCamelCaseOrUpperCaseIdentifiers */
                        request(app)
                            .put('/api/users/passwordreset/' + userId + '?code=' + passwordResetCode)
                            .send({password: '321'})
                            .expect(200)
                            .expect(function (res) {
                                expect(res.body.response.info).to.equal('Password reset completed successfully');
                            })
                            .end(done);
                    });
                });
        });
    });
});
