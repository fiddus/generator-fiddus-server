/**
 * Activity Log Model
 * This module allows to save activity logs to various API entries.
 */

'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    moment = require('moment'),

    LogSchema = new Schema({
        timestamp: {type: Date},
        userId: {type: String, required: true},
        action: {type: String, required: true},
        target: {
            collection: {type: String},
            id: {type: String}
        }
    });

LogSchema.pre('save', function (next) {
    if (!this.timestamp) {
        this.timestamp = moment();
    }
    next();
});

module.exports = mongoose.model('Log', LogSchema);
