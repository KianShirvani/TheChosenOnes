// routes/notificationRoutes.js
const express = require("express");
const router = express.Router();
const client = require("../database/db");
const { authenticatedUser } = require("../middlewares/authMiddleware");

// get unread notifications for the logged-in user
router.get("/", authenticatedUser, async (req, res) => {
  try {
    const userId = req.user.user_id;
    const result = await client.query(
      "SELECT * FROM notifications WHERE user_id = $1 AND read = FALSE ORDER BY created_at DESC",
      [userId]
    );
    res.json({ notifications: result.rows });
  } catch (err) {
    console.error("Error fetching notifications:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// mark a notification as read
router.post("/:id/read", authenticatedUser, async (req, res) => {
    try {
      const notificationId = req.params.id;
      const userId = req.user.user_id;
  
      // only allow marking if the notification belongs to the user
      const result = await client.query(
        "UPDATE notifications SET read = TRUE WHERE id = $1 AND user_id = $2 RETURNING *",
        [notificationId, userId]
      );
  
      if (result.rowCount === 0) {
        return res.status(404).json({ error: "Notification not found or access denied" });
      }
  
      res.json({ message: "Notification marked as read", notification: result.rows[0] });
    } catch (err) {
      console.error("Error marking notification as read:", err);
      res.status(500).json({ error: "Server error" });
    }
  });
  

module.exports = router;
