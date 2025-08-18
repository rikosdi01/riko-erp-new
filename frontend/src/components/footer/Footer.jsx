import React from 'react';
import { Mail, Phone } from 'lucide-react'; // Assuming you have lucide-react or a similar icon library
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="customer-footer">
      <div className="footer-container">
        <div className="footer-section company-info">
          <h4>CV. RIKO Parts</h4>
          <p className="company-tagline">Solusi Kebutuhan Spare Part Terpercaya.</p>
        </div>
        <div className="footer-section contact-info">
          <p>Hubungi Kami</p>
          <div className="contact-item">
            <Mail size={16} />
            <span>rikoparts@gmail.com</span>
          </div>
          <div className="contact-item">
            <Phone size={16} />
            <span>+62 812-3456-7890</span> {/* Contoh nomor telepon */}
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p className="footer-text">
          &copy; {currentYear} CV. RIKO Parts. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;