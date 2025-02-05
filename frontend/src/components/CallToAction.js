import React from "react";

const CallToAction = () => {
  return (
    <section style={styles.container}>
      <h2>Ready to Boost Your Productivity?</h2>
      <div style={styles.formContainer}>
        <input type="email" placeholder="Email" style={styles.input} />
        <button style={styles.button} onClick={() => alert("Sign Up Now!")}>
        Sign Up Now
      </button>
      </div>
    </section>
  );
};

const styles = {
  container: {
    textAlign: "center",
    padding: "50px 20px",
    background: "#ffcc00",
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
