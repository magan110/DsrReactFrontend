import React from 'react';
import { Container, Card, Alert } from 'react-bootstrap';

const DsrCascPage = () => {
  return (
    <Container fluid className="p-3">
      <h3 className="fw-bold mb-3">CASC - Architect/Engineer DSR Entry</h3>
      <Alert variant="info">
        CASC DSR functionality coming soon. This module handles visits to Architects and Engineers.
      </Alert>
      <Card className="p-4">
        <p>This page will contain:</p>
        <ul>
          <li>Mobile number lookup for existing contacts</li>
          <li>New Engineer/Architect registration</li>
          <li>Sampling Lead, Sale Lead, GRC Lead tracking</li>
          <li>Location capture and validation</li>
        </ul>
      </Card>
    </Container>
  );
};

export default DsrCascPage;