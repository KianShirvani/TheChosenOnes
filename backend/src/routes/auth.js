// handle login requests & calling the authenticationController

// set up the dependencies
const express = require("express");
const { loginUser, requestPasswordReset, resetPassword } = require("../controllers/authController");
const { validateLogin } = require("../middlewares/validateLogin");

const router = express.Router();

// define a post route for /login
// validateLogin is executed first. If it passes, loginUser is called to handle the login process
router.post("/login", validateLogin, loginUser);
router.post('/request-password-reset', requestPasswordReset);
router.post('/reset-password', resetPassword);

// export the router to be used in other parts of the application
module.exports = router;