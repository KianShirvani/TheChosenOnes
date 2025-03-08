const axios = require("axios");
const { Client } = require("pg");

const client = new Client({
  connectionString: process.env.DATABASE_URL || "postgres://postgres:password@db:5432/mydatabase",
  ssl: false,
});

if (process.env.NODE_ENV !== 'test') {
  client.connect();
}

const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";

const insertData = async () => {
  console.log('Inserting data...');
  console.log("API URL:", apiUrl);

  try {
    // Check if Arnold already exists
    let userExists = await client.query(`SELECT * FROM users WHERE email = $1`, ["arnold@example.com"]);
    if (userExists.rows.length > 0) {
      console.log("Data already exists. Skipping insert.");
    } else {
      // If user does not exist, insert mock data
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
      await client.query(`INSERT INTO admins (admin_id) VALUES ($1)`, [adminId.rows[0].user_id]);
    }

    // Check if Bob already exists
    userExists = await client.query(`SELECT * FROM users WHERE email = $1`, ["bob@example.com"]);
    if (userExists.rows.length > 0) {
      console.log("Data already exists. Skipping insert.");
    } else {
      await axios.post(`${apiUrl}/register`, {
        firstName: "Bob",
        lastName: "Bob",
        email: "bob@example.com",
        phoneNum: "250-500-5001",
        country: "Canada",
        displayName: "bob",
        password: "Password123",
        confirmPassword: "Password123"
      });
    }

    console.log('Data inserted successfully.');
    return { success: true };
  } catch (error) {
    console.error('Error inserting data:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  insertData
};