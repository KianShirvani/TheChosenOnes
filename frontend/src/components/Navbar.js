import React from "react";

const Navbar = () => {
  return (
    <nav style={styles.navbar}>
      <h2 style={styles.heading}>Collabium</h2>
    </nav>
  );
};

const styles = {
  navbar: {
    background: "#F4F5F7",
    color: "white",
    padding: "10px 20px",
    textAlign: "center",
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
