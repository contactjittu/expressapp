'use strict';

var chai = require('chai');
var expect = chai.expect;
var request = require('supertest');
var app = require('../../../server');

describe('/Users API', function() {
  // this.timeout(25000);
  it('it should have user data', function(done){
    request(app)
    .get('/api/users')
    .send({'itemsperpage':5,'page':1})
    .expect(200)
    .end(function(err, res) {
      if (err) {
        return done(err);
      }
      expect(res.body.data.data).to.be.an('array')
      done();
    });
  });
  it('it should have token', function(done){
    request(app)
    .post('/api/signin')
    .send({'email':'contactjittu@gmail.com','password':'123'})
    .expect(200)
    .end(function(err, res) {
      if (err) {
        return done(err);
      }
      expect(res.body.data.email).to.equal('contactjittu@gmail.com');
      done();
    });
  });
  after(function() {
    app.close();
    console.log("Our applicationa tests done!");
  });
});