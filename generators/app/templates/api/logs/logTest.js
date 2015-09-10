/**
 * Activity Log Tests
 */
/* global describe, it, before, after */

'use strict';

var app = require('../../app'),
    User = require('../users/userModel'),
    Log = require('./logModel'),
    request = require('supertest'),
    expect = require('chai').expect,
    async = require('async'),
    moment = require('moment');

describe('Log Tests', function () {

    var adminToken;

    before(function (done) {
        var admin = {
            name: 'admin',
            email: 'admin@fiddus.com.br',
            password: 'password',
            role: 'admin'
        };

        User.create(admin, function () {
            request(app)
                .post('/auth/local')
                .send({email: admin.email, password: admin.password})
                .expect(function (res) {
                    adminToken = res.body.data.token;
                })
                .end(done);
        });
    });

    after(function (done) {
        User.remove({}, done);
    });

    describe('List all logs', function () {

        var logEntry1 = {
                userId: '2312rtqew534',
                action: 'Create',
                target: {
                    collection: 'User',
                    id: '2312rtqew534'
                },
                timestamp: moment('2013-02-08 09:30:26')
            },

            logEntry2 = {
                userId: '23rqwef54',
                action: 'Update',
                target: {
                    collection: 'User',
                    id: '23rqwef54'
                },
                timestamp: moment('2015-02-08 09:30:26')
            };

        before(function (done) {

            async.series([
                function cleanDb (next) {
                    Log.remove({}, next);
                },
                function addLogEntry1 (next) {
                    Log.create(logEntry1, next);
                },
                function addLogEntry2 () {
                    Log.create(logEntry2, done);
                }
            ]);
        });

        after(function (done) {
            // Clean Database
            Log.remove({}, done);
        });

        it('should show logs', function (done) {
            request(app)
                .get('/api/logs')
                .set('authorization', 'Bearer ' + adminToken)
                .expect(200)
                .expect(function (res) {
                    expect(res.body).to.exist;
                    expect(res.body.response).to.exist;
                    expect(res.body.data).to.exist;
                    expect(res.body.pagination).to.exist;
                    expect(res.body.data.length).to.equal(2);
                })
                .end(done);
        });

        it('should order logs by date', function (done) {
            request(app)
                .get('/api/logs?sort=timestamp')
                .set('authorization', 'Bearer ' + adminToken)
                .expect(200)
                .expect(function (res) {
                    expect(res.body.data[0].userId).to.equal(logEntry1.userId);
                    expect(res.body.data[1].action).to.equal(logEntry2.action);
                })
                .end(done);
        });

        it('should order logs by date in reverse order', function (done) {
            request(app)
                .get('/api/logs?sort=timestamp&sortOrder=-1')
                .set('authorization', 'Bearer ' + adminToken)
                .expect(200)
                .expect(function (res) {
                    expect(res.body.data[0].action).to.equal(logEntry2.action);
                    expect(res.body.data[1].userId).to.equal(logEntry1.userId);
                })
                .end(done);
        });

        it('should paginate logs', function (done) {
            request(app)
                .get('/api/logs?sort=timestamp&limit=1')
                .set('authorization', 'Bearer ' + adminToken)
                .expect(200)
                .expect(function (res) {
                    expect(res.body.data.length).to.equal(1);
                    expect(res.body.data[0].userId).to.equal(logEntry1.userId);
                    expect(res.body.pagination.next).to.exist;
                })
                .end(done);
        });
    });
});
