'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');

var userSchema = new Schema({
  firstName: { type: String, required: [true, 'firstName Required'] },
  lastName: { type: String, required: [true, 'lastName Required'] },
  email: {
    type: String,
    required: [true, 'Email Id Required'],
    unique: true,
    validate: { validator: (k) => { return /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(k); } },
    message: '{VALUE} is not valid email'
  },
  profileImage: { type: String },
  password: { type: String, select: false },
  role: { type: String, enum: ['admin', 'user'], required: true, default: 'user' }
}, {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
    versionKey: false
  });

userSchema.set('toJSON', {
  transform: function (doc, ret, options) {
    ret.userId = ret._id;
    delete ret.password;
    delete ret._id
    return ret;
  }
});

userSchema.set('toObject', {
  transform: function (doc, ret, options) {
    ret.userId = ret._id;
    delete ret.password;
    delete ret._id
    return ret;
  }
});

userSchema.virtual('fullName').get(function () {
  return this.firstName + ' ' + this.lastName;
});

userSchema.pre('save', function (next) {
  var user = this;
  if (!user.isModified('password')) {
    return next();
  }
  bcrypt.genSalt(10, function (err, salt) {
    bcrypt.hash(user.password, salt, function (err, hash) {
      user.password = hash;
      next();
    });
  });
});

userSchema.methods.comparePassword = function (password, done) {
  bcrypt.compare(password, this.password, function (err, isMatch) {
    done(err, isMatch);
  });
};

var User = mongoose.model('User', userSchema);

module.exports.User = User;