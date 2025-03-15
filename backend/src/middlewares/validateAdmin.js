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
    if (!req.user) {
        console.error("validateAdmin: No user object found in request.");
        return res.status(401).json({ error: "Access denied. No user data provided." });
    }

    const userId = req.user?.user_id || req.user?.userId; 
    console.log("Validating Admin:", userId);

    if (!userId) {
        console.error("No user ID found in token.");
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
