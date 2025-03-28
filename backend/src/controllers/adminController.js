const client = require('../database/db');

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

// Fetch all users (for admin management UI)
const getUsers = async (req, res) => {
    try {
        const usersQuery = await client.query(`
            SELECT 
                user_id, 
                first_name, 
                last_name, 
                display_name, 
                email, 
                EXISTS (SELECT 1 FROM admins WHERE admins.admin_id = users.user_id) AS is_admin
            FROM users
        `);
        res.json(usersQuery.rows);
    } catch (error) {
        console.error("Error in getUsers:", error);
        return res.status(500).json({ 
            error: 'Internal Server Error',
            message: 'An unexpected error occurred while processing your request. Please try again later.'
        });
    }
};

// Update user details (first name, last name, email)
const updateUser = async (req, res) => {
    const { id } = req.params;
    const { firstName, lastName, email } = req.body;

    try {
        const updateQuery = await client.query(
            `UPDATE users 
            SET first_name = $1, last_name = $2, email = $3 
            WHERE user_id = $4 RETURNING *`,
            [firstName, lastName, email, id]
        );

        if (updateQuery.rowCount === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json({ message: "User details updated successfully", user: updateQuery.rows[0] });
    } catch (error) {
        console.error("Error in updateUser:", error);
        return res.status(500).json({ 
            error: 'Internal Server Error',
            message: 'An unexpected error occurred while processing your request. Please try again later.'
        });
    }
};

// Delete a user from the database
const deleteUser = async (req, res) => {
    const { id } = req.params;

    try {
        const deleteQuery = await client.query("DELETE FROM users WHERE user_id = $1 RETURNING *", [id]);

        if (deleteQuery.rowCount === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json({ message: "User deleted successfully" });
    } catch (error) {
        console.error("Error in deleteUser:", error);
        return res.status(500).json({ 
            error: 'Internal Server Error',
            message: 'An unexpected error occurred while processing your request. Please try again later.'
        });
    }
};

// Stats for the admin dashboard
const getAdminStats = async (req, res) => {
    try {
        // Count tasks by status
        const toDoQuery = await client.query("SELECT COUNT(*) FROM tasks WHERE status = 'To-Do'");
        const inProgressQuery = await client.query("SELECT COUNT(*) FROM tasks WHERE status = 'In Progress'");
        const doneQuery = await client.query("SELECT COUNT(*) FROM tasks WHERE status = 'Done'");
        // Parse to Int
        const toDoTotal = parseInt(toDoQuery.rows[0].count, 10);
        const inProgressTotal = parseInt(inProgressQuery.rows[0].count, 10);
        const doneTotal = parseInt(doneQuery.rows[0].count, 10);

        // Calculate the completion rate of tasks
        const totalTasks = toDoTotal + inProgressTotal + doneTotal;
        const completionRate = totalTasks > 0 ? ((doneTotal / totalTasks) * 100).toFixed(2) : 0;

        // Count upcoming due tasks (set this to be the next 7 days, can be changed)
        const upcomingDueQuery = await client.query(`
            SELECT COUNT(*) FROM tasks 
            WHERE due_date >= NOW() 
            AND due_date <= NOW() + INTERVAL '7 days' 
            AND status != 'Done'
        `);
        const upcomingDueTotal = parseInt(upcomingDueQuery.rows[0].count, 10);

        // Get the most recent upcoming due date that excludes "Done" tasks
        const upcomingDueDateQuery = await client.query(`
            SELECT due_date FROM tasks
            WHERE due_date >= NOW()
            AND status != 'Done'
            ORDER BY due_date ASC
            LIMIT 1
        `);
        const upcomingDueDate = upcomingDueDateQuery.rows.length > 0 ? upcomingDueDateQuery.rows[0].due_date : null;
        
        // Send the data/response
        res.json({
            todo: toDoTotal,
            inProgress: inProgressTotal,
            done: doneTotal,
            completionRate: completionRate,
            upcomingDue: upcomingDueTotal,
            upcomingDueDate: upcomingDueDate
        });

    } catch (error) {
        console.error('Error fetching admin stats:', error);
        return res.status(500).json({ 
            error: 'Internal Server Error',
            message: 'An unexpected error occurred while processing your request. Please try again later.' 
        });
    }
};

// add demoteAdmin function to change an admin user's role from admin to user.
const demoteAdmin = async (req, res) => {
    const { userId } = req.body;
    try {
        // Check if the user exists
        const userCheckQuery = await client.query('SELECT * FROM users WHERE user_id = $1', [userId]);
        if (userCheckQuery.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        // Check if the user is actually an admin
        const adminCheckQuery = await client.query('SELECT * FROM admins WHERE admin_id = $1', [userId]);
        if (adminCheckQuery.rows.length === 0) {
            return res.status(400).json({ error: 'User is not an admin' });
        }
        // Demote the user: remove from admins table
        const demoteUserQuery = await client.query('DELETE FROM admins WHERE admin_id = $1 RETURNING *', [userId]);
        const demotedAdmin = demoteUserQuery.rows[0];
        // Respond with success
        return res.status(200).json({
            message: 'User demoted from admin successfully',
            admin: {
                id: demotedAdmin.admin_id
            }
        });
    } catch (error) {
        console.error('Error in demoteAdmin:', error);
        return res.status(500).json({
            error: 'Internal Server Error',
            message: 'An unexpected error occurred while processing your request. Please try again later.'
        });
    }
};

module.exports = { promoteToAdmin, getAdminStats, getUsers, updateUser, deleteUser, demoteAdmin };
