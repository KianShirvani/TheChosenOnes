const express = require('express');
const { promoteToAdmin } = require('../controllers/adminController');
const { validateAdmin } = require('../middlewares/validateAdmin');
const { getAdminStats } = require('../controllers/adminController');

const router = express.Router();

// Promote user to admin route with validation middleware
router.post('/promote', validateAdmin, promoteToAdmin);
router.get('/stats', getAdminStats);

module.exports = router;