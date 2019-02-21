'use strict';

const express = require('express');
const router = express.Router({ caseSensitive: true });
const userbl = require('./userbl');
const Joi = require('joi');
const logger = require('../../utils/logger');

let checkSignupReq = (req, res, next) => {
	var signupSchema = Joi.object().keys({
		firstName: Joi.string().min(3).max(30),
		lastName: Joi.string().min(3).max(30),
		email: Joi.string().email().required(),
        password: Joi.string().required().regex(/^[a-zA-Z0-9]{3,30}$/),
        role: Joi.string().required().valid('admin', 'user')
	});

	Joi.validate(req.body, signupSchema, function (err, value) {
		if (err) {
			logger.error(err);
			return res.status(400).send({ success: false, message: 'Bad Request', error: err.details })
		}
		next();
	});
}

let checkSigninReq = (req, res, next) => {
	var loginSchema = Joi.object().keys({
		email: Joi.string().email().required(),
		password: Joi.string().regex(/^[a-zA-Z0-9]{3,30}$/)
	});

	Joi.validate(req.body, loginSchema, function (err, value) {
		if (err) {
			logger.error(err.stack);
			return res.status(400).send({ message: 'Bad Request', error: err.details })
		}
		next();
	});
}

const cache = require('../../utils/cache');
// const redisCache = require('../../utils/redisCache');
const rateLimit = require('../throttle/throttleservice');
const authmiddleware = require('../middleware/authmiddleware');

router.post('/user/signup', checkSignupReq, userbl.signup);
router.post('/user/signin', checkSigninReq, userbl.signin);
router.put('/user', authmiddleware.ensureAuth, userbl.editProfile);
router.get('/users/search', userbl.searchUsers);
// router.get('/users/search', redisCache.cachePromise, userbl.searchUsers);
router.get('/user', rateLimit.limit, userbl.getUserById);
router.get('/user/:userId', rateLimit.limit, userbl.getUserById);

/* use memory-cache as a middleware with promise */
// router.get('/users', cache.cache(20), userbl.allUser);

/* use redis as a middleware with callback */
// router.get('/users', redisCache.cache, userbl.allUser);

/* use redis as a middleware with promise */
// router.get('/users', redisCache.cachePromise, userbl.allUser);
router.get('/users', userbl.allUser);

/* without cache middleware */
// router.get('/users', userbl.allUser);
router.delete('/user', userbl.deleteUserById);
router.delete('/user/:userId', authmiddleware.checkAdminAuth, userbl.deleteUserById);

module.exports = router;