import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import DsrActivityForm from './components/DsrActivityForm';
import DsrActivityList from './components/DsrActivityList';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dsr" replace />} />
        <Route path="/dsr" element={<DsrActivityForm />} />
        <Route path="/dsr/list" element={<DsrActivityList />} />
        <Route path="/dsr/edit/:docuNumb" element={<DsrActivityForm />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;