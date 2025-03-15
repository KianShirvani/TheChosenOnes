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

const validateAdmin = async (req, res, next) => {
    const userId = req.user?.user_id;  // Get from token
    console.log("Validating Admin:", userId);  

    if (!userId) {
        return res.status(401).json({ error: "Access denied. No user ID provided" });
    }

    try {
        const adminCheckQuery = await client.query('SELECT * FROM admins WHERE admin_id = $1', [userId]);
        console.log("Admin Check Result:", adminCheckQuery.rows);  

        if (adminCheckQuery.rows.length === 0) {
            return res.status(403).json({ error: "Access denied. User is not an admin." });
        }

        next();
    } catch (error) {
        console.error("Error in validateAdmin middleware:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};



module.exports = { validateAdmin };