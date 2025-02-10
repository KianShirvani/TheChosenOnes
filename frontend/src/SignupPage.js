import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "./components/ui/input";
import { Button } from "./components/ui/button";
import Footer from "./components/Footer";

const SignupPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "", // display_name in users table
    firstName: "",
    lastName: "",
    email: "",
    phoneNum: "",
    country: "",
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
    <>
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
          <div style={styles.row}>
            <Input
              type="text"
              name="firstName"
              placeholder="First name"
              value={formData.firstName}
              onChange={handleChange}
              style={styles.input}
              required
            />
            <Input
              type="text"
              name="lastName"
              placeholder="Last name"
              value={formData.lastName}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>
          <div style={styles.row}>
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
              type="tel"
              name="phoneNum"
              placeholder="Phone number"
              value={formData.phoneNum}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>
          
          <select
            class="country-select"
            onChange={handleChange}
            style={styles.select}
            required
          >
            {/* these countries can change. We can also add or remove more */}
            <option value="Afghanistan">Afghanistan</option>
            <option value="Antarctica">Antarctica</option>
            <option value="Australia">Australia</option>
            <option value="Canada">Canada</option>
            <option value="Christmas Island">Christmas Island</option>
            <option value="Czech Republic">Czech Republic</option>
            <option value="Greece">Greece</option> 
            <option value="Greenland">Greenland</option>
            <option value="Lithuania">Lithuania</option> 
            <option value="Luxembourg">Luxembourg</option>
            <option value="Panama">Panama</option> 
            <option value="Papua New Guinea">Papua New Guinea</option>
            <option value="Sweden">Sweden</option> 
            <option value="Switzerland">Switzerland</option>
            <option value="United States">United States</option>
          </select>
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
      <Footer />
    </>
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
  row: {
    display: "flex",
    gap: "1rem",
  },
  input: {
    width: "95%",
    padding: "0.5rem",
    border: "none",
    borderRadius: 0,
    borderBottom: "2px solid #7000da",
    transition: "all 0.3s ease-in-out",
    outline: "none",
  },
  select: {
    width: "100%",
    padding: "0.5rem",
    border: "2px solid #7000da",
    borderRadius: "0.5rem",
  },
  button: {
    width: "100%",
    backgroundColor: "#7000da",
    color: "white",
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
  loginLink: {
    color: "#8d15fd",
    cursor: "pointer",
    textDecoration: "underline",
  },
};

export default SignupPage;