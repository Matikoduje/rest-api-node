const { body, checkSchema, validationResult } = require('express-validator');

const postValidationRules = () => [
  body('title', 'Title should have minimum 5 chars.')
    .trim()
    .isLength({ min: 5 })
    .escape(),
  body('content', 'Content should have minimum 5 chars.')
    .trim()
    .isLength({ min: 5, max: 400 })
    .escape(),
  checkSchema({
    image: {
      custom: {
        options: (value, { req }) => !!req.file.path,
        errorMessage: 'You should upload a JPG or PNG image.',
      },
    },
  }),
];

const postValidate = (req, res, next) => {
  const errors = validationResult(req);
  if (!!req.params.postId && !!req.body.image) {
    errors.errors = errors.errors.filter((el) => el.param !== 'image');
  }

  if (errors.isEmpty()) {
    return next();
  }
  const error = new Error('Validation failed, entered data is incorrect');
  error.statusCode = 422;
  return next(error);
};

module.exports = {
  postValidationRules,
  postValidate,
};
