const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { jsonTokenSecret } = require('../configuration/env');

exports.signup = async (req, res, next) => {
  const { email, name, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 12);
    const userData = new User({
      email,
      name,
      password: hashedPassword,
    });
    const user = await userData.save();
    res.status(201).json({ message: 'User created!', userId: user._id });
  } catch (err) {
    const error = err;
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      const error = new Error("User doesn't exists.");
      error.statusCode = 401;
      throw error;
    }
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      const error = new Error("User doesn't exists.");
      error.statusCode = 401;
      throw error;
    }
    const token = jwt.sign({
      email: user.email,
      userId: user._id.toString(),
    }, jsonTokenSecret, { expiresIn: '1h' });
    res.status(200).json({ token, userId: user._id.toString() });
  } catch (err) {
    const error = err;
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};
