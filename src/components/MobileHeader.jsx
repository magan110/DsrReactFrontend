import { Navbar, Container, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import useMobile from '../hooks/useMobile';

export default function MobileHeader({ title, showLogout = false, onLogout }) {
  const navigate = useNavigate();
  const { isMobile } = useMobile();

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <Navbar bg="dark" variant="dark" fixed="top" className="py-2">
      <Container fluid className="px-3">
        <div className="d-flex align-items-center">
          <Button
            variant="link"
            className="text-white p-0 me-3 text-decoration-none"
            onClick={handleBack}
            aria-label="Go back"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width={isMobile ? 24 : 20} 
              height={isMobile ? 24 : 20} 
              fill="currentColor" 
              viewBox="0 0 16 16"
            >
              <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"/>
            </svg>
          </Button>
          <Navbar.Brand className="mb-0 h1 fs-6">{title}</Navbar.Brand>
        </div>
        {showLogout && onLogout && (
          <Button 
            variant="outline-light" 
            size="sm"
            onClick={onLogout}
          >
            Logout
          </Button>
        )}
      </Container>
    </Navbar>
  );
}