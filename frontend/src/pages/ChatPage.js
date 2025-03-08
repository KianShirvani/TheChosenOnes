import { useEffect, useState, useRef } from "react";
import { 
  db, collection, addDoc, query, orderBy, where, onSnapshot, updateDoc, 
  deleteDoc, doc, getDocs 
} from "../components/firebaseConfig";
import { v4 as uuidv4 } from "uuid";
import EmojiPicker from "emoji-picker-react";
import { FaRegSmile, FaRegThumbsUp, FaImage, FaTrash, FaUsers } from "react-icons/fa";
import { IoMdSend } from "react-icons/io";
import "../css/ChatPage.css";
import { getDoc,setDoc } from "firebase/firestore";



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
  const [editingGroupName, setEditingGroupName] = useState(false);


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
  
    console.log("📢 Fetching messages for:", selectedChat.id);
  
    const q = query(
      collection(db, "messages"),
      where("chatId", "==", selectedChat.id),  
      orderBy("timestamp", "asc")
    );
  

  
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newMessages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
  
      console.log("🔄 New messages received:", newMessages);
      setMessages(newMessages); 
    });
  
    return () => unsubscribe();
  }, [selectedChat]);
  
  
  
  const sendMessage = async (imageUrl = "") => {
    if (!newMessage.trim() && !imageUrl) return;
  
    const messageId = uuidv4(); 
  
    const newMsg = {
      id: messageId,
      text: newMessage.trim(),
      timestamp: new Date().toISOString(),
      senderId: userId,
      chatId: selectedChat.id,
      imageUrl: imageUrl || "",
      likes: 0,
      likedBy: [],
      isGroupChat: selectedChat?.participants?.length > 2,
    };
  

    setMessages((prevMessages) => [...prevMessages, newMsg]);
  
    try {
  
      await setDoc(doc(db, "messages", messageId), newMsg);
      console.log("Message successfully sent!");
    } catch (error) {
      console.error(" Error sending message:", error);
    }
  
    setNewMessage(""); 
  };
  

  const handleLike = async (msgId) => {
    console.log("Like button clicked for message:", msgId); 
  
    const messageRef = doc(db, "messages", msgId);
    const messageDoc = await getDoc(messageRef);
  
    if (!messageDoc.exists()) {
      console.error(" Message not found in Firestore:", msgId);
      return;
    }
  
    const messageData = messageDoc.data();
    const userHasLiked = messageData.likedBy.includes(userId);
  
    if (userHasLiked) {
      console.log(" You already liked this message.");
      return;
    }
  
    try {
      
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === msgId
            ? { ...msg, likes: msg.likes + 1, likedBy: [...msg.likedBy, userId] }
            : msg
        )
      );
  
      await updateDoc(messageRef, {
        likes: messageData.likes + 1,
        likedBy: [...messageData.likedBy, userId],
      });
  
      console.log("Like added:", msgId);
    } catch (error) {
      console.error(" Error updating like:", error);
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
  
    try {
      await addDoc(collection(db, "groupChats"), group); 
      setGroupChats((prevGroups) => [...prevGroups, group]); 
      setSelectedChat(group); 
  
      setGroupName("");
      setSelectedGroupUsers([]);
      setCreatingGroup(false);
    } catch (error) {
      console.error( error);
    }
  };

  const updateGroupName = async (newName) => {
    if (!selectedChat || !selectedChat.id || !newName.trim()) return;
  
    try {
    
      const groupQuery = query(collection(db, "groupChats"), where("id", "==", selectedChat.id));
      const querySnapshot = await getDocs(groupQuery);
  
      if (!querySnapshot.empty) {
        const groupDoc = querySnapshot.docs[0].ref; 
        await updateDoc(groupDoc, { name: newName }); 
  

        setGroupChats((prevGroups) =>
          prevGroups.map((group) =>
            group.id === selectedChat.id ? { ...group, name: newName } : group
          )
        );
  
      
        setSelectedChat((prevChat) => ({
          ...prevChat,
          name: newName,
        }));
  
        console.log(newName);
      } else {
        console.error("can not find");
      }
    } catch (error) {
      console.error( error);
    }
  };
  
  
  

  const handleSelectChat = (chat) => {
    if (!chat) return;
  
    console.log("📢 Chat selected:", chat.id);
  
    if (typeof chat === "string") {
      setSelectedChat({ id: chat, participants: [userId, chat] });
    } else {
      setSelectedChat(chat);
    }
  };
  

  return (
    <div className="chat-container">
      <div className="chat-sidebar">
        <h2 className="chat-title">Chats</h2>
        <button className="group-button" onClick={() => {
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
  {selectedChat?.participants?.length > 2 && (
    <button onClick={() => setEditingGroupName(true)}>✏️ Rename</button>
  )}
    </div>
    {editingGroupName && (
  <div className="edit-group-name">
    <input
      type="text"
      value={groupName}
      onChange={(e) => setGroupName(e.target.value)}
      placeholder="Enter new group name"
    />
    <button
      onClick={() => {
        updateGroupName(groupName); 
        setEditingGroupName(false); 
      }}
    >
      Save
    </button>
  </div>
)}

<div className="chat-box">
  {messages.map((msg) => (
    <div key={msg.id} className={`message ${msg.senderId === userId ? "self" : "other"}`}>
      {msg.imageUrl ? (
        <img src={msg.imageUrl} alt="Sent" className="chat-image" />
      ) : (
        <span>{msg.text}</span>
      )}

<button
  className={`like-button ${msg.likedBy.includes(userId) ? "liked" : ""}`}
  onClick={() => handleLike(msg.id)}
>
  <FaRegThumbsUp /> {msg.likes} 
</button>

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
