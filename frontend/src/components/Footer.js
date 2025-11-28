import React from 'react';
import '../styles/Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section">
            <h4>UnAI</h4>
            <p>Advanced deepfake detection and image regeneration powered by AI</p>
          </div>
          
          <div className="footer-section">
            <h4>Features</h4>
            <ul>
              <li>Deepfake Detection</li>
              <li>Image Regeneration</li>
              <li>Real-time Analysis</li>
              <li>Secure Processing</li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4>Technology</h4>
            <ul>
              <li>Deep Learning</li>
              <li>Computer Vision</li>
              <li>Neural Networks</li>
              <li>Machine Learning</li>
            </ul>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; 2025 UnAI. Created by <strong>Varun Kumar</strong>, <strong>Bhaumik</strong> & <strong>Krish</strong></p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
