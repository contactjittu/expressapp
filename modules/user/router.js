'use strict';

const express = require('express');
const router = express.Router({ caseSensitive: true });
const userbl = require('./userbl');

const cache = require('../../utils/cache');
const rateLimit = require('../throttle/throttleservice');

router.post('/signup', userbl.signup);
router.post('/signin', userbl.signin);
router.put('/editProfile', userbl.editProfile);
router.get('/searchUsers', userbl.users);
router.get('/user', rateLimit.limit, userbl.user);
router.get('/allUser', cache.cache(20), userbl.allUser);

module.exports = router;