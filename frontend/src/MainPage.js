import React from "react";
import Footer from "./Footer";
import Navbar from "./Navbar";

const MainPage = () => {
  return (
    <div style={styles.container}>
      <Navbar />
      <div style={styles.content}>
        <h1>Welcome to Collabium</h1>
        <p>Manage your tasks efficiently with our collaborative system.</p>
      </div>
      <Footer />
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
  },
  content: {
    flex: 1,
    padding: "20px",
    textAlign: "center",
  },
};

export default MainPage;
