import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "./components/ui/input";
import { Button } from "./components/ui/button";

const SignupPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    // 模拟注册逻辑
    alert("Sign up successful!");
    navigate("/login");
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Create Account</h2>
      <form style={styles.form} onSubmit={handleSubmit}>
        <Input
          type="text"
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
          style={styles.input}
          required
        />
        <Input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          style={styles.input}
          required
        />
        <Input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          style={styles.input}
          required
        />
        <Input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          value={formData.confirmPassword}
          onChange={handleChange}
          style={styles.input}
          required
        />
        <Button type="submit" style={styles.button}>
          Sign Up
        </Button>
      </form>
      <p style={styles.link}>
        Already have an account? <span onClick={() => navigate("/login")} style={styles.loginLink}>Login here</span>
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
  input: {
    width: "100%",
    padding: "0.5rem",
    border: "1px solid #ccc",
    borderRadius: "0.5rem",
  },
  button: {
    width: "100%",
    backgroundColor: "#007bff",
    color: "white",
    padding: "0.75rem",
    border: "none",
    borderRadius: "0.5rem",
    cursor: "pointer",
  },
  link: {
    marginTop: "1rem",
    fontSize: "0.9rem",
  },
  loginLink: {
    color: "#007bff",
    cursor: "pointer",
    textDecoration: "underline",
  },
};

export default SignupPage;
