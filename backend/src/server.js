require("dotenv").config();

const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const app = express();

const serviceAccount = {
    type: "service_account",
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: process.env.FIREBASE_AUTH_URI,
    token_uri: process.env.FIREBASE_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
  
};


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`,
});


const db = admin.firestore();
module.exports = { admin, db };

const corsOptions = {
    origin: process.env.FRONTEND_URL, 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,  
  };

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

app.post("/send-message", async (req, res) => {
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
});

app.get("/messages/:chatId", async (req, res) => {
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
});
app.post("/like-message/:messageId", async (req, res) => {
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
});


// routes
app.use("/auth", require("./routes/auth"));
app.use("/register", require("./routes/userRoutes"));
app.use("/admin", require("./routes/adminRoutes"));

// Basic Route
app.get("/", (req, res) => {
  res.send("Hello from backend");
});

app.get("/ping", (req, res) => {
  res.status(200).json({ message: "Backend is running!" });
});
// Start Express Server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});