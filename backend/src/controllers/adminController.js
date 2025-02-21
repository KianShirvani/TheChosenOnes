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

const promoteToAdmin = async (req, res) => {
    const { userId } = req.body;

    try {
        // Check if the user exists
        const userCheckQuery = await client.query('SELECT * FROM users WHERE user_id = $1', [userId]);
        if (userCheckQuery.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check if the user is already an admin
        const adminCheckQuery = await client.query('SELECT * FROM admins WHERE admin_id = $1', [userId]);
        if (adminCheckQuery.rows.length > 0) {
            return res.status(400).json({ error: 'User is already an admin' });
        }

        // Promote the user to admin
        const promoteUserQuery = await client.query('INSERT INTO admins (admin_id) VALUES ($1) RETURNING *', [userId]);

        const newAdmin = promoteUserQuery.rows[0];

        // Respond with success
        return res.status(200).json({
            message: 'User promoted to admin successfully',
            admin: {
                id: newAdmin.admin_id
            }
        });
    } catch (error) {
        console.error('Error in promoteToAdmin:', error);
        return res.status(500).json({ 
            error: 'Internal Server Error',
            message: 'An unexpected error occurred while processing your request. Please try again later.'
        });
    }
};

module.exports = { promoteToAdmin };