import React from "react";

const CallToAction = () => {
  return (
    <section style={styles.container}>
      <h2>Ready to Boost Your Productivity?</h2>
      <button style={styles.button} onClick={() => alert("Sign Up Now!")}>
        Sign Up Now
      </button>
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
};

export default CallToAction;
