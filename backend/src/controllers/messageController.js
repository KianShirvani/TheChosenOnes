exports.sendMessage = (db) => async (req, res) => {
  const { text, senderId, chatId, imageUrl = "" } = req.body;

  if (!text.trim() && !imageUrl) {
    return res.status(400).json({ error: "Message cannot be empty" });
  }

  try {
    const messageRef = await db.collection("messages").add({
      text,
      senderId,
      chatId,
      imageUrl,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(200).json({ id: messageRef.id, message: "Message sent!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getMessages = (db) => async (req, res) => {
  const { chatId } = req.params;

  try {
    const messagesSnapshot = await db
      .collection("messages")
      .where("chatId", "==", chatId)
      .orderBy("timestamp", "asc")
      .get();

    const messages = messagesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.likeMessage = (db) => async (req, res) => {
  const { messageId } = req.params;
  const { userId } = req.body;

  try {
    const messageRef = db.collection("messages").doc(messageId);
    const messageDoc = await messageRef.get();

    if (!messageDoc.exists) {
      return res.status(404).json({ error: "Message not found" });
    }

    const messageData = messageDoc.data();
    const likedBy = messageData.likedBy || [];

    if (likedBy.includes(userId)) {
      return res.status(400).json({ error: "User already liked this message" });
    }

    await messageRef.update({
      likes: admin.firestore.FieldValue.increment(1),
      likedBy: [...likedBy, userId],
    });

    res.status(200).json({ message: "Message liked!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
