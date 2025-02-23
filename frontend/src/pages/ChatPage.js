import { useEffect, useState, useRef } from "react";
import { 
  db, storage, collection, addDoc, query, orderBy, where, onSnapshot, updateDoc, 
  deleteDoc, doc, ref, uploadBytes, getDownloadURL, getDocs // ✅ 添加 getDocs
} from "../components/firebaseConfig";
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
  
    const clearDatabase = async () => {
      try {
        const messagesRef = collection(db, "messages");
        const querySnapshot = await getDocs(messagesRef);
  
        querySnapshot.forEach(async (docSnapshot) => {
          await deleteDoc(doc(db, "messages", docSnapshot.id));
        });

      } catch (error) {
      }
    };
  
    clearDatabase();
  }, [userId]);
  

  useEffect(() => {
    if (!selectedChat) return;

    const isGroupChat = selectedChat?.participants?.length > 2;
    const chatId = isGroupChat ? selectedChat?.id : selectedChat?.id || selectedChat;

  

    if (!chatId) {
      return;
    }

    const q = query(
      collection(db, "messages"),
      where("participants", "array-contains", chatId),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newMessages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      
      setMessages(newMessages);
    });

    return () => unsubscribe();
  }, [selectedChat]);

  const sendMessage = async (imageUrl = "") => {
    if (!newMessage.trim() && !imageUrl) return;

    try {
      const isGroupChat = selectedChat?.participants?.length > 2;
      const participants = isGroupChat ? [...selectedChat.participants] : [userId, selectedChat.id];

      await addDoc(collection(db, "messages"), {
        text: newMessage.trim(),
        timestamp: new Date(),
        senderId: userId,
        participants,
        imageUrl: imageUrl || "",
        likes: 0,
        likedBy: [],
        isGroupChat,
      });

      setNewMessage("");
    } catch (error) {
    }
  };
  const createGroupChat = async () => {
    if (selectedGroupUsers.length < 2) {
      return;
    }
  
    const groupId = `group-${uuidv4()}`;
    const group = {
      id: groupId,
      name: groupName || "New Group",
      participants: [...selectedGroupUsers, userId],
    };
  
  
    setGroupChats((prevGroups) => [...prevGroups, group]);
  
    setSelectedChat(group);
  
    setGroupName("");
    setSelectedGroupUsers([]);
    setCreatingGroup(false);
  };
  

  const handleSelectChat = (chat) => {

    if (typeof chat === "string") {
      const newSelectedChat = { id: chat, participants: [userId, chat] };
      setSelectedChat(newSelectedChat);
    } else {
      setSelectedChat(chat);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-sidebar">
        <h2 className="chat-title">Chats</h2>
        <button className="group-button" onClick={() => {
  console.log("🟢 Create Group 按钮被点击");
  setCreatingGroup(!creatingGroup);
}}>
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
          checked={selectedGroupUsers.includes(user)}
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
    <button className="confirm-group-button" onClick={() => {
      createGroupChat();
    }}>
      Confirm
    </button>
  </div>
)}


        <div className="chat-users">
          {users.map((user) => (
            <button key={user} onClick={() => handleSelectChat(user)} className="chat-user-button">
              {user}
            </button>
          ))}
        </div>

        <div className="chat-groups">
          {groupChats.map((group) => (
            <button key={group.id} onClick={() => handleSelectChat(group)} className="chat-user-button">
              {group.name}
            </button>
          ))}
        </div>
      </div>

      <div className="chat-main">
        {selectedChat ? (
          <>
            <div className="chat-header">
              {selectedChat?.name || `Chat with ${selectedChat.id}`}
            </div>

            <div className="chat-box">
              {messages.map((msg) => (
                <div key={msg.id} className={`message ${msg.senderId === userId ? "self" : "other"}`}>
                  {msg.imageUrl ? (
                    <img src={msg.imageUrl} alt="Sent" className="chat-image" />
                  ) : (
                    <span>{msg.text}</span>
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
                  <EmojiPicker onEmojiClick={(emoji) => setNewMessage((prev) => prev + emoji.emoji)} />
                </div>
              )}

              <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type a message..." />

              <input type="file" ref={fileInputRef} style={{ display: "none" }} onChange={(e) => sendMessage(e.target.files[0])} />
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
