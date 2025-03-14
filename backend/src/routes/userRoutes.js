const express = require('express');
const { registerUser, getUsers } = require('../controllers/userController');
const { validateRegistration } = require('../middlewares/validateRegistration');
const router = express.Router();



// Register route with validation middleware
router.post('/', validateRegistration, registerUser);

// NEW: Route to fetch all users
router.get('/', getUsers);

module.exports = router;