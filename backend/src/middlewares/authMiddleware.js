// Verify JSON Web Tokens

// the JSON Web Token dependency
const jsonWebToken = require("jsonwebtoken");

const authenticatedUser = (req, res, next) => {
    // grab the token in the request header
    const token = req.header("Authorization");
    // if there is no token, return a 401 status code & error message
    if (!token) {
        return res.status(401).json({error: "Access denied. No token provided"}) // HTTP/1.1 401 Unauthorized
    }

    // verify the token
    try {
        // see if the token matches what is in the .env file
        const decoded = jsonWebToken.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        console.error(error);
        res.status(400).json({error: "Invalid token"});
    }
};

// export for use elsewhere in the application
module.exports = {authenticatedUser};