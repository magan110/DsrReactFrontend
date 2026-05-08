import { useState, useEffect } from 'react';
import { Table, Button, Form, Row, Col, Card, Alert, Pagination } from 'react-bootstrap';
import { dsrApi } from '../services/dsrApi';

export default function DsrActivityList() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [activityTypes, setActivityTypes] = useState([]);
  
  const [filters, setFilters] = useState({
    dsrParam: '',
    areaCode: '',
    docuDate: '',
    createId: '',
  });

  const loadOptions = async () => {
    try {
      const response = await dsrApi.getActivityTypes();
      setActivityTypes(response.data);
    } catch {
      console.error('Error loading options');
    }
  };

  const loadActivities = async () => {
    try {
      setLoading(true);
      const params = {
        ...filters,
        page,
        size: 30,
      };
      Object.keys(params).forEach(key => {
        if (!params[key]) delete params[key];
      });
      
      const response = await dsrApi.getActivities(params);
      setActivities(response.data.content);
      setTotalPages(response.data.totalPages);
    } catch {
      setMessage('Error loading activities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActivities();
    loadOptions();
  }, [page]);

  useEffect(() => {
    loadActivities();
  }, [filters]);

  const handleDelete = async (docuNumb) => {
    if (!window.confirm('Are you sure you want to delete this activity?')) return;
    
    try {
      await dsrApi.deleteActivity(docuNumb);
      setMessage('Activity deleted successfully');
      loadActivities();
    } catch {
      setMessage('Error deleting activity');
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = () => {
    setPage(0);
    loadActivities();
  };

  const handleClear = () => {
    setFilters({
      dsrParam: '',
      areaCode: '',
      docuDate: '',
      createId: '',
    });
    setPage(0);
  };

  const getActivityTypeDesc = (code) => {
    const type = activityTypes.find(t => t.code === code);
    return type ? type.description : code;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-GB');
  };

  return (
    <div className="container-fluid py-4">
      <h4 className="mb-4">DSR Activities</h4>
      
      {message && (
        <Alert variant={message.includes('Error') ? 'danger' : 'success'} dismissible onClose={() => setMessage('')}>
          {message}
        </Alert>
      )}

      <Card className="mb-3">
        <Card.Header>Filters</Card.Header>
        <Card.Body>
          <Row>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Activity Type</Form.Label>
                <Form.Select name="dsrParam" value={filters.dsrParam} onChange={handleFilterChange}>
                  <option value="">All</option>
                  {activityTypes.map((type) => (
                    <option key={type.code} value={type.code}>{type.description}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            
            <Col md={3}>
              <Form.Group>
                <Form.Label>Area Code</Form.Label>
                <Form.Control type="text" name="areaCode" value={filters.areaCode} onChange={handleFilterChange} placeholder="Area Code" />
              </Form.Group>
            </Col>
            
            <Col md={3}>
              <Form.Group>
                <Form.Label>Date</Form.Label>
                <Form.Control type="date" name="docuDate" value={filters.docuDate} onChange={handleFilterChange} />
              </Form.Group>
            </Col>
            
            <Col md={3} className="d-flex align-items-end gap-2">
              <Button variant="primary" onClick={handleSearch}>Search</Button>
              <Button variant="secondary" onClick={handleClear}>Clear</Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card>
        <Card.Body>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Doc No</th>
                <th>Date</th>
                <th>Activity Type</th>
                <th>Customer</th>
                <th>Area</th>
                <th>Topic</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" className="text-center">Loading...</td></tr>
              ) : activities.length === 0 ? (
                <tr><td colSpan="7" className="text-center">No records found</td></tr>
              ) : (
                activities.map((activity) => (
                  <tr key={activity.docuNumb}>
                    <td>{activity.docuNumb}</td>
                    <td>{formatDate(activity.docuDate)}</td>
                    <td>{getActivityTypeDesc(activity.dsrParam)}</td>
                    <td>{activity.cusRtlCd || '-'}</td>
                    <td>{activity.areaCode || '-'}</td>
                    <td>{activity.dsrRem01 || '-'}</td>
                    <td>
                      <Button variant="info" size="sm" className="me-1" onClick={() => window.location.href = `/dsr/edit/${activity.docuNumb}`}>Edit</Button>
                      <Button variant="danger" size="sm" onClick={() => handleDelete(activity.docuNumb)}>Delete</Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
          
          {totalPages > 1 && (
            <div className="d-flex justify-content-center">
              <Pagination>
                <Pagination.Prev disabled={page === 0} onClick={() => setPage(p => p - 1)} />
                <Pagination.Item active>{page + 1} / {totalPages}</Pagination.Item>
                <Pagination.Next disabled={page === totalPages - 1} onClick={() => setPage(p => p + 1)} />
              </Pagination>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}