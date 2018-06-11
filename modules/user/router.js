'use strict';

const express = require('express');
const router = express.Router({ caseSensitive: true });
const userbl = require('./userbl');

const cache = require('../../utils/cache');
const redisCache = require('../../utils/redisCache');
const rateLimit = require('../throttle/throttleservice');
const authmiddleware = require('../middleware/authmiddleware');

router.post('/user/signup', userbl.signup);
router.post('/user/signin', userbl.signin);
router.put('/user', authmiddleware.ensureAuth, userbl.editProfile);
router.get('/users/search', redisCache.cachePromise, userbl.searchUsers);
router.get('/user', rateLimit.limit, userbl.getUserById);
router.get('/user/:userId', rateLimit.limit, userbl.getUserById);

/* use memory-cache as a middleware with promise */
// router.get('/users', cache.cache(20), userbl.allUser);

/* use redis as a middleware with callback */
// router.get('/users', redisCache.cache, userbl.allUser);

/* use redis as a middleware with promise */
router.get('/users', redisCache.cachePromise, userbl.allUser);

/* without cache middleware */
// router.get('/users', userbl.allUser);
router.delete('/user', userbl.deleteUserById);
router.delete('/user/:userId', authmiddleware.checkAdminAuth, userbl.deleteUserById);

module.exports = router;