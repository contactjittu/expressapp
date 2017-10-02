'use strict';

const config = require('../../config/config');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var RateBuckets_schema = new Schema({
    createdAt: { type: Date, required: true, default: Date.now, expires: config.rateLimits.ttl },
    ip: { type: String, required: true, trim: true, match: /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/ },
    hits: { type: Number, default: 1, required: true, max: config.rateLimits.maxHits, min: 0 }
});

RateBuckets_schema.index({ createdAt: 1  }, { expireAfterSeconds: config.rateLimits.ttl });
var RateBuckets = mongoose.model('RateBuckets', RateBuckets_schema);

module.exports = RateBuckets; 