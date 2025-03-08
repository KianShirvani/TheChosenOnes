import React from "react";

const Navbar = () => {
  return (
    <nav style={styles.navbar}>
      <div style={styles.spacer}></div> {/* Left spacer for centering */}

      <h2 style={styles.heading}>Collabium</h2> {/* Centered heading */}
    </nav>
  );
};

const styles = {
  navbar: {
    background: "#F4F5F7",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 20px",
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
    margin: 0,
  },
};

export default Navbar;