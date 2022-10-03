const express = require('express');

const statusController = require('../controllers/status');

const router = express.Router();

const { isAuthenticated } = require('../middleware/auth-middleware');
const {
  userStatusValidationRules,
  userValidate,
} = require('../validators/user');

router.get('/status', isAuthenticated, statusController.getStatus);
router.put('/status', isAuthenticated, userStatusValidationRules(), userValidate, statusController.updateStatus);

module.exports = router;
