const User = require('../models/user');

exports.getStatus = async (req, res, next) => {
  const { userId } = req;
  try {
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error("User doesn't exists.");
      error.statusCode = 401;
      throw error;
    }
    res.status(200).json({ status: user.status });
  } catch (err) {
    const error = err;
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.updateStatus = async (req, res, next) => {
  const { userId } = req;

  try {
    const user = await User.findByIdAndUpdate(userId, {
      status: req.body.status,
    }, { new: true });
    if (!user) {
      const error = new Error("User doesn't exists.");
      error.statusCode = 401;
      throw error;
    }
    res.status(201).json({ status: user.status });
  } catch (err) {
    const error = err;
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};
