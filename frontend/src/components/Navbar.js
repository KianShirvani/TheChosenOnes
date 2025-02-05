import React from "react";

const Navbar = () => {
  return (
    <nav style={styles.navbar}>
      <div style={styles.spacer}></div> {/* Left spacer for centering */}

      <h2 style={styles.heading}>Collabium</h2> {/* Centered heading */}

      <div style={styles.buttonContainer}>
        <button style={styles.button} onClick={() => alert("Login Clicked")}>
          Login
        </button>
        <button
          style={{ ...styles.button, background: "#007bff", color: "white" }}
          onClick={() => alert("Signup Clicked")}
        >
          Sign Up
        </button>
      </div>
    </nav>
  );
};

const styles = {
  navbar: {
    background: "#F4F5F7",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  spacer: {
    flex: 1, // Pushes Collabium to the center
  },
  heading: {
    fontFamily: "Inter, sans-serif",
    fontSize: "24px",
    fontWeight: "bold",
    color: "#0A0A0A",
    textAlign: "center",
    flex: 1, // Makes sure Collabium takes center space
  },
  buttonContainer: {
    display: "flex",
    gap: "10px",
    flex: 1, // Aligns buttons to the right
    justifyContent: "flex-end",
  },
  button: {
    padding: "8px 16px",
    fontSize: "14px",
    fontWeight: "bold",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    background: "#E0E0E0",
    color: "#333",
  },
  heading: {
    fontFamily: "Inter, sans-serif",
    fontSize: "24px",
    fontWeight: "bold",
    color: "#0A0A0A",
    margin: 0,
  },
};

export default Navbar;
