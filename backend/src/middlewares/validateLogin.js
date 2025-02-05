// Validate input from user

// the express-validator dependency for data validation
const {body, validationResult} = require("express-validator");

const validateLogin = [
    // ensure there is a properly formatted email
    body("email").isEmail().withMessage("Invalid email"),
    // ensure a password is typed
    body("password").notEmpty().withMessage("Password is required"),
    (req, res, next) => {
        const error = validationResult(req);
        if(!error.isEmpty()) {
            return res.status(400).json({error: error.array() }); // HTTP/1.1 400 Bad Request
        }
        next();
    },
];

// export for use elsewhere in the application
module.exports = {validateLogin};