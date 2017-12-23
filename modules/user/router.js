'use strict';

const express = require('express');
const router = express.Router({ caseSensitive: true });
const userbl = require('./userbl');

const cache = require('../../utils/cache');
const rateLimit = require('../throttle/throttleservice');

router.post('/signup', userbl.signup);
router.post('/signin', userbl.signin);
router.put('/user', userbl.editProfile);
router.get('/searchUsers', userbl.searchUsers);
router.get('/user', rateLimit.limit, userbl.getUserById);
router.get('/user/:userId', rateLimit.limit, userbl.getUserById);
router.get('/users', cache.cache(20), userbl.allUser);
router.delete('/user', userbl.deleteUserById);
router.delete('/user/:userId', userbl.deleteUserById);

module.exports = router;