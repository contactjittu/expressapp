'use strict';

const mongoose = require('mongoose');
const config = require('./config/config');

mongoose.Promise = global.Promise;
mongoose.connect(config.MONGO_URI);

const user = require('./modules/user/usermodel').User;

let createUser = new user({
	firstName: 'Jitendra',
	lastName: 'Kumar',
	email: 'contactjittu@gmail.com',
	profileImage: '',
	password: '123',
	role: 'admin'
});

createUser.save()
	.then(() => {
		console.log('Admin Created');
		process.exit(0)
	})
	.catch((err) => {
		console.log('Error while creating admin', err);
		process.exit(0)
	})