const express = require('express');

const postController = require('../controllers/post');

const router = express.Router();

const { isAuthenticated, isAuthorized } = require('../middleware/auth-middleware');

const {
  postValidationRules,
  postValidate,
} = require('../validators/post');

router.get('/posts', isAuthenticated, postController.getPosts);
router.get('/post/:postId', isAuthenticated, postController.getPost);
router.post('/post', isAuthenticated, postValidationRules(), postValidate, postController.addPost);
router.put('/post/:postId', isAuthenticated, isAuthorized, postValidationRules(), postValidate, postController.updatePost);
router.delete('/post/:postId', isAuthenticated, isAuthorized, postController.deletePost);

module.exports = router;
