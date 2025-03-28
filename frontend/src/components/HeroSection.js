import React from "react"; // keep imports at the top

const HeroSection = () => {
  return (
    <section style={styles.hero}>
      <h1>Welcome to The Chosen Ones</h1>
      <p>The ultimate platform for collaborative task management.</p>
     
      <img src="/hero-image.png" alt="Hero" style={styles.image} />
      <br></br>

     
    </section>
  );
};

const styles = {
  hero: {
    textAlign: "center",
    padding: "50px 20px",
    background: "linear-gradient(to bottom, #001F3F, #003366, #00509E, #87CEEB, white)", 
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
    maxWidth: "600px",
    height: "auto",
    borderRadius: "10px",
    marginTop: "20px",
  },
};

export default HeroSection;
