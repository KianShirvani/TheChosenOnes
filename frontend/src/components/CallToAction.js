import React from "react";
import { useNavigate } from "react-router-dom";
const CallToAction = () => {
  const navigate = useNavigate();
  return (
    <section style={styles.container}>
      <h2 style={{ color: 'white' }}>Ready to Boost Your Productivity?</h2>
      <button style={styles.button} onClick={() => navigate("/signup")}>
       Get started
      </button>
    </section>
  );
};

const styles = {
  container: {
    textAlign: "center",
    padding: "50px 20px",
    background: "#7000da",
  },
  button: {
    padding: "12px 24px",
    fontSize: "18px",
    background: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  formContainer: {
    display: "flex",
    justifyContent: "center",
    gap: "10px", // Adds space between input and button
    marginTop: "20px",
  },
  input: {
    padding: "12px",
    fontSize: "16px",
    border: "1px solid #ccc",
    borderRadius: "5px",
    outline: "none",
    width: "250px",
  },
};

export default CallToAction;
