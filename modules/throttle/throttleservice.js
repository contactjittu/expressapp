'use strict';

const config = require('../../config/config');
const mongoose = require('mongoose');
const rateBuckets = require('./throttlemodel');

exports.limit = function (req, res, next) {

    let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;

    rateBuckets
        .findOneAndUpdate({ ip: ip }, { $inc: { hits: 1 } }, { upsert: false })
        .exec(function (error, rateBucket) {
            if (error) {
                return res.status(500).send({success: false, msg:error })
            }
            if (!rateBucket) {
                rateBucket = new rateBuckets({
                    createdAt: new Date(),
                    ip: ip
                });
                rateBucket.save(function (error, rateBucket) {
                    if (error) {
                        return res.status(500).send({success: false, msg:error })
                    }
                    if (!rateBucket) {
                        return res.status(500).send({ success: false, msg: "Can't create rate limit bucket" });
                    }
                    var timeUntilReset = config.rateLimits.ttl - (new Date().getTime() - rateBucket.createdAt.getTime());
                    res.set('X-Rate-Limit-Limit', config.rateLimits.maxHits);
                    res.set('X-Rate-Limit-Remaining', config.rateLimits.maxHits - 1);
                    res.set('X-Rate-Limit-Reset', timeUntilReset);
                    req.rateBucket = rateBucket;
                    return next();
                });
            } else {
                var timeUntilReset = config.rateLimits.ttl - (new Date().getTime() - rateBucket.createdAt.getTime());
                var remaining = Math.max(0, (config.rateLimits.maxHits - rateBucket.hits));
                res.set('X-Rate-Limit-Limit', config.rateLimits.maxHits);
                res.set('X-Rate-Limit-Remaining', remaining);
                res.set('X-Rate-Limit-Reset', timeUntilReset);
                req.rateBucket = rateBucket;
                if (rateBucket.hits < config.rateLimits.maxHits) {
                    return next();
                } else {
                    return res.status(429).send({ success: false, msg: 'Too Many Requests' });
                }
            }
        });
};