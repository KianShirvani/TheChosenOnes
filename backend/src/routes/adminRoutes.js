const express = require('express');
const { promoteToAdmin } = require('../controllers/adminController');
const { validateAdmin } = require('../middlewares/validateAdmin');

const router = express.Router();

// Promote user to admin route with validation middleware
router.post('/promote', validateAdmin, promoteToAdmin);

module.exports = router;