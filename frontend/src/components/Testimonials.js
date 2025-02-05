import React from "react";

const Testimonials = () => {

const testimonials = [
  {quote:"This platform has transformed the way our team collaborates!", author:"John Doe, Project Manager",},
  {quote:"Using Collabium helped me to maximize the work efficiency in my workplace!", author:"Johny English, Team Lead",},
  {quote:"Intuitive, fast and flexible, Collabium reshaped team-based task management", author:"Norman Osborn, CEO",}
];

  return (
    <section style={styles.container}>
      <h2>What Our Users Say</h2>
     <div style={styles.testimonials}>
      {
        testimonials.map((testimonial, index) => (
          <div key = {index} style={styles.testimonial}>
            <blockquote style={styles.quote}>"{testimonial.quote}"</blockquote>
            <p style={styles.author}>{testimonial.author}</p>
          </div>
        ))
      }
     </div>
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
  testimonials: {
    display: "flex",
    justifyContent: "center",
    gap: "20px",
    marginTop: "20px",
    flexWrap: "wrap", // Allows wrapping if the screen is too small
  },
  testimonial: {
    flex: "1",
    maxWidth: "300px",
    padding: "20px",
    background: "white",
    borderRadius: "10px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
  },
  author: {
    fontWeight: "bold",
  },
};

export default Testimonials;
