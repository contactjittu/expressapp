'use strict';

const chai = require('chai');
const expect = chai.expect;
const request = require('supertest');
const app = require('../../../server');
const userModel = require('../../../modules/user/usermodel');

let seedAdmin = {
	firstName: 'Jitendra',
	lastName: 'Kumar',
	email: 'contactjittu@gmail.com',
	password: '12345678',
	role: 'admin'
};

let seedUser = {
	firstName: 'John',
	lastName: 'Doe',
	email: 'john.doe@gmail.com',
	password: '12345678',
	role: 'user'
};

let userId = null;

before(done => {
	let adminUser = new userModel.User(seedAdmin);
	adminUser.save((err, data) => {
		if(err){
			return done(err);
		}
		done();
	});
});


describe('/Users API', () => {

	let token = null;
	let userData = null;
	before(done => {
		request(app)
			.post('/api/user/signin')
			.send({ 'email': seedAdmin.email, 'password': seedAdmin.password })
			.expect(200)
			.end((err, res) => {
				if (err) {
					return done(err);
				}
				token = res.body.data.token;
				done();
			})
	})

	// before(done => {
	// 	request(app)
	// 		.post('/api/user/signin')
	// 		.send({ 'email': seedUser.email, 'password': seedUser.password })
	// 		.expect(200)
	// 		.end((err, res) => {
	// 			if (err) {
	// 				return done(err);
	// 			}
	// 			userData = res.body.data;
	// 			done();
	// 		})
	// })

	it('should create user', (done) => {
		request(app)
			.post('/api/user/signup')
			.send(seedUser)
			.expect(200)
			.end((err, res) => {
				if (err) {
					return done(err);
				}
				expect(res.body.success).to.be.true;
				done();
			});
	});

	it('should login user and have their token', (done) => {
		request(app)
			.post('/api/user/signin')
			.send({ 'email': seedUser.email, 'password': seedUser.password })
			.expect(200)
			.end((err, res) => {
				if (err) {
					return done(err);
				}
				userData = res.body.data;
				expect(res.body.data.email).to.equal(seedUser.email);
				done();
			});
	});

	it('should update user details', (done) => {
		request(app)
			.put('/api/user')
			.set({ 'Authorization': `Bearer ${token}` })
			.send({ 'firstName': 'Jane' })
			.expect(200)
			.end((err, res) => {
				if (err) {
					return done(err);
				}
				expect(res.body.success).to.be.true;
				done();
			});
	});

	it('should search users', (done) => {
		request(app)
			.get('/api/users/search?text=j')
			.expect(200)
			.end((err, res) => {
				if (err) {
					return done(err);
				}
				expect(res.body.data).to.be.an('array')
				done();
			});
	});

	it('should get user data using userId', (done) => {
		request(app)
			.get('/api/users')
			.send({ 'userId': userId })
			.expect(200)
			.end((err, res) => {
				if (err) {
					return done(err);
				}
				expect(res.body.success).to.be.true;
				done();
			});
	});

	it('should have paginated user data', (done) => {
		request(app)
			.get('/api/users')
			.send({ 'itemsperpage': 5, 'page': 1 })
			.expect(200)
			.end((err, res) => {
				if (err) {
					return done(err);
				}
				expect(res.body.data.data).to.be.an('array')
				done();
			});
	});

	it('should delete user', (done) => {
		request(app)
			.delete(`/api/user/${userData.userId}`)
			.set({ 'Authorization': `Bearer ${token}` })
			.expect(200)
			.end((err, res) => {
				if (err) {
					return done(err);
				}
				expect(res.body.success).to.be.true;
				done();
			});
	});
	
});

after((done) => {
	userModel.User.remove({ 'email': seedAdmin.email }, err => {
		if(err){
			return done(err);
		}
		done();
	});
});