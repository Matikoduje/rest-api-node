const { body, validationResult } = require('express-validator');
const User = require('../models/user');

const userCreateValidationRules = () => [
  body('email', 'Please provide valid email address.')
    .trim()
    .notEmpty()
    .bail()
    .isEmail()
    .normalizeEmail()
    .bail()
    .custom((email) => User.findOne({ email }).then((user) => {
      if (user) {
        return Promise.reject(new Error('Email already in use.'));
      }
      return true;
    })),
  body('name', 'Name cannot be empty.').notEmpty().trim().escape(),
  body(
    'password',
    'Please provide password with more than 6 characters. Allowed only letter chars and numbers.',
  )
    .trim()
    .isAlphanumeric()
    .bail()
    .isLength({ min: 6 })
    .escape(),
];

const userLoginValidationRules = () => [
  body('email', 'Invalid email. Please log in with valid email address.')
    .trim()
    .notEmpty()
    .bail()
    .isEmail()
    .normalizeEmail(),
  body(
    'password',
    'Password must be 6 characters long. If you have forgotten your password, please click the reset link',
  )
    .trim()
    .isAlphanumeric()
    .bail()
    .isLength({ min: 6 })
    .escape(),
];

const userStatusValidationRules = () => [
  body('status', "Status shouldn't be empty")
    .trim()
    .notEmpty()
    .escape(),
];

const userValidate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }

  const error = new Error('Validation failed, entered data is incorrect');
  error.statusCode = 422;
  return next(error);
};

module.exports = {
  userCreateValidationRules,
  userLoginValidationRules,
  userStatusValidationRules,
  userValidate,
};
