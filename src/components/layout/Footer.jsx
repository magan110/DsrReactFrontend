import React from 'react';
import { Container } from 'react-bootstrap';

const Footer = () => {
  return (
    <footer className="bg-light py-3 mt-4 border-top">
      <Container fluid>
        <div className="d-flex justify-content-between align-items-center">
          <div className="text-muted small">
            &copy; {new Date().getFullYear()} Birla White. All rights reserved.
          </div>
          <div className="text-muted small">
            Version 1.0 | DSR Module
          </div>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;