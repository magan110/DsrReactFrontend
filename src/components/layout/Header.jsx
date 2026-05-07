import React from 'react';
import { Navbar, Container, Nav } from 'react-bootstrap';

const Header = () => {
  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="mb-3">
      <Container fluid>
        <Navbar.Brand href="/">
          <img
            src="/images/birla-white-logo.png"
            alt="Birla White"
            height="30"
            className="d-inline-block align-top me-2"
          />
          DSR Portal
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="main-navbar" />
        <Navbar.Collapse id="main-navbar">
          <Nav className="me-auto">
            <Nav.Link href="/dsr/new">New DSR Entry</Nav.Link>
            <Nav.Link href="/dsr/casc">CASC DSR Entry</Nav.Link>
            <Nav.Link href="/dsr/approvals">Approvals</Nav.Link>
            <Nav.Link href="/dsr/reports">Reports</Nav.Link>
          </Nav>
          <Nav>
            <Nav.Link disabled className="text-light">
              User: 2948 | Area: JDP
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;