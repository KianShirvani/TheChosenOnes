const bcrypt = require('bcryptjs');
const { Client } = require('pg');

// Set up the database connection
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Connect to the database if not in testing environment
if (process.env.NODE_ENV !== 'test') {
  client.connect();
}

const registerUser = async (req, res) => {
  const { first_name, last_name, email, phone_num, country, display_name, password } = req.body;

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
      [first_name, last_name, email, phone_num, country, display_name, hashedPassword]
    );

    const newUser = insertUserQuery.rows[0];
    delete newUser.password;  // Don't send the password back

    // Respond with success
    return res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: newUser.user_id,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        email: newUser.email,
        phone_num: newUser.phone_num,
        country: newUser.country,
        display_name: newUser.display_name,
        created_at: newUser.created_at
      }
    });
  } catch (error) {
    console.error('Error in registerUser:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = { registerUser };