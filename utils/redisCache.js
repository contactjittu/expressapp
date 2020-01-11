'use strict';

const redis = require('redis');
const config = require('../config/config');
const client = redis.createClient(config.REDIS_PORT, config.REDIS_HOST, { no_ready_check: true });

client.auth(config.REDIS_PASSWD, (err) => {
  if (err) throw err;
});
client.on('connect', () => {
  console.log('Connected to Redis');
});

const { promisify } = require('util');
const getAsync = promisify(client.get).bind(client);

exports.cache = function (req, res, next) {
  let key = '__expressapp__' + req.originalUrl || req.url
  client.get(key, function (err, cachedBody) {
    if (cachedBody) {
      return res.send(JSON.parse(cachedBody));
    }
    else {
      res.sendResponse = res.send;
      res.send = function (body) {
        client.setex(key, config.CACHE_DURATION, body.toString());
        res.sendResponse(body);
      }
      next();
    }
  })
}

exports.cachePromise = function (req, res, next) {
  let key = '__expressapp__' + req.originalUrl || req.url;
  getAsync(key)
    .then(cachedBody => {
      if (cachedBody) {
        return res.send(JSON.parse(cachedBody));
      }
      else {
        res.sendResponse = res.send;
        res.send = function (body) {
          client.setex(key, config.CACHE_DURATION, body.toString());
          res.sendResponse(body);
        }
        next();
      }
    })
    .catch(err => {
      next(err);
    })
}