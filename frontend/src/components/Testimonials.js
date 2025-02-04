import React from "react";

const Testimonials = () => {
  return (
    <section style={styles.container}>
      <h2>What Our Users Say</h2>
      <blockquote style={styles.quote}>
        "This platform has transformed the way our team collaborates!"
      </blockquote>
      <p>- John Doe, Project Manager</p>
    </section>
  );
};

const styles = {
  container: {
    textAlign: "center",
    padding: "50px 20px",
    background: "#e3f2fd",
  },
  quote: {
    fontStyle: "italic",
    fontSize: "18px",
  },
};

export default Testimonials;
