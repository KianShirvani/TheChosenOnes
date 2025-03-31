import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

const styles = {
    container: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start", 
        marginTop: "3rem",
        marginBottom: "3rem",
        padding: "1rem",
      },
  title: {
    fontSize: "1.8rem",
    fontWeight: "bold",
    marginBottom: "1rem",
  },
  form: {
    width: "100%",
    maxWidth: "20rem",
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  label: {
    position: "relative",
    display: "block",
    width: "100%",
  },
  spanLabel: {
    position: "absolute",
    left: "10px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#000",
    fontSize: "16px",
    transition: "all 0.3s ease",
    pointerEvents: "none",
  },
  floatingLabel: {
    position: "absolute",
    left: "10px",
    top: "-10px",
    fontSize: "12px",
    color: "#7000da",
    transition: "all 0.3s ease",
    pointerEvents: "none",
  },
  input: {
    width: "95%",
    padding: "0.5rem",
    background: "transparent",
    border: "none",
    borderRadius: 0,
    borderBottom: "2px solid #7000da",
    transition: "all 0.3s ease-in-out",
    outline: "none",
  },
  textarea: {
    width: "100%",
    padding: "0.5rem",
    background: "#fff",
    border: "2px solid #7000da",
    borderRadius: "0.5rem",
    resize: "vertical",
    outline: "none",
  },
  button: {
    width: "100%",
    backgroundColor: "#7000da",
    color: "white",
    marginTop: "10px",
    padding: "0.75rem",
    border: "none",
    borderRadius: "0.5rem",
    cursor: "pointer",
    transition: "0.3s",
    boxShadow: "0 0 10px rgba(112, 0, 218, 1)",
  },
  message: {
    marginTop: "1rem",
    textAlign: "center",
    fontSize: "0.9rem",
    color: "#7000da",
  },
};

const Contact = () => {
  const [result, setResult] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault()
    setResult("Sending...")
    const payload = new FormData()
    Object.entries(formData).forEach(([key, value]) => {
      payload.append(key, value)
    })
    payload.append("access_key", "9a695561-b193-47e6-8edf-d242838aa8de")

    const response = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      body: payload,
    })

    const data = await response.json()

    if (data.success) {
      setResult("Form submitted successfully!")
      setFormData({ name: "", email: "", message: "" })
    } else {
      setResult(data.message || "Something went wrong.")
    }
  }

  return (
        <motion.div
        id="contact"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
        viewport={{ once: true }}
        style={styles.container}
        >

      <h2 style={styles.title}>Contact Us</h2>
      <form onSubmit={onSubmit} style={styles.form}>
        {/* Name Input */}
        <label style={styles.label}>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder=""
            style={styles.input}
          />
          <span style={formData.name ? styles.floatingLabel : styles.spanLabel}>
            Your Name
          </span>
        </label>

        {/* Email Input */}
        <label style={styles.label}>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder=""
            style={styles.input}
          />
          <span style={formData.email ? styles.floatingLabel : styles.spanLabel}>
            Your Email
          </span>
        </label>

        {/* Message */}
        <label style={styles.label}>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
            rows="5"
            placeholder="Your Message"
            style={styles.textarea}
          />
        </label>

        <button type="submit" style={styles.button}>Submit Now</button>
        <p style={styles.message}>{result}</p>
      </form>
    </motion.div>
  )
}

export default Contact
