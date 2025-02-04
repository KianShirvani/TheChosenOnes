import React from "react";

const FeaturesSection = () => {
  return (
    <section style={styles.container}>
      <h2>Why Choose Us?</h2>
      <div style={styles.grid}>
        <div style={styles.card}>
          <h3>Effortless Task Management</h3>
          <p>Organize and assign tasks with ease.</p>
        </div>
        <div style={styles.card}>
          <h3>Real-time Collaboration</h3>
          <p>Stay in sync with your team anytime, anywhere.</p>
        </div>
        <div style={styles.card}>
          <h3>Secure & Reliable</h3>
          <p>Your data is protected with industry-grade security.</p>
        </div>
      </div>
    </section>
  );
};

const styles = {
  container: {
    textAlign: "center",
    padding: "50px 20px",
  },
  grid: {
    display: "flex",
    justifyContent: "center",
    gap: "20px",
    flexWrap: "wrap",
  },
  card: {
    width: "300px",
    padding: "20px",
    border: "1px solid #ddd",
    borderRadius: "5px",
    background: "#f9f9f9",
  },
};

export default FeaturesSection;
