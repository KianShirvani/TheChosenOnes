// login logic

// the dependencies
const bcrypt = require("bcryptjs");
const jsonWebToken = require("jsonwebtoken");
const {client} = require("pg");

// set up connection to the database
const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

client.connect();

const loginUser = async(request, response) => {
    const {email, password} = request.body;

    try {
        // compare the email provided with the database
        const sqlQuery = await sql`SELECT * FROM users WHERE email = ${email}`;
        if (sqlQuery.length === 0) {
            return response.status(400).json({error: "Invalid Credentials"}); // HTTP/1.1 400 Bad Request
        }

        // check the password
        const user = sqlQuery[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return response.status.json({error: "Invalid Credentials"});
        }

        // generate a token for the user that will expire (security measure)
        const token = jsonWebToken.sign({userId: user.user_id}, process.env.jsonWebToken_SECRET, {expiresIn: "1hr"});
        response.json({token});
    } catch (error) {
        console.error(error);
        response.status(500).json({error: "Internal Server Error"}); // HTTP/1.1 500 Internal Server Error
    }
}

// export for use in other parts of the application
module.exports = {loginUser};