const { check, validationResult } = require('express-validator');

// Middleware to validate registration data
const validateRegistration = [
  // Validate that first_name is not empty
  check('firstName').notEmpty().withMessage('First name is required'),

  // Validate that last_name is not empty
  check('lastName').notEmpty().withMessage('Last name is required'),

  // Validate that email is in a proper email format
  check('email').isEmail().withMessage('Invalid email format'),

  // Validate that phone_num is not empty
  check('phoneNum').notEmpty().withMessage('Phone number is required'),

  // Validate that country is not empty
  check('country').notEmpty().withMessage('Country is required'),

  // Validate that display_name is not empty
  check('displayName').notEmpty().withMessage('Display name is required'),

  // Validate that password is at least 8 characters long
  check('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),

  // Check that password contains at least one number
  check('password').matches(/\d/).withMessage('Password must contain a number'),

  // Check that password contains at least one uppercase letter
  check('password').matches(/[A-Z]/).withMessage('Password must contain an uppercase letter'),

  // Custom validation: Ensure that password and confirmPassword match (optional)
  check('confirmPassword')
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Passwords do not match'),

  // Handle any validation errors and send a response
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() }); // Send the validation errors back to the client
    }
    next(); // Move on to the next middleware or controller
  }
];

module.exports = { validateRegistration };