import React from "react";

const Footer = () => {
  return (
    <footer style={styles.footer}>
      <div style={styles.container}>
        <div style={styles.section}>
          <h4>About Collabium</h4>
          <p>What’s behind the boards.</p>
        </div>
        <div style={styles.section}>
          <h4>Jobs</h4>
          <p>Learn about open roles on the Collabium team.</p>
        </div>
        <div style={styles.section}>
          <h4>Apps</h4>
          <p>Download the Collabium App for your Desktop or Mobile devices.</p>
        </div>
        <div style={styles.section}>
          <h4>Contact us</h4>
          <p>Need anything? Get in touch and we can help.</p>
        </div>
      </div>
      <hr style={styles.divider} />
      <div style={styles.bottomContainer}>
        <p>English</p>
        <p>Privacy Policy</p>
        <p>Terms</p>
        <p>Copyright © 2024 TheChosenOnes</p>
      </div>
    </footer>
  );
};

const styles = {
  footer: {
    background: "#F4F5F7",
    padding: "20px 40px",
    marginTop: "auto",
  },
  container: {
    display: "flex",
    justifyContent: "space-between",
    flexWrap: "wrap",
  },
  section: {
    flex: "1",
    minWidth: "150px",
    margin: "10px 20px",
  },
  divider: {
    margin: "20px 0",
    border: "0.5px solid #ccc",
  },
  bottomContainer: {
    display: "flex",
    justifyContent: "space-between",
    flexWrap: "wrap",
    fontSize: "14px",
    color: "#5E6C84",
  },
};

export default Footer;
