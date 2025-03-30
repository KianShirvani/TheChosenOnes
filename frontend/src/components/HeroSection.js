import React from "react"; // keep imports at the top

const HeroSection = () => {
  return (
    <section style={styles.hero}>
      <h1>Welcome to Collabium</h1>
      <p>The ultimate platform for collaborative task management.</p>
     
      <img src="/cecd8dc7-4a3a-4c8c-b6f2-414b8097339c.png" alt="Hero" style={styles.image} />
      <br></br>

     
    </section>
  );
};

const styles = {
  hero: {
    textAlign: "center",
    padding: "50px 20px",
    background: "linear-gradient(to bottom, #7000da, #8d3dfd, #b288ff, #e0d4ff, white)",
    color: "white",
  },
  button: {
    padding: "10px 20px",
    fontSize: "16px",
    color: "#007bff",
    background: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    marginBottom: "20px",
  },
  image: {
    width: "80%", // Adjust the size as needed
    maxWidth: "500px",
    height: "auto",
    borderRadius: "10px",
    marginTop: "20px",
  },
};

export default HeroSection;
