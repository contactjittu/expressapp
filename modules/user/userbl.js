'use strict';

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const config = require('../../config/config');
const middleware = require('../middleware/authmiddleware');
const logger = require('../../utils/logger');
const userdb = require('./userdb');

const secret = config.SECRET;

let createToken = (user) => {
	let payload = {
		sub: user.userId,
		iat: Math.floor(Date.now() / 1000) - 30,
		exp: Math.floor(Date.now() / 1000) + 86400000
	};
	return jwt.sign(payload, secret);
}

module.exports.signup = (req, res) => {
	userdb.signup(req.body, (err, data) => {
		if (err) {
			logger.error(err.stack);
			if (err.code === 11000) {
				let field = err.message.match(/dup key: { : "(.+)" }/)[1];
				return res.status(200).send({ success: false, msg: `An account with an email '${field}' already exists.`, data: {} });
			}
			if (err.name === 'ValidationError') {
				return res.status(200).send({ success: false, msg: `Validation Failed`, data: err });
			}
			return res.status(500).send({ success: false, msg: 'Internal Server Error', data: err })
		}
		return res.status(200).send({ success: true, msg: 'Signup successfully', data: {} })
	});
}

module.exports.signin = (req, res) => {
	userdb.signin(req.body, (err, foundUser) => {
		if (err) {
			logger.error(err.stack);
			return res.status(500).send({ success: false, msg: 'Internal Server Error', data: err })
		}
		else {
			if (foundUser) {
				foundUser.comparePassword(req.body.password, function (err, isMatch) {
					if (!isMatch) {
						return res.status(200).send({ success: false, msg: 'Wrong email and password', data: {} })
					}
					else {
						foundUser = foundUser.toObject();
						foundUser.token = createToken(foundUser);
						return res.status(200).send({ success: true, msg: 'Login successfull', data: foundUser });
					}
				})
			}
			else {
				return res.status(200).send({ success: false, msg: 'Wrong email and password', data: {} })
			}
		}
	});
}

module.exports.editProfile = (req, res) => {
	middleware.ensureAuth(req, res, function (payload) {
		req.body.userId = payload.sub;
		userdb.editProfile(req.body, (err, data) => {
			if (err) {
				logger.error(err.stack);
				return res.status(500).send({ success: false, msg: 'Internal Server Error', data: err });
			}
			else {
				return res.status(200).send({ success: true, msg: 'User data updated', data: data });
			}
		});
	});
}

module.exports.searchUsers = (req, res) => {
	let username = req.query.text;
	if (!username) {
		return res.status(400).send({ success: false, msg: 'Bad Request', data: {} });
	}
	let regexStr = username.split(/ /).join("|");

	userdb.searchUsers(regexStr, (err, data) => {
		if (err) {
			logger.error(err.stack);
			return res.status(500).send({ success: false, msg: 'Internal Server Error', data: err })
		}
		else {
			return res.status(200).send({ success: true, msg: 'Found Users', data: data });
		}
	});
}

module.exports.getUserById = (req, res) => {
	let userId = req.query.userId || req.params.userId;
	userdb.getUserById(userId, (err, data) => {
		if (err) {
			logger.error(err.stack);
			return res.status(500).send({ success: false, msg: 'Internal Server Error', data: err })
		}
		else {
			return res.status(200).send({ success: true, msg: 'Found User', data: data });
		}
	});
}

module.exports.allUser = (req, res) => {
	userdb.allUser(req.query, (err, data) => {
		if (err) {
			logger.error(err.stack);
			return res.status(500).send({ success: false, msg: 'Internal Server Error', data: err })
		}
		else {
			return res.status(200).send({ success: true, msg: 'Found User', data: data });
		}
	});
}

module.exports.deleteUserById = (req, res) => {
	let userId = req.query.userId || req.params.userId;
	middleware.checkAdminAuth(req, res, function (payload) {
		userdb.deleteUserById(userId, (err, data) => {
			if (err) {
				logger.error(err.stack);
				return res.status(500).send({ success: false, msg: 'Internal Server Error', data: err })
			}
			else {
				return res.status(200).send({ success: true, msg: 'User deleted', data: {} });
			}
		});
	});
}