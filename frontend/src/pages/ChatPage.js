import { useEffect, useState, useRef } from "react";
import { 
  db, collection, addDoc, query, orderBy, where, onSnapshot, updateDoc, 
  deleteDoc, doc, getDocs 
} from "../components/firebaseConfig";
import { v4 as uuidv4 } from "uuid";
import EmojiPicker from "emoji-picker-react";
import { FaRegSmile, FaRegThumbsUp, FaImage, FaUsers } from "react-icons/fa";
import { IoMdSend } from "react-icons/io";
import "../css/ChatPage.css";
import { getDoc,setDoc } from "firebase/firestore";






export default function ChatPage() {
  const [selectedChat, setSelectedChat] = useState(() => {
    const savedChat = localStorage.getItem("selectedChat");
    return savedChat ? JSON.parse(savedChat) : null;
  });
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [userId, setUserId] = useState(localStorage.getItem("userId") || uuidv4());
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedGroupUsers, setSelectedGroupUsers] = useState([]);
  const [creatingGroup, setCreatingGroup] = useState(false);
  const [groupChats, setGroupChats] = useState(() => {
    const savedGroups = localStorage.getItem("groupChats");
    return savedGroups ? JSON.parse(savedGroups) : [];
  });
  const [groupName, setGroupName] = useState("");
  const fileInputRef = useRef(null);
  const [editingGroupName, setEditingGroupName] = useState(false);
  const [users, setUsers] = useState([]);
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("http://localhost:5003/api/users", {
          method: "GET",
          credentials: "include",
        });
        const data = await response.json();
        const userList = data.users
          .filter(user => user.user_id !== userId)
          .map(user => ({ 
            id: String(user.user_id), 
            name: user.display_name 
          }));
        setUsers(userList);
      } catch (error) {
        console.error("get user fail:", error);
      }
    };
    fetchUsers();
  }, [userId]);
  

  useEffect(() => {
    const q = query(collection(db, "groupChats"), orderBy("id"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedGroups = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setGroupChats(loadedGroups);
      localStorage.setItem("groupChats", JSON.stringify(loadedGroups)); 
    }, (error) => {
      console.error("fail to load groups:", error);
    });
  
    return () => unsubscribe();
  }, []);

  useEffect(() => {  
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
      console.log("New messages received:", newMessages);
      setMessages(newMessages);
    }, (error) => {
      console.error("error when listening message:", error);
    });
  
    return () => unsubscribe();
  }, [selectedChat]);
  
  
  
  const sendMessage = async (imageUrl = "") => {
    if (!newMessage.trim() && !imageUrl) return;
  
    if (!selectedChat || !selectedChat.id) {
      return;
    }
  
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
      console.log("save message successfully ，messageId:", messageId);
    } catch (error) {
      console.error("fail to save message:", error);
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
  
    const groupId = `group-${uuidv4()}`;
    const group = {
      id: groupId,
      name: groupName || "New Group",
      participants: [...selectedGroupUsers, userId],
    };
  
    try {
      await addDoc(collection(db, "groupChats"), group);
      setSelectedChat(group);
      setGroupName("");
      setSelectedGroupUsers([]);
      setCreatingGroup(false);
    } catch (error) {
      console.error("fail to create group:", error);
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
  const handleDeleteGroup = async (groupId) => {
    try {
      const groupQuery = query(collection(db, "groupChats"), where("id", "==", groupId));
      const querySnapshot = await getDocs(groupQuery);
  
      if (!querySnapshot.empty) {
        const groupDoc = querySnapshot.docs[0].ref;
        await deleteDoc(groupDoc);

        setGroupChats((prevGroups) => prevGroups.filter(group => group.id !== groupId));
  
        if (selectedChat?.id === groupId) {
          setSelectedChat(null);
          localStorage.removeItem("selectedChat");
        }
      } else {
        console.error("can not find group:", groupId);
      }
    } catch (error) {
      console.error("fail to delete groups:", error);
    }
  };
  
  
  const handleSelectChat = (chat) => {
  
    if (!chat) {
      setSelectedChat(null);
      localStorage.removeItem("selectedChat");
      return;
    }
  
    let newSelectedChat;
    if (typeof chat === "string" || typeof chat === "number") {
      const chatId = String(chat);
      newSelectedChat = { id: chatId, participants: [userId, chatId] };
    } else if (chat && typeof chat === "object" && chat.id && chat.participants) {
      newSelectedChat = chat;
    } else {
      setSelectedChat(null);
      localStorage.removeItem("selectedChat");
      return;
    }

    setSelectedChat(newSelectedChat);
    localStorage.setItem("selectedChat", JSON.stringify(newSelectedChat));
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
  <label key={user.id} className="group-user">
    <input
      type="checkbox"
      value={user.id}
      checked={selectedGroupUsers.includes(user.id)}
      onChange={(e) => {
        const selected = e.target.checked
          ? [...selectedGroupUsers, user.id]
          : selectedGroupUsers.filter((u) => u !== user.id);
        setSelectedGroupUsers(selected);
      }}
    />
    {user.name}
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
    <button 
      key={user.id} 
      onClick={() => {
        handleSelectChat(user.id);
      }} 
      className="chat-user-button"
    >
      {user.name}
    </button>
  ))}
</div>

<div className="chat-groups">
  {groupChats.map((group) => (
    <button key={group.id} onClick={() => handleSelectChat(group)} className="chat-user-button">
      {group.name && group.name !== "New Group"
        ? group.name
        : `Group with ${
            group.participants
              .filter(id => id !== userId) 
              .map(id => users.find(user => user.id === id)?.name || id) 
              .join(", ")
          }`}
    </button>
  ))}
</div>
      </div>

      <div className="chat-main">
        {selectedChat ? (
          <>
<div className="chat-header">
  {selectedChat?.participants?.length > 2
    ? (selectedChat.name && selectedChat.name !== "New Group"
        ? selectedChat.name
        : `Group with ${
            selectedChat.participants
              .filter(id => id !== userId)
              .map(id => users.find(user => user.id === id)?.name || id)
              .join(", ")
          }`)
    : `Chat with ${users.find(user => user.id === selectedChat.id)?.name || selectedChat.id}`}
  {selectedChat?.participants?.length > 2 && (
    <>
      <button onClick={() => setEditingGroupName(true)}>Rename</button>
      <button onClick={() => handleDeleteGroup(selectedChat.id)}>Delete</button>
    </>
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
