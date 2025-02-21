const bcrypt = require('bcryptjs');
const { Client } = require('pg');

// Set up the database connection
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: false
});

// Connect to the database if not in testing environment
if (process.env.NODE_ENV !== 'test') {
  client.connect();
}

const registerUser = async (req, res) => {
  const { firstName, lastName, email, phoneNum, country, displayName, password } = req.body;

  try {
    // Check if the email is already in the database
    const emailCheckQuery = await client.query('SELECT * FROM users WHERE email = $1', [email]);
    if (emailCheckQuery.rows.length > 0) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    // Hash the password before storing it
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert the new user into the database
    const insertUserQuery = await client.query(
      'INSERT INTO users (first_name, last_name, email, phone_num, country, display_name, password) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [firstName, lastName, email, phoneNum, country, displayName, hashedPassword]
    );

    const newUser = insertUserQuery.rows[0];
    delete newUser.password;  // Don't send the password back

    // Respond with success
    return res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: newUser.user_id,
        firstName: newUser.first_name,
        lastName: newUser.last_name,
        email: newUser.email,
        phoneNum: newUser.phone_num,
        country: newUser.country,
        displayName: newUser.display_name
      }
    });
  } catch (error) {
    console.error('Error in registerUser:', error);
    return res.status(500).json({ 
      error: 'Internal Server Error',
      message: 'An unexpected error occurred while processing your request. Please try again later.'
     });
  }
};

module.exports = { registerUser };