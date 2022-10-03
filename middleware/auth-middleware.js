const jwt = require('jsonwebtoken');
const Post = require('../models/post');
const { jsonTokenSecret } = require('../configuration/env');

const isAuthenticated = (req, res, next) => {
  const authHeader = req.get('Authorization');
  if (!authHeader) {
    const error = new Error('Not authenticated.');
    error.statusCode = 401;
    throw error;
  }
  const token = authHeader.split(' ')[1];
  let decodedToken;

  try {
    decodedToken = jwt.verify(token, jsonTokenSecret);
  } catch (err) {
    err.statusCode = 500;
    throw err;
  }

  if (!decodedToken) {
    const error = new Error('Not authenticated.');
    error.statusCode = 401;
    throw error;
  }

  req.userId = decodedToken.userId;
  next();
};

const isAuthorized = async (req, res, next) => {
  const { userId } = req;
  const { postId } = req.params;

  if (!postId) {
    const error = new Error("Post doesn't exists.");
    error.statusCode = 404;
    throw error;
  }

  try {
    const post = await Post.findOne({ _id: postId, creator: userId });
    if (!post) {
      const error = new Error('Not authorized.');
      error.statusCode = 403;
      throw error;
    }
    next();
  } catch (err) {
    const error = err;
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

module.exports = {
  isAuthenticated,
  isAuthorized,
};
