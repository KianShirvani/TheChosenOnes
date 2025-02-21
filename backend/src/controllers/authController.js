// login logic

// the dependencies
const bcrypt = require("bcryptjs");
const crypto = require('crypto');
const jsonWebToken = require("jsonwebtoken");
const nodemailer = require('nodemailer');
const { Client } = require("pg");

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

// Set up Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'ProtonMail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

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

const requestPasswordReset = async (req, res) => {
  const { email } = req.body;

  try {
    const userQuery = await client.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userQuery.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userQuery.rows[0];
    const token = crypto.randomBytes(32).toString('hex');
    const expiration = Date.now() + 3600000; // 1 hour

    await client.query(
      'INSERT INTO password_resets (user_id, token, expiry_time) VALUES ($1, $2, $3) ON CONFLICT (user_id) DO UPDATE SET token = $2, expiry_time = $3',
      [user.user_id, token, expiration]
    );

    // Email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset',
      text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
      Please click on the following link, or paste this into your browser to complete the process:\n\n
      http://${req.headers.host}/reset/${token}\n\n
      If you did not request this, please ignore this email and your password will remain unchanged.\n`
    };

    // Send email
    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'Password reset email sent' });
  } catch (error) {
    console.error('Error in requestPasswordReset:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const userQuery = await client.query(
      'SELECT * FROM password_resets WHERE token = $1 AND expiry_time > $2',
      [token, Date.now()]
    );

    if (userQuery.rows.length === 0) {
      return res.status(400).json({ error: 'Password reset token is invalid or has expired' });
    }

    const user = userQuery.rows[0];
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await client.query('UPDATE users SET password = $1 WHERE user_id = $2', [hashedPassword, user.user_id]);
    await client.query('DELETE FROM password_resets WHERE user_id = $1', [user.user_id]);

    res.status(200).json({ message: 'Password has been reset' });
  } catch (error) {
    console.error('Error in resetPassword:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// export for use in other parts of the application
module.exports = { loginUser, requestPasswordReset, resetPassword };