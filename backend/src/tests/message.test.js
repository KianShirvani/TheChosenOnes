const request = require("supertest");
const express = require("express");
const { sendMessage, getMessages, likeMessage } = require("../controllers/messageController");
const admin = require("firebase-admin");

// Mock Firebase Firestore
jest.mock("firebase-admin", () => ({
  firestore: jest.fn(() => ({
    collection: jest.fn().mockReturnThis(),
    add: jest.fn(),
    get: jest.fn(),
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    doc: jest.fn().mockReturnThis(),
    update: jest.fn(),
  })),
  FieldValue: {
    serverTimestamp: jest.fn(),
    increment: jest.fn(),
  },
}));

const app = express();
app.use(express.json());

// Set up routes for testing
app.post("/send-message", sendMessage(admin.firestore()));
app.get("/messages/:chatId", getMessages(admin.firestore()));
app.post("/like-message/:messageId", likeMessage(admin.firestore()));

describe("Message Controller", () => {
  beforeEach(() => {
    // Clear mocks before each test
    jest.clearAllMocks();

    // Mock the behavior of Firestore `add` and `get` methods
    admin.firestore().get.mockResolvedValue(mockGetMessages()); // Mock get messages
    admin.firestore().add.mockResolvedValueOnce({ id: "message1" }); // Mock adding a message

    // Mock Firestore `get` for a single message
    admin.firestore().doc.mockReturnValue({
      get: jest.fn().mockResolvedValue(mockGetMessage()), // Mock getting a single message
      update: jest.fn().mockResolvedValue()
    });
  });

  // Mock structure for the get messages function
  const mockGetMessages = () => ({
    docs: [
      {
        id: "message1",
        data: () => ({ text: "Hello!" })
      },
      {
        id: "message2",
        data: () => ({ text: "Hi there!" })
      }
    ]
  });

  // Mock structure for the get message function (single message)
  const mockGetMessage = () => ({
    exists: true,
    data: () => ({ likedBy: [] })
  });

  describe("POST /send-message", () => {
    it("should return 400 if message text and imageUrl are empty", async () => {
      const res = await request(app)
        .post("/send-message")
        .send({ text: "", senderId: "user1", chatId: "chat1" });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe("Message cannot be empty");
    });

    it("should return 500 if there is an error in sending message", async () => {
      admin.firestore().add.mockRejectedValueOnce(500);

      const res = await request(app)
        .post("/send-message")
        .send({ text: "Hello!", senderId: "user1", chatId: "chat1" });

      expect(res.statusCode).toBe(500);
    });
  });

  describe("GET /messages/:chatId", () => {
  

    it("should return 500 if there is an error in retrieving messages", async () => {
      admin.firestore().get.mockRejectedValueOnce(500);

      const res = await request(app).get("/messages/chat1");

      expect(res.statusCode).toBe(500);
    });
  });

  describe("POST /like-message/:messageId", () => {
  

  });
    it("should return 500 if there is an error in liking message", async () => {
      admin.firestore().doc.mockReturnValueOnce({
        get: jest.fn().mockRejectedValueOnce(500)
      });

      const res = await request(app)
        .post("/like-message/message1")
        .send({ userId: "user1" });

      expect(res.statusCode).toBe(500);
    });
  });

