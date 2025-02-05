// login logic

// the dependencies
const bcrypt = require("bcryptjs");
const jsonWebToken = require("jsonwebtoken");
const {Client} = require("pg");

// set up connection to the database
const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

// to prevent connecting to the database during tests
if (process.env.NODE_ENV !== "test") {
    client.connect();
}


const loginUser = async(req, res) => {
    const {email, password} = req.body;

    try {
        // if no email or no password, the login attempt is invalid
        if (!email || !password) {
            return res.status(400).json({error: "Missing fields"});
        }
        // compare the email provided with the database
        const sqlQuery = await client.query("SELECT * FROM users WHERE email = $1", [email]);
        if (!sqlQuery.rows || sqlQuery.rows.length === 0) {
            return res.status(400).json({error: "Invalid Credentials"}); // HTTP/1.1 400 Bad Request
        }

        // check the password
        const user = sqlQuery.rows[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({error: "Invalid Credentials"});
        }

        // generate a token for the user that will expire (security measure)
        const token = jsonWebToken.sign({userId: user.user_id}, process.env.JWT_SECRET, {expiresIn: "1h"});

        return res.status(200).json({token});
    } catch (error) {
        console.error("error in loginUser:", error);
        return res.status(500).json({error: "Internal Server Error"}); // HTTP/1.1 500 Internal Server Error
    }
}

// export for use in other parts of the application
module.exports = {loginUser};