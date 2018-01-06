'use strict';

const User = require('./usermodel').User;

module.exports.signup = (input, callback) => {
	input.role = 'user';
	let newuser = new User(input);
	newuser.save((err, data) => {
		return callback(err, data);
	});
}

module.exports.signin = (input, callback) => {
	User.findOne({ email: input.email.toLowerCase() }, '+password', (err, foundUser) => {
		return callback(err, foundUser);
	});
}

module.exports.editProfile = (input, callback) => {
	User.findByIdAndUpdate(input.userId, { $set: { 'firstName': input.firstName, 'lastName': input.lastName, 'profileImage': input.profileImage } }, { new: true }, (err, updated) => {
		return callback(err, updated);
	});
}

module.exports.searchUsers = (input, callback) => {
	User.find({ "$or": [{ "firstName": { "$regex": input, "$options": 'i' } }, { "lastName": { "$regex": input, "$options": 'i' } }] }).limit(50).exec((err, data) => {
		return callback(err, data)
	})
}

module.exports.getUserById = (input, callback) => {
	User.findById(input, (err, data) => {
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
			User.find({}, { "firstName": 1, "lastName": 1, "email": 1, "role": 1 }).skip(skip).limit(limit).exec((err, data) => {
				if (err) {
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

module.exports.deleteUserById = (input, callback) => {
	User.remove({ '_id': input }, (err, data) => {
		return callback(err, data);
	});
}