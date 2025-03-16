import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";

const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email.trim() || !formData.password.trim()) {
        alert("All fields must be filled!");
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
        alert("Invalid email format");
        return;
    }

    try {
        const response = await axios.post(`${process.env.REACT_APP_API_URL}/auth/login`, {
            email: formData.email,
            password: formData.password,
        });
        console.log("Login Response:", response.data);
        if (response.data.token) {
          localStorage.setItem("userToken", response.data.token);
          localStorage.setItem("role", response.data.role);  // Store role
          alert("Login successful!");

          // Ensure the navigation happens AFTER setting the localStorage
          setTimeout(() => {
            const userRole = localStorage.getItem("role");
            console.log("Stored Role:", userRole); 
              if (response.data.role === "admin") {
                  navigate("/admindashboard");
              } else {
                  navigate("/tasks");
              }
              window.location.reload();  // Force a UI update
          }, 500); // Small delay to ensure state updates before navigation
      } else {
          alert("Login failed!");
      }
  } catch (error) {
      alert("Login failed! Please try again later.");
      console.error("Login error:", error);
  }
};



  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Login</h2>
      <form style={styles.form} onSubmit={handleSubmit}>
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
      </form>
      <p style={styles.link}>
        Don't have an account? <span onClick={() => navigate("/signup")} style={styles.signupLink}>Sign up here</span>
      </p>
    </div>
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