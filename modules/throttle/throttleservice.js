'use strict';

const mongoose = require('mongoose');
const os = require('os');
const interfaces = os.networkInterfaces();
const config = require('../../config/config');
const rateBuckets = require('./throttlemodel');

exports.limit = function (req, res, next) {

    let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    
    if (ip.substr(0, 7) == "::ffff:") {
        ip = ip.substr(7)
    }

    if (ip === '::1') {
        for (let k in interfaces) {
            for (let k2 in interfaces[k]) {
                let address = interfaces[k][k2];
                if (address.family === 'IPv4' && !address.internal) {
                    ip = address.address;
                }
            }
        }
    }
    rateBuckets
        .findOneAndUpdate({ ip: ip }, { $inc: { hits: 1 } }, { upsert: false })
        .exec(function (err, rateBucket) {
            if (err) {
                return res.status(500).send({ success: false, msg: err });
            }
            if (!rateBucket) {
                rateBucket = new rateBuckets({ createdAt: new Date(), ip: ip });
                rateBucket.save(function (err, rateBucket) {
                    if (err) {
                        return res.status(500).send({ success: false, msg: 'Internal Server Error', data: err });
                    }
                    if (!rateBucket) {
                        return res.status(500).send({ success: false, msg: "Can't create rate limit bucket", data: {} });
                    }
                    let timeUntilReset = config.rateLimits.ttl - (new Date().getTime() - rateBucket.createdAt.getTime());
                    res.set('X-Rate-Limit-Limit', config.rateLimits.maxHits);
                    res.set('X-Rate-Limit-Remaining', config.rateLimits.maxHits - 1);
                    res.set('X-Rate-Limit-Reset', timeUntilReset);
                    req.rateBucket = rateBucket;
                    return next();
                });
            }
            else {
                let timeUntilReset = config.rateLimits.ttl - (new Date().getTime() - rateBucket.createdAt.getTime());
                let remaining = Math.max(0, (config.rateLimits.maxHits - rateBucket.hits));
                res.set('X-Rate-Limit-Limit', config.rateLimits.maxHits);
                res.set('X-Rate-Limit-Remaining', remaining);
                res.set('X-Rate-Limit-Reset', timeUntilReset);
                req.rateBucket = rateBucket;
                if (rateBucket.hits < config.rateLimits.maxHits) {
                    return next();
                }
                else {
                    return res.status(429).send({ success: false, msg: 'Too Many Requests', data: {} });
                }
            }
        });
};