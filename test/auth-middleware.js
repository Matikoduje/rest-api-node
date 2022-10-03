/* eslint-env mocha */
/* eslint func-names: off */
/* eslint prefer-arrow-callback: off */
const { expect } = require('chai');

const jwt = require('jsonwebtoken');
const sinon = require('sinon');
const { isAuthenticated } = require('../middleware/auth-middleware');

describe('Auth middleware', function () {
  it('should throw an error if no authorization header is present', function () {
    const req = {
      get(headerName) {
        return null;
      },
    };
    expect(isAuthenticated.bind(this, req, {}, () => {})).to.throw('Not authenticated.');
  });

  it('should throw an error if the authorization header is only one string', function () {
    const req = {
      get(headerName) {
        return 'xyz';
      },
    };
    expect(isAuthenticated.bind(this, req, {}, () => {})).to.throw();
  });

  it('should yield a userId after decoding the token', function () {
    const req = {
      get(headerName) {
        return 'Bearer djfkalsdjfaslfjdlas';
      },
    };
    sinon.stub(jwt, 'verify');
    jwt.verify.returns({ userId: 'abc' });
    isAuthenticated(req, {}, () => {});
    expect(req).to.have.property('userId');
    expect(req).to.have.property('userId', 'abc');
    expect(jwt.verify.called).to.be.true;
    jwt.verify.restore();
  });

  it('should throw an error if the token cannot be verified', function () {
    const req = {
      get(headerName) {
        return 'Bearer xyz';
      },
    };
    expect(isAuthenticated.bind(this, req, {}, () => {})).to.throw();
  });
});
