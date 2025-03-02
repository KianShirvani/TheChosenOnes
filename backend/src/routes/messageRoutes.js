const express = require("express");
const router = express.Router();
const messageController = require("../controllers/messageController");

router.post("/send-message", messageController.sendMessage);
router.get("/messages/:chatId", messageController.getMessages);
router.post("/like-message/:messageId", messageController.likeMessage);

module.exports = router;
