// Verify JSON Web Tokens

// the JSON Web Token dependency
const jsonWebToken = require("jsonwebtoken");

const authenticatedUser = (req, res, next) => {
    // Extract token from "Authorization" header
    const token = req.header("Authorization")?.replace("Bearer ", "");  
    console.log("Received Token:", token); 

    if (!token) {
        return res.status(401).json({ error: "Access denied. No token provided" });
    }

    try {
        const decoded = jsonWebToken.verify(token, process.env.JWT_SECRET);
        console.log("Decoded User:", decoded); 
        req.user = decoded;
        next();
    } catch (error) {
        console.error("Token verification failed:", error);
        res.status(400).json({ error: "Invalid token" });
    }
};



// export for use elsewhere in the application
module.exports = {authenticatedUser};