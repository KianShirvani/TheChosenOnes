const axios = require('axios');
const { Client } = require('pg');

// Set up the database connection
const client = new Client({
  connectionString: process.env.DATABASE_URL || "postgres://postgres:password@db:5432/mydatabase",
  ssl: false
});

// Connect to the database if not in testing environment
if (process.env.NODE_ENV !== 'test') {
  client.connect();
}

const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";

const insertData = async () => {
  console.log('Inserting data...');

  console.log("API URL:", apiUrl);

     // Sign up a user (admin)
    await axios.post(`${apiUrl}/register`, {
        firstName: "Arnold",
        lastName: "Arnold",
        email: "arnold@example.com",
        phoneNum: "250-500-5000",
        country: "Canada",
        displayName: "arnold",
        password: "Password123",
        confirmPassword: "Password123"
    });

    const adminId = await client.query(`SELECT user_id FROM users WHERE email = $1`, ["arnold@example.com"]);

    // Promote Arnold to admin
    await client.query(`INSERT INTO admins (admin_id) VALUES ($1)`, [adminId.rows[0].user_id]);

    // Sign up a user (regular user)
    await axios.post(`${process.env.REACT_APP_API_URL}/register`, {
        firstName: "Bob",
        lastName: "Bob",
        email: "bob@example.com",
        phoneNum: "250-500-5001",
        country: "Canada",
        displayName: "bob",
        password: "Password123",
        confirmPassword: "Password123"
    });

  console.log('Data inserted successfully.');
  res.redirect('/');
};

const main = async () => {
  await insertData();
  Navigate();
};

main().catch(error => {
  console.error('Error inserting data:', error);
  process.exit(1);
});