const express = require('express');
const { registerUser, getUsers } = require('../controllers/userController');
const { validateRegistration } = require('../middlewares/validateRegistration');
const router = express.Router();
const { requestPasswordReset, resetPassword } = require('../controllers/authController');



// Register route with validation middleware
router.post('/', validateRegistration, registerUser);

// NEW: Route to fetch all users
router.get('/', getUsers);

router.post('/request-password-reset', requestPasswordReset);
router.post('/reset-password', resetPassword);

module.exports = router;