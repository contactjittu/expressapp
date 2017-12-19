'use strict';

const User = require('./usermodel').User;

module.exports.signup = (input, callback) => {
	let newuser = new User(req.body);
	newuser.save((err, data) => {
		return callback(err, data);
	});
}

module.exports.signin = (input, callback) => {
	User.findOne({ email: req.body.email.toLowerCase() }, (err, foundUser) => {
		return callback(err, foundUser);
	});
}

module.exports.editProfile = (input, callback) => {
	User.findByIdAndUpdate(input.userId, { $set: { 'firstname': input.firstname, 'lastname': input.lastname, 'profile_image': input.profile_image }}, { new: true }, (err, updated) => {
		return callback(err, updated);
	});
}

module.exports.searchUsers = (input, callback) => {
	let username = req.query.matchelement;
	if (!username) {
		return res.status(400).send({ success: false, msg: 'Bad Request' })
	}
	let regexStr = username.split(/ /).join("|");

	User.find({ "$or": [{ "firstname": { "$regex": regexStr, "$options": 'i' }},{ "lastname": { "$regex": regexStr, "$options": 'i' }}]}, { "firstname": 1, "lastname": 1, "email": 1 }).limit(50).exec((err, data) => {
		return callback(err, data)
	})
}

module.exports.userById = (input, callback) => {
	User.findById(input.userId, (err, data) => {
		return callback(err, data);
	});
}

module.exports.allUser = (input, callback) => {

	let itemsperpage = input.itemsperpage || 5;
	let page = input.page || 1;
	let skip = itemsperpage * (page - 1);
	let limit = parseInt(itemsperpage);
	
	User.find().count(function (err, totalCount) {
		if (err) {
			return callback(err);
		}
		else {
			User.find({}, { "firstname": 1, "lastname": 1, "email": 1 }).skip(skip).limit(limit).exec((err, data) => {
				if(err){
					return callback(err);
				}
				let total = {}
				total.count = totalCount;
				if (total.count % itemsperpage == 0) {
					total.pages = (total.count / itemsperpage);
				}
				else {
					total.pages = (parseInt(total.count / itemsperpage) + 1);
				}
				let sendData = {
					total: total,
					data: data
				}
				return callback(err, sendData);
			});
		}
	})
}