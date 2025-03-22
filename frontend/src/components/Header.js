// after pull please run 'npm install' or 'npm install react-icons' to get icon thanks

import React, { useContext } from 'react';
import '../css/header.css';
import { FaBell, FaSearch, FaComments } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { NotificationContext } from './NotificationContext'; 

const Header = () => {
    const navigate = useNavigate();  
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const isLoggedIn = !!token && token !== "logged_out";
    // Get notification data from context
    const { notification } = useContext(NotificationContext);
    
    const handleChatClick = () => {
        if (isLoggedIn) {
            navigate("/chat"); // Send to chat if logged in
        } else {
            navigate("/login"); // Redirect to sign-up if not logged in
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token"); // remove authentication once logged out
        navigate("/login");
      };
    const handleTasksClick = () => {
        navigate("/tasks"); // Navigate to My Tasks page
    };

    // When notification icon is clicked, show the message if available
    const handleNotificationClick = () => {
        if (notification.message) {
            alert(notification.message);
        }
    };

    return (
        <header className="header">
            <div className="header-left"> 
                <a onClick={() => navigate("/#")} className="header-logo" style={{ cursor: "pointer" }}>Collabium</a>
                <nav className="navbar">
                    <a onClick={() => navigate("/#")} href="#">Home</a>
                    <a onClick={() => navigate("/#")} href="#">About us</a>
                    <a onClick={() => navigate("/#")} href="#">Contact us</a>
                </nav>
            </div>

            <div className="header-actions">
                {/* Show "My Tasks" button only if user is logged in */}
                {isLoggedIn && (
                    <button 
                        className="btn my-tasks" 
                        onClick={handleTasksClick} 
                        style={{ marginRight: "15px" }}
                    >
                        My Tasks
                    </button>
                )}
                {isLoggedIn && role  === "admin" && (
          <button
            className="btn adminButton"
            onClick={() => navigate("/admindashboard")}
            style={{ marginRight: "15px" }}
          >
            Admin Dashboard
          </button>
        )}

                {/* Chat icon directing users to the /chat page if logged in, otherwise to sign up */}
                <FaComments 
                    className="icon chat-icon" 
                    onClick={handleChatClick} 
                    style={{ cursor: "pointer", fontSize: "1.2rem", marginRight: "15px" }} 
                />

               

                {/* Updated notification icon with color from notification and click handler */}
                <FaBell 
                    className="icon notification-icon" 
                    onClick={handleNotificationClick} 
                    style={{ 
                        cursor: "pointer", 
                        fontSize: "1.2rem", 
                        marginRight: "15px",
                        color: notification.color // NEW: Icon color set from notification context
                    }} 
                />

{!isLoggedIn ? (
                    <>
                        <button className="btn sign-in" onClick={() => navigate("/login")}>Log In</button>
                        <button className="btn sign-up" onClick={() => navigate("/signup")}>Sign Up</button>
                    </>
                ) : (
                    <button className="btn logout" onClick={handleLogout}>Log Out</button>
                )}
      </div>
    </header>
    );
};

export default Header;
