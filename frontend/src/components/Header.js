
// after pull please run 'npm install' or 'npm install react-icons' to get icon thanks

import React from 'react';
import '../css/header.css';
import { FaBell, FaSearch } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Header = () => {

    const navigate = useNavigate();  

    return (
        <header className="header">
            <div className="header-left"> 
            <a onClick={() => navigate("/#")} className="header-logo" style={{ cursor: "pointer" }}>Collabium</a>
                <nav className="navbar">
                    <a onClick={() => navigate("/#")} href="#">Home</a>
                    <a onClick={() => navigate("/#")}href="#">About us</a>
                    <a onClick={() => navigate("/#")}href="#">Contact us</a>
                </nav>
            </div>

            <div className="header-actions">
                <div className="search-container">
                    <input type="text" placeholder="Search..." className="search-input" />
                    <FaSearch className="search-icon" />
                </div>
                <FaBell className="icon notification-icon" />
                <button className="btn sign-in" onClick={() => navigate("/login")}>Log In</button>
                <button className="btn sign-up" onClick={() => navigate("/signup")}>Sign Up</button>
            </div>
        </header>
    );
};


export default Header;


