import React from "react";
import '../footer.css';

const Footer = () => {
  return (
    <footer data-testid="footer">
    <footer className="footer">  
      <div className="container">
        <div className="section">
          <h4>About Collabium</h4>
          <p>What’s behind the boards.</p>
        </div>
        <div className="section">
          <h4>Jobs</h4>
          <p>Learn about open roles on the Collabium team.</p>
        </div>
        <div className="section">
          <h4>Apps</h4>
          <p>Download the Collabium App for your Desktop or Mobile devices.</p>
        </div>
        <div className="section">
          <h4>Contact us</h4>
          <p>Need anything? Get in touch and we can help.</p>
        </div>
      </div>
      <hr className="divider" />
      <div className="bottomContainer">
        <p>English</p>
        <p>Privacy Policy</p>
        <p>Terms</p>
        <p>Copyright © 2024 TheChosenOnes</p>
      </div>
    </footer>
    </footer>
  );
};

export default Footer;
