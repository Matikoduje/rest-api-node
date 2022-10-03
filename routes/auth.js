const express = require('express');

const authController = require('../controllers/auth');

const router = express.Router();

const {
  userLoginValidationRules,
  userCreateValidationRules,
  userValidate,
} = require('../validators/user');

router.put('/signup', userCreateValidationRules(), userValidate, authController.signup);
router.post('/login', userLoginValidationRules(), userValidate, authController.login);
module.exports = router;
