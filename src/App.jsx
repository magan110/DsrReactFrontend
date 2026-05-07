import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import DsrActivityPage from './pages/DsrActivityPage';
import DsrCascPage from './pages/DsrCascPage';
import ApprovalPage from './pages/ApprovalPage';

const App = () => {
  return (
    <Router>
      <div className="d-flex flex-column min-vh-100">
        <Header />
        <Container fluid className="flex-grow-1">
          <Routes>
            <Route path="/" element={<DsrActivityPage />} />
            <Route path="/dsr/new" element={<DsrActivityPage />} />
            <Route path="/dsr/casc" element={<DsrCascPage />} />
            <Route path="/dsr/approvals" element={<ApprovalPage />} />
            <Route path="/dsr/leave" element={<DsrActivityPage defaultActivity="54" />} />
          </Routes>
        </Container>
        <Footer />
      </div>
    </Router>
  );
};

export default App;