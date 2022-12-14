/* eslint-env mocha */
/* eslint func-names: off */
/* eslint prefer-arrow-callback: off */
const { expect } = require('chai');
const sinon = require('sinon');
const mongoose = require('mongoose');
const User = require('../models/user');
const AuthController = require('../controllers/auth');
const statusController = require('../controllers/status');
const { testMongoDBConnection } = require('../configuration/env');

describe('Auth Controller', function () {
  before(function (done) {
    mongoose
      .connect(
        testMongoDBConnection,
      )
      .then((result) => {
        const user = new User({
          email: 'test@test.com',
          password: 'tester',
          name: 'Test',
          posts: [],
          _id: '5c0f66b979af55031b34728a',
        });
        return user.save();
      })
      .then(() => {
        done();
      });
  });

  beforeEach(function () {});

  afterEach(function () {});

  it('should throw an error with code 500 if accessing the database fails', function (done) {
    sinon.stub(User, 'findOne');
    User.findOne.throws();

    const req = {
      body: {
        email: 'test@test.com',
        password: 'tester',
      },
    };

    AuthController.login(req, {}, () => {}).then((result) => {
      expect(result).to.be.an('error');
      expect(result).to.have.property('statusCode', 500);
      done();
    });

    User.findOne.restore();
  });

  it('should send a response with a valid user status for an existing user', function (done) {
    const req = { userId: '5c0f66b979af55031b34728a' };
    const res = {
      statusCode: 500,
      userStatus: null,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(data) {
        this.userStatus = data.status;
      },
    };
    statusController.getStatus(req, res, () => {}).then(() => {
      expect(res.statusCode).to.be.equal(200);
      expect(res.userStatus).to.be.equal('I am new!');
      done();
    });
  });

  after(function (done) {
    User.deleteMany({})
      .then(() => mongoose.disconnect())
      .then(() => {
        done();
      });
  });
});
