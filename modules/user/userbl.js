'use strict';

const express = require('express');
const router = express.Router();
const config = require('../../config/config');
const ensureAuth = require('../middleware/authmiddleware').ensureAuth;
const logger = require('../../utils/logger');
const userdb = require('./userdb');

const secret = config.SECRET;

let createToken = (user) => {
	let payload = {
		sub: user._id,
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
				return res.status(500).send({ success: false, msg: `An account with email '${field}' already exists.`, data: err });
			}
			return res.status(500).send({ success: false, msg: 'Internal Server Error', data: err })
		}
		return res.status(200).send({ success: true, msg: 'Signup successfully', data: {} })
	})	
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
						let sendData = {};
						sendData.token = createToken(foundUser);
						sendData.userId = foundUser._id;
						sendData.fistname = foundUser.fistname;
						sendData.lastname = foundUser.lastname;
						sendData.email = foundUser.email;
						sendData.profile_image = foundUser.profile_image;
						return res.status(200).send({ success: true, msg: 'Login successfull', data: sendData });
					}
				})
			}
			else {
				return res.status(200).send({ success: false, msg: 'Wrong email and password' })
			}
		}
	});
}

module.exports.editProfile = (req, res) => {
	ensureAuth(req, res, function (payload) {
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

module.exports.users = (req, res) => {
	let username = req.query.matchelement;
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
			return res.status(200).send({ success: true, msg: 'Search Users', data: result });
		}
	});
}

module.exports.user = (req, res) => {
	userdb.userById(req.query, (err, data) => {
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