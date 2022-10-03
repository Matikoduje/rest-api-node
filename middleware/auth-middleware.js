const jwt = require('jsonwebtoken');

const { jsonTokenSecret } = require('../configuration/env');

const isAuthenticated = (req, res, next) => {
  const authHeader = req.get('Authorization');
  if (!authHeader) {
    req.isAuth = false;
    return next();
  }
  const token = authHeader.split(' ')[1];
  let decodedToken;

  try {
    decodedToken = jwt.verify(token, jsonTokenSecret);
  } catch (err) {
    req.isAuth = false;
    return next();
  }

  if (!decodedToken) {
    req.isAuth = false;
    return next();
  }

  req.userId = decodedToken.userId;
  req.isAuth = true;
  return next();
};

module.exports = {
  isAuthenticated,
};
