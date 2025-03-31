// login logic

// the dependencies
const bcrypt = require("bcryptjs");
const crypto = require('crypto');
const jsonWebToken = require("jsonwebtoken");
const formData = require('form-data');
const Mailgun = require('mailgun.js');
const client = require('../database/db');

// Set up Mailgun
const mailgun = new Mailgun(formData);
const mg = mailgun.client({username: 'api', key: process.env.MAILGUN_API_KEY || 'key-yourkeyhere'});

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  console.log("Received request body:", req.body);

  try {
    if (!email || !password) {
      console.log("Missing fields:", { email, password });
      return res.status(400).json({ error: "missing words" });
    }

    console.log("Querying user with email:", email);
    const sqlQuery = await client.query("SELECT * FROM users WHERE email = $1", [email]);
    console.log("User query result:", sqlQuery.rows);
    if (!sqlQuery.rows || sqlQuery.rows.length === 0) {
      console.log("User not found for email:", email);
      return res.status(400).json({ error: "Invalid Credentials" });
    }

    const user = sqlQuery.rows[0];
    console.log("Comparing passwords...");
    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Password match result:", isMatch);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid Credentials" });
    }

    let role = "user";
    try {
      console.log("Checking admin status for user_id:", user.user_id);
      const isAdmin = await client.query("SELECT * FROM admins WHERE admin_id = $1", [user.user_id]);
      console.log("Admin check result:", isAdmin.rows);
      if (isAdmin.rows.length > 0) {
        role = "admin";
      }
    } catch (adminError) {
      console.warn("Admin check failed, defaulting to user role:", adminError.message);
    }

    console.log("Generating JWT token with role:", role);
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not defined in environment variables");
      return res.status(500).json({ error: "Internal Server Error", details: "JWT_SECRET not configured" });
    }

    const token = jsonWebToken.sign(
      { user_id: user.user_id, role: role, username: user.display_name },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    console.log("Token generated:", token);

    return res.status(200).json({ token, role });
  } catch (error) {
    console.error("Error in loginUser:", error.stack);
    return res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
};

const requestPasswordReset = async (req, res) => {
  if (!process.env.MAILGUN_API_KEY) {
    console.error('Missing Mailgun configuration in environment variables');
    return res.status(500).json({ error: 'Internal server error: Mailgun not configured' });
  }
  
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
    const data = {
      from: `noreply@${process.env.MAILGUN_DOMAIN}`,
      to: email,
      subject: 'Password Reset',
      text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
      Please click on the following link, or paste this into your browser to complete the process:\n\n
      http://${process.env.FRONTEND_URL}/reset-password/${token}\n\n
      If you did not request this, please ignore this email and your password will remain unchanged.\n`
    };

    // Send email
    await mg.messages.create(process.env.MAILGUN_DOMAIN, data)
      .then(body => {
        console.log(body);
        res.status(200).json({ message: 'Password reset email sent' });
      })
      .catch(error => {
        console.error('Error sending email:', error);
        res.status(500).json({ error: 'Error sending email' });
      });
  } catch (error) {
    console.error('Error in requestPasswordReset:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
};

const registerUser = async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    phoneNum,
    country,
    displayName,
    password,
    confirmPassword,
  } = req.body;

  try {
    // check if email already exists
    const existingUser = await client.query("SELECT * FROM users WHERE email = $1", [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: "Email already registered. Please log in." });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // insert new user
    const result = await client.query(
      "INSERT INTO users (first_name, last_name, email, phone_num, country, display_name, password) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
      [firstName, lastName, email, phoneNum, country, displayName, hashedPassword]
    );

    const newUser = result.rows[0];
    return res.status(201).json({ message: "User registered successfully", user: newUser });

  } catch (error) {
    console.error("Error registering user:", error);
    return res.status(500).json({ error: "Internal server error" });
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
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
};

// export for use in other parts of the application
module.exports = { loginUser, requestPasswordReset, resetPassword };