import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

const LoginBody = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    if (!username || !password) {
      alert("All fields must be filled!");
    } else {
      alert("Login successful!");
    }
  };

  return (
    <div style={styles.container} data-testid="login-body">
      <h2 style={styles.title}>User Login</h2>
      <div style={styles.form}>
        <Input
          type="text"
          placeholder="Username or Email"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={styles.input}
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
        />
        <Button style={styles.button} onClick={handleLogin}>
          Login
        </Button>
      </div>
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
    fontSize: "1.5rem",
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
  },
};

export default LoginBody;
