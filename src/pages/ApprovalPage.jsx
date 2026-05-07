import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Button, Alert, Modal, Form } from 'react-bootstrap';
import { approvalApi } from '../api/dsrApi';

const ApprovalPage = () => {
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedDsr, setSelectedDsr] = useState(null);
  const [remarks, setRemarks] = useState('');

  useEffect(() => {
    fetchPendingApprovals();
  }, []);

  const fetchPendingApprovals = async () => {
    setLoading(true);
    try {
      const response = await approvalApi.getPendingApprovals();
      setPendingApprovals(response.data || []);
    } catch (error) {
      console.error('Error fetching approvals:', error);
      setMessage('Error fetching pending approvals');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (docuNumb) => {
    try {
      await approvalApi.approveDsr(docuNumb, '');
      setMessage(`DSR ${docuNumb} approved successfully`);
      fetchPendingApprovals();
    } catch (error) {
      setMessage('Error approving DSR');
    }
  };

  const handleReject = async () => {
    try {
      await approvalApi.rejectDsr(selectedDsr, remarks);
      setMessage(`DSR ${selectedDsr} rejected`);
      setShowRejectModal(false);
      setRemarks('');
      fetchPendingApprovals();
    } catch (error) {
      setMessage('Error rejecting DSR');
    }
  };

  return (
    <Container fluid className="p-3">
      <h3 className="fw-bold mb-3">DSR Approvals</h3>

      {message && (
        <Alert variant="info" dismissible onClose={() => setMessage('')}>
          {message}
        </Alert>
      )}

      <Card>
        <Card.Header>
          <h5 className="mb-0">Pending Approvals</h5>
        </Card.Header>
        <Card.Body>
          {loading ? (
            <div className="text-center py-4">Loading...</div>
          ) : pendingApprovals.length === 0 ? (
            <div className="text-center text-muted py-4">No pending approvals</div>
          ) : (
            <Table bordered hover responsive>
              <thead>
                <tr>
                  <th>Document No</th>
                  <th>Employee</th>
                  <th>Activity</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingApprovals.map((item, index) => (
                  <tr key={index}>
                    <td>{item.docuNumb}</td>
                    <td>{item.employeeName}</td>
                    <td>{item.activityType}</td>
                    <td>{item.docuDate}</td>
                    <td>
                      <Button
                        variant="success"
                        size="sm"
                        className="me-2"
                        onClick={() => handleApprove(item.docuNumb)}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => {
                          setSelectedDsr(item.docuNumb);
                          setShowRejectModal(true);
                        }}
                      >
                        Reject
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Reject Modal */}
      <Modal show={showRejectModal} onHide={() => setShowRejectModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Reject DSR - {selectedDsr}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Remarks</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Enter rejection reason"
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRejectModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleReject} disabled={!remarks.trim()}>
            Confirm Reject
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ApprovalPage;