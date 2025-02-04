import React from "react";

const Navbar = () => {
  return (
    <nav style={styles.navbar}>
      <h2>Task Manager</h2>
    </nav>
  );
};

const styles = {
  navbar: {
    background: "#007bff",
    color: "white",
    padding: "10px 20px",
    textAlign: "center",
  },
};

export default Navbar;
