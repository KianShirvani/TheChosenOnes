import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";


const LoginBody = () => {
  return(
    <div style={styles.container}>
      <h2>User Login</h2>
      <div>
        <Input type="text" placeholder="Username or Email" style={styles.input}/>
        <Input type="password" placeholder="Password" style={styles.input}/>
        <Button style={styles.button}>Login</Button>
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

export default LoginBody