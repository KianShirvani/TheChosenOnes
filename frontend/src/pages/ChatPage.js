import { useEffect, useState, useRef } from "react";
import { db, storage, collection, addDoc, query, orderBy, where, onSnapshot, updateDoc, deleteDoc, doc, ref, uploadBytes, getDownloadURL } from "../components/firebaseConfig";
import { v4 as uuidv4 } from "uuid";
import EmojiPicker from "emoji-picker-react";
import { FaRegSmile, FaRegThumbsUp, FaImage, FaTrash, FaUsers } from "react-icons/fa";
import { IoMdSend } from "react-icons/io";
import "../css/ChatPage.css";

const users = ["Rheiley", "Liz", "Ivy", "Kian", "Nade"];

export default function ChatPage() {
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [userId, setUserId] = useState(localStorage.getItem("userId") || uuidv4());
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedGroupUsers, setSelectedGroupUsers] = useState([]);
  const [creatingGroup, setCreatingGroup] = useState(false);
  const [groupChats, setGroupChats] = useState([]);
  const [groupName, setGroupName] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    localStorage.setItem("userId", userId);
  }, [userId]);

  useEffect(() => {
    if (!selectedChat) return;

    const q = query(
      collection(db, "messages"),
      where("participants", "array-contains", userId),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const filteredMessages = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((msg) => msg.participants.includes(selectedChat?.id || selectedChat));
      setMessages(filteredMessages);
    });

    return () => unsubscribe();
  }, [selectedChat]);

  const sendMessage = async (imageUrl = "") => {
    if (!newMessage.trim() && !imageUrl) return;

    try {
      const isGroupChat = selectedChat?.participants?.length > 2;
      const isTwoPersonGroup = selectedChat?.participants?.length === 2;

      await addDoc(collection(db, "messages"), {
        text: newMessage.trim(),
        timestamp: new Date(),
        senderId: userId,
        receiverId: selectedChat?.id || selectedChat,
        participants: selectedChat.participants ? selectedChat.participants : [userId, selectedChat],
        imageUrl: imageUrl || "",
        likes: 0,
        likedBy: [],
        isGroupChat,
      });

      setNewMessage("");
    } catch (error) {
      console.error("Message sending failed:", error);
    }
  };

  const handleEmojiClick = (emojiObject) => {
    setNewMessage((prev) => prev + emojiObject.emoji);
    setShowEmojiPicker(false);
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const storageRef = ref(storage, `chat-images/${file.name}`);
      await uploadBytes(storageRef, file);
      const imageUrl = await getDownloadURL(storageRef);

      await sendMessage(imageUrl);
    } catch (error) {
      console.error("Image upload failed:", error);
    }
  };

  const handleLike = async (messageId, currentLikes, likedBy) => {
    if (likedBy.includes(userId)) return;

    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, likes: msg.likes + 1, likedBy: [...msg.likedBy, userId] } : msg
      )
    );

    const messageRef = doc(db, "messages", messageId);
    await updateDoc(messageRef, {
      likes: currentLikes + 1,
      likedBy: [...likedBy, userId],
    });
  };

  const handleRecall = async (messageId, senderId) => {
    if (senderId !== userId) return;

    const messageRef = doc(db, "messages", messageId);
    await deleteDoc(messageRef);
  };

  const createGroupChat = async () => {
    if (selectedGroupUsers.length < 2) return;
    const groupId = `group-${uuidv4()}`;
    const group = { id: groupId, name: groupName || "New Group", participants: [...selectedGroupUsers, userId] };

    setGroupChats((prevGroups) => [...prevGroups, group]);
    setSelectedChat(group);
    setCreatingGroup(false);
    setGroupName("");
    setSelectedGroupUsers([]);
  };

  return (
    <div className="chat-container">
      <div className="chat-sidebar">
        <h2 className="chat-title">Chats</h2>
        <button className="group-button" onClick={() => setCreatingGroup(!creatingGroup)}>
          <FaUsers /> Create Group
        </button>

        {creatingGroup && (
          <div className="group-selection">
            <input
              type="text"
              className="group-name-input"
              placeholder="Enter group name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
            {users.map((user) => (
              <label key={user} className="group-user">
                <input
                  type="checkbox"
                  value={user}
                  onChange={(e) => {
                    const selected = e.target.checked
                      ? [...selectedGroupUsers, user]
                      : selectedGroupUsers.filter((u) => u !== user);
                    setSelectedGroupUsers(selected);
                  }}
                />
                {user}
              </label>
            ))}
            <button className="confirm-group-button" onClick={createGroupChat}>
              Confirm
            </button>
          </div>
        )}

        <div className="chat-groups">
          {groupChats.map((group) => (
            <button key={group.id} onClick={() => setSelectedChat(group)} className="chat-user-button">
              {group.name}
            </button>
          ))}
        </div>

        <div className="chat-users">
          {users.map((user) => (
            <button key={user} onClick={() => setSelectedChat(user)} className="chat-user-button">
              {user}
            </button>
          ))}
        </div>
      </div>

      <div className="chat-main">
        {selectedChat ? (
          <>
            <div className="chat-header">
              {selectedChat?.name || `Chat with ${selectedChat}`}
            </div>

            <div className="chat-box">
              {messages.map((msg) => (
                <div key={msg.id} className={`message ${msg.senderId === userId ? "self" : "other"}`}>
                  {msg.recalled ? (
                    <span className="recalled">Message Recalled</span>
                  ) : (
                    <>
                      {msg.imageUrl ? (
                        <img src={msg.imageUrl} alt="Sent" className="chat-image" />
                      ) : (
                        <span>{msg.text}</span>
                      )}
                      <div className="message-actions">
                        <button
                          className={`like-button ${msg.likedBy.includes(userId) ? "liked" : ""}`}
                          onClick={() => handleLike(msg.id, msg.likes, msg.likedBy)}
                        >
                          👍 {msg.likes}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>

            <div className="chat-input">
              <button className="emoji-button" onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
                <FaRegSmile />
              </button>

              {showEmojiPicker && (
                <div className="emoji-picker">
                  <EmojiPicker onEmojiClick={handleEmojiClick} />
                </div>
              )}

              <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type a message..." />

              <input type="file" ref={fileInputRef} style={{ display: "none" }} onChange={handleImageUpload} />
              <button className="upload-button" onClick={() => fileInputRef.current.click()}>
                <FaImage />
              </button>

              <button className="send-button" onClick={() => sendMessage()}>
                <IoMdSend />
              </button>
            </div>
          </>
        ) : (
          <div className="chat-placeholder">Select a contact or create a group</div>
        )}
      </div>
    </div>
  );
}
