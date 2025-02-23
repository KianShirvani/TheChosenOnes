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

const validateAdmin = async (req, res, next) => {
    const { userId } = req.body;

    try {
        // Check if the user is an admin
        const adminCheckQuery = await client.query('SELECT * FROM admins WHERE admin_id = $1', [userId]);
        if (adminCheckQuery.rows.length === 0) {
            return res.status(403).json({ error: 'Access denied. User is not an admin.' });
        }

        // If user is an admin, proceed to the next middleware or route handler
        next();
    } catch (error) {
        console.error('Error in validateAdmin middleware:', error);
        return res.status(500).json({ 
            error: 'Internal Server Error',
            message: 'An unexpected error occurred while processing your request. Please try again later.'
        });
    }
};

module.exports = { validateAdmin };