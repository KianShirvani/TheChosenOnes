import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { motion } from "framer-motion";

const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // dynamically load Toastify CSS + JS from CDN at runtime, no install required
  useEffect(() => {
    document.title = "Login - Collabium";
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://cdn.jsdelivr.net/npm/toastify-js/src/toastify.min.css";
    document.head.appendChild(link);

    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/toastify-js";
    document.body.appendChild(script);
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!formData.email.trim() || !formData.password.trim()) {
      window.Toastify({ text: "Please enter your email and password.", duration: 6000, gravity: "bottom", position: "center", style: { background: "#F62424"} }).showToast();
      return;
    }
  
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      window.Toastify({ text: "Please enter a valid email address", duration: 6000, gravity: "bottom", position: "center", style: { background: "#F62424"} }).showToast();
      return;
    }
  
    try {
      const requestData = {
        email: formData.email,
        password: formData.password,
      };
      console.log("Sending login request:", requestData); 
  
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/auth/login`,
        requestData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
  
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("role", response.data.role);
        console.log("Token saved:", response.data.token);
        console.log("Role saved:", response.data.role);
        window.Toastify({ text: "Login Successful!", duration: 6000, gravity: "top", position: "center" }).showToast();
        navigate("/tasks");
      } else {
        console.error("Login successful but no token received.");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || "Login failed! Please try again later.";
      window.Toastify({ text: "Email or password is incorrect.", duration: 6000, gravity: "bottom", position: "center", style: { background: "#F62424"} }).showToast();
      console.error("Login error:", error.response?.data || error.message);
    }
  };


    return (
      <motion.div
        style={styles.container}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <motion.h2
          style={styles.title}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          Login
        </motion.h2>

        <motion.form
          noValidate
          style={styles.form}
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <label style={styles.label}>
            <Input
              type="email"
              name="email"
              placeholder=""
              value={formData.email}
              onChange={handleChange}
              style={styles.input}
              required
            />
            <span style={formData.email ? styles.floatingLabel : styles.spanLabel}>
              Email
            </span>
          </label>
          <label style={styles.label}>
            <Input
              type="password"
              name="password"
              placeholder=""
              value={formData.password}
              onChange={handleChange}
              style={styles.input}
              required
            />
            <span style={formData.password ? styles.floatingLabel : styles.spanLabel}>
              Password
            </span>
          </label>
          <Button type="submit" style={styles.button}>
            Login
          </Button>
        </motion.form>

        <motion.p
          style={styles.link}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          Don't have an account?{" "}
          <span onClick={() => navigate("/signup")} style={styles.signupLink}>
            Sign up here
          </span>
        </motion.p>

        <motion.p
          style={styles.link}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <span onClick={() => navigate("/forgot-password")} style={styles.signupLink}>
            Forgot password
          </span>
        </motion.p>
      </motion.div>
    );

};

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
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
  link: {
    marginTop: "1rem",
    fontSize: "0.9rem",
  },
  signupLink: {
    color: "#8d15fd",
    cursor: "pointer",
    textDecoration: "underline",
  },
};

export default LoginPage;