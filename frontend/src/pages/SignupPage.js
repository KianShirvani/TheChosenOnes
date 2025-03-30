import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";

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

  // dynamically load Toastify CSS + JS from CDN at runtime, no install required
    useEffect(() => {
      document.title = "Create an Account - Collabium";
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://cdn.jsdelivr.net/npm/toastify-js/src/toastify.min.css";
      document.head.appendChild(link);
  
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/toastify-js";
      document.body.appendChild(script);
    }, []);

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.username.trim()){
      window.Toastify({ text: "Please enter a username", duration: 6000, gravity: "bottom", position: "center", style: { background: "#F62424"}}).showToast();
      return;
    }else if (!formData.firstName.trim()){
      window.Toastify({ text: "Please enter your first name", duration: 6000, gravity: "bottom", position: "center", style: { background: "#F62424"}}).showToast();
      return;
    }else if (!formData.lastName.trim()){
      window.Toastify({ text: "Please enter your last name", duration: 6000, gravity: "bottom", position: "center", style: { background: "#F62424"}}).showToast();
      return;
    }else if (!formData.email.trim()){
      window.Toastify({ text: "Please enter your email address", duration: 6000, gravity: "bottom", position: "center", style: { background: "#F62424"}}).showToast();
      return;
    }else if (!formData.phoneNum.trim()){
      window.Toastify({ text: "Please enter your phone number", duration: 6000, gravity: "bottom", position: "center", style: { background: "#F62424"}}).showToast();
      return;
    }else if (!formData.country){
      window.Toastify({ text: "Please select a country", duration: 6000, gravity: "bottom", position: "center", style: { background: "#F62424"}}).showToast();
      return;
    }else if (!formData.password.trim()){
      window.Toastify({ text: "Please enter a password", duration: 6000, gravity: "bottom", position: "center", style: { background: "#F62424"}}).showToast();
      return;
    }else if(!formData.confirmPassword.trim()){
      window.Toastify({ text: "Please confirm the password", duration: 6000, gravity: "bottom", position: "center", style: { background: "#F62424"}}).showToast();
      return;
    }
  
    //  Add email validation using regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      // alert("Invalid email format");
      window.Toastify({ text: "Please enter a valid email address", duration: 6000, gravity: "bottom", position: "center", style: { background: "#F62424"}}).showToast();
      return;
    }

    if (formData.password.length < 8) {
      // alert("Password must be at least 8 characters long");
      window.Toastify({ text: "Password must be at least 8 characters long", duration: 6000, gravity: "bottom", position: "center", style: { background: "#F62424"}}).showToast();
      return;
    }
  
    if (formData.password !== formData.confirmPassword) {
      // alert("Passwords do not match");
      window.Toastify({ text: "Passwords do not match", duration: 6000, gravity: "bottom", position: "center", style: { background: "#F62424"}}).showToast();
      return;
    }
  
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/register`, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phoneNum: formData.phoneNum,
        country: formData.country,
        displayName: formData.username,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });
      setMessage(response.data.message);
      // alert("Sign up successful!");
      window.Toastify({ text: "Sign up successful, please log in", duration: 6000, gravity: "top", position: "center"}).showToast();
      navigate("/login");
    } catch (error) {
      setMessage(error.response.data.error || 'An error occurred');
      // alert("Sign up failed!");
      window.Toastify({ text: "Sign up failed", duration: 6000, gravity: "bottom", position: "center", style: { background: "#F62424"}}).showToast();
    }
  };
  
  

  return (
    <>
      <div style={styles.container}>
        <h2 style={styles.title}>Create Account</h2>
        <form noValidate style={styles.form} onSubmit={handleSubmit}> {/* noValidate turn off the form alert to use Toastify-js */}
          <label style={styles.label}>
            <Input
              type="text"
              name="username"
              placeholder=""
              value={formData.username}
              onChange={handleChange}
              style={styles.input}
              required
            />
            <span style={formData.username ? styles.floatingLabel : styles.spanLabel}>
                Username
              </span>
          </label>
          <div style={styles.row}>
            <label style={styles.label}>
              <Input
                type="text"
                name="firstName"
                placeholder=""
                value={formData.firstName}
                onChange={handleChange}
                style={styles.input}
                required
              />
              <span style={formData.firstName ? styles.floatingLabel : styles.spanLabel}>
                First name
              </span>
            </label>
            <label style={styles.label}>
              <Input
                type="text"
                name="lastName"
                placeholder=""
                value={formData.lastName}
                onChange={handleChange}
                style={styles.input}
                required
              />
              <span style={formData.lastName ? styles.floatingLabel : styles.spanLabel}>
                Last name
              </span>
            </label>
          </div>
          <div style={styles.row}>
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
                type="tel"
                name="phoneNum"
                placeholder=""
                value={formData.phoneNum}
                onChange={handleChange}
                style={styles.input}
                required
              />
              <span style={formData.phoneNum ? styles.floatingLabel : styles.spanLabel}>
                Phone number
              </span>
            </label>
          </div>
          <select
            className="country-select"
            name="country" 
            value={formData.country} 
            onChange={handleChange} 
            style={styles.select}
            required
          >
            {/* these countries can change. We can also add or remove more */}
            <option value="">Select a country</option>
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
          <label style={styles.label}>
            <Input
              type="password"
              name="confirmPassword"
              placeholder=""
              value={formData.confirmPassword}
              onChange={handleChange}
              style={styles.input}
              required
            />
            <span style={formData.confirmPassword ? styles.floatingLabel : styles.spanLabel}>
              Confirm password
            </span>
          </label>
          
          
          <Button type="submit" style={styles.button}>
            Sign Up
          </Button>
        </form>
        <p style={styles.link}>
          Already have an account? <span onClick={() => navigate("/login")} style={styles.loginLink}>Login here</span>
        </p>
      </div>
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
    width: "97.5%",
    display: "flex",
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
  loginLink: {
    color: "#8d15fd",
    cursor: "pointer",
    textDecoration: "underline",
  },
};

export default SignupPage;