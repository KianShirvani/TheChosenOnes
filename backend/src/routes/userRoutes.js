const express = require('express');
const { registerUser } = require('../controllers/userController');
const { validateRegistration } = require('../middlewares/validateRegistration');
const router = express.Router();

// Register route with validation middleware
router.post('/register', validateRegistration, registerUser);

module.exports = router;