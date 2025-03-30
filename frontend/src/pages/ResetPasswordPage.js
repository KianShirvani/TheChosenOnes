import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');

   useEffect(() => {
    document.title = "Reset Password - Collabium";
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/auth/reset-password`, {
        token,
        newPassword,
      });
      setMessage(response.data.message);
      navigate('/login');
    } catch (error) {
      setMessage(error.response?.data?.error || 'An error occurred');
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Reset Password</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <label style={styles.label}>
          <span style={styles.spanLabel}>New Password</span>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            style={styles.input}
          />
        </label>
        <button type="submit" style={styles.button}>Reset Password</button>
      </form>
      {message && <p style={styles.link}>{message}</p>}
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    minHeight: "70vh",
    padding: "1rem",
    marginTop: "100px"
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
    color: "#7000da",
  },
};

export default ResetPasswordPage;