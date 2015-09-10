/**
 * User Model
 */

'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    crypto = require('crypto'),
    moment = require('moment'),

    UserSchema = new Schema({
        name: {type: String, required: true},
        email: {type: String, required: true, index: {unique: true, dropDups: true}},
        phone: {type: String},
        activeStatus: {type: Boolean, default: false},
        createdAt: {type: Date},
        updatedAt: {type: Date},
        role: {type: String, default: 'user'},
        facebookId: {type: String},
        /* jshint ignore:start */
        /* jscs:disable requireCamelCaseOrUpperCaseIdentifiers */
        activation_code: {type: String},
        password_reset_code: {type: String},
        password_reset_time: {type: Number},
        /* jshint ignore:end */
        /*jscs:enable requireCamelCaseOrUpperCaseIdentifiers*/
        hashedPassword: {type: String, required: true},
        salt: {type: String}
    });

// Virtuals:

UserSchema
    .virtual('password')
    .set(function (password) {
        this._password = password;
        this.salt = this.makeSalt();
        this.hashedPassword = this.encryptPassword(password);
    })
    .get(function () {
        return this._password;
    });

UserSchema
    .virtual('id')
    .get(function () {
        return this._id.toHexString();
    });

UserSchema.set('toObject', {
    virtuals: true
});


var validatePresenceOf = function (value) {
    return value && value.length;
};

UserSchema
    .pre('save', function (next) {

        if (!this.isNew) {
            this.updatedAt = moment();

            /* jshint ignore:start */
            /* jscs:disable requireCamelCaseOrUpperCaseIdentifiers*/
            if (this.activation_code === 'X') {
                this.activeStatus = true;
            }
            /* jshint ignore:end */
            /* jscs:enable requireCamelCaseOrUpperCaseIdentifiers*/

            return next();
        }

        if (!validatePresenceOf(this.hashedPassword)) {
            next(new Error('Invalid Password'));
        } else {
            this.createdAt = moment();
            this.updatedAt = this.createdAt;
            next();
        }

    });

UserSchema.methods = {
    authenticate: function (plainPass) {
        return this.encryptPassword(plainPass) === this.hashedPassword;
    },

    makeSalt: function () {
        return crypto.randomBytes(16).toString('base64');
    },

    encryptPassword: function (password) {
        if (!password || !this.salt) {
            return '';
        }

        var salt = new Buffer(this.salt, 'base64');

        return crypto.pbkdf2Sync(password, salt, 10000, 64).toString('base64');
    }
};

module.exports = mongoose.model('User', UserSchema);
