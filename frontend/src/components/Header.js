// after pull please run 'npm install' or 'npm install react-icons' to get icon thanks
import '../css/header.css';
import { FaBell, FaSearch, FaComments } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { NotificationContext } from './NotificationContext';
import React, { useContext, useEffect, useState } from 'react';





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

    const [notifications, setNotifications] = useState([]);

    

    useEffect(() => {
        fetch(`${process.env.REACT_APP_API_URL}/api/notifications`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            credentials: "include",
        })
            .then(res => res.json())
            .then(data => setNotifications(data.notifications || []));
    }, []);

    const [showDropdown, setShowDropdown] = useState(false);

const handleNotificationClick = () => {
    setShowDropdown(!showDropdown);
};

const markAsRead = async (notificationId) => {
    await fetch(`${process.env.REACT_APP_API_URL}/api/notifications/${notificationId}/read`, {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        credentials: "include"
    });

    setNotifications(prev => prev.filter(n => n.id !== notificationId));
};

    const scrollToSection = (sectionId) => {
        if (window.location.pathname !== "/") {
            navigate("/", { replace: false });
            setTimeout(() => {
                const section = document.getElementById(sectionId);
                if (section) section.scrollIntoView({ behavior: "smooth" });
            }, 300); // small delay to let homepage load
        } else {
            const section = document.getElementById(sectionId);
            if (section) section.scrollIntoView({ behavior: "smooth" });
        }
    };
    const handleLogout = () => {
        localStorage.removeItem("token"); // remove authentication once logged out
        navigate("/login");
    };
    const handleTasksClick = () => {
        navigate("/tasks"); // Navigate to My Tasks page
    };

    return (
        <header className="header">
            <div className="header-left">
                <a onClick={() => navigate("/#")} className="header-logo" style={{ cursor: "pointer" }}>Collabium</a>
                <nav className="navbar">
                    <a href="#" onClick={(e) => { e.preventDefault(); scrollToSection("hero"); }}>Home</a>
                    <a href="#" onClick={(e) => { e.preventDefault(); scrollToSection("features"); }}>About us</a>
                    <a href="#" onClick={(e) => { e.preventDefault(); scrollToSection("contact"); }}>Contact us</a>

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
                {isLoggedIn && role === "admin" && (
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

                {notifications.length > 0 && <span className="badge">{notifications.length}</span>}


                {/* Updated notification icon with color from notification and click handler */}
                <FaBell
                    className="icon notification-icon"
                    onClick={handleNotificationClick}
                    style={{ cursor: "pointer", fontSize: "1.2rem", marginRight: "15px", color: notification.color }}
                    />

                    {showDropdown && (
                    <div className="notification-dropdown">
                        {notifications.length === 0 ? (
                        <p>No new notifications</p>
                        ) : (
                        notifications.map(n => (
                            <div key={n.id} className="notification-item">
                            <span>{n.message}</span>
                            <button onClick={() => markAsRead(n.id)}>✓</button>
                            </div>
                        ))
                        )}
                    </div>
                    )}


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
