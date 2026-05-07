import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Nav, Tab, Button, Alert, Spinner } from 'react-bootstrap';
import ProcessTypeSelector from '../components/dsr/ProcessTypeSelector';
import ActivitySelector from '../components/dsr/ActivitySelector';
import CustomerSelector from '../components/dsr/CustomerSelector';
import DsrRemarks from '../components/dsr/DsrRemarks';
import MarketData from '../components/dsr/MarketData';
import OrderDetails from '../components/dsr/OrderDetails';
import MarketPricing from '../components/dsr/MarketPricing';
import LocationCapture from '../components/dsr/LocationCapture';
import ImageUpload from '../components/dsr/ImageUpload';
import GiftDistribution from '../components/dsr/GiftDistribution';
import Instructions from '../components/dsr/Instructions';
import { dsrApi } from '../api/dsrApi';
import { useDsrForm } from '../hooks/useDsrForm';

const DsrActivityPage = () => {
  const {
    formData,
    setFormData,
    errors,
    setErrors,
    submitting,
    setSubmitting,
    message,
    setMessage,
    resetForm
  } = useDsrForm();

  const [activeTab, setActiveTab] = useState('basic');
  const [recentDsr, setRecentDsr] = useState([]);
  const [validationErrors, setValidationErrors] = useState([]);

  useEffect(() => {
    if (formData.procType === 'U') {
      fetchRecentDsr();
    }
  }, [formData.procType]);

  const fetchRecentDsr = async () => {
    try {
      const response = await dsrApi.getRecentDsr();
      setRecentDsr(response.data);
    } catch (error) {
      console.error('Error fetching recent DSR:', error);
    }
  };

  const handleActivityChange = useCallback((dsrParam) => {
    if (dsrParam === '04' || dsrParam === '05') {
      setFormData(prev => ({ ...prev, dsrParam }));
    } else if (dsrParam === '54') {
      window.location.href = '/dsr/leave';
    } else if (dsrParam === '06') {
      window.location.href = '/dsr/casc';
    } else {
      setFormData(prev => ({ ...prev, dsrParam }));
    }
  }, [setFormData]);

  const handleSubmit = async (submitType) => {
    setSubmitting(true);
    setErrors({});
    setMessage('');

    try {
      let response;
      const submitData = {
        ...formData,
        submMthd: submitType
      };

      if (formData.procType === 'A') {
        response = await dsrApi.createActivity(submitData);
      } else if (formData.procType === 'U') {
        response = await dsrApi.updateActivity(formData.docuNumb, submitData);
      } else if (formData.procType === 'D') {
        response = await dsrApi.deleteActivity(formData.docuNumb);
      }

      if (response?.data) {
        setMessage(`Document saved successfully. Document No: ${response.data.docuNumb}`);
        
        if (submitType === 'A') {
          resetForm();
          setActiveTab('basic');
        } else {
          setActiveTab('basic');
        }
      }
    } catch (error) {
      if (error.response?.data?.errors) {
        setValidationErrors(error.response.data.errors);
        setMessage(error.response.data.message || 'Validation failed');
      } else {
        setMessage('Error submitting DSR. Please try again.');
      }
      setActiveTab('basic');
    } finally {
      setSubmitting(false);
    }
  };

  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            geoLatit: position.coords.latitude.toString(),
            geoLongt: position.coords.longitude.toString()
          }));
        },
        (error) => {
          console.log('Location not available:', error);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  }, []);

  return (
    <Container fluid className="p-3">
      <div className="mb-4">
        <h3 className="fw-bold mb-2">Daily Sales Report (DSR) Entry</h3>
        <Instructions dsrParam={formData.dsrParam} />
      </div>

      {message && (
        <Alert variant={validationErrors.length > 0 ? 'danger' : 'success'} 
               dismissible 
               onClose={() => setMessage('')}>
          <Alert.Heading>{message}</Alert.Heading>
          {validationErrors.length > 0 && (
            <ul className="mb-0">
              {validationErrors.map((err, index) => (
                <li key={index}>{err}</li>
              ))}
            </ul>
          )}
        </Alert>
      )}

      {formData.isAuthorized !== false && (
        <Tab.Container activeKey={activeTab} onSelect={setActiveTab}>
          <Row>
            <Col lg={3}>
              <Nav variant="pills" className="flex-column mb-3">
                <Nav.Item>
                  <Nav.Link eventKey="basic">Basic Details</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="market">Market Data</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="orders">Order Details</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="photos">Photos</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="location">Location</Nav.Link>
                </Nav.Item>
              </Nav>
            </Col>

            <Col lg={9}>
              <Tab.Content>
                <Tab.Pane eventKey="basic">
                  <Card className="mb-3">
                    <Card.Header>
                      <h5 className="card-title mb-0">Basic Details</h5>
                    </Card.Header>
                    <Card.Body>
                      <Row>
                        <Col md={6}>
                          <ProcessTypeSelector
                            value={formData.procType}
                            onChange={(val) => setFormData(prev => ({ ...prev, procType: val }))}
                            error={errors.procType}
                          />
                        </Col>

                        {formData.procType !== 'A' && (
                          <Col md={6}>
                            <div className="mb-3">
                              <label className="form-label">Document No *</label>
                              <select
                                className="form-select"
                                value={formData.docuNumb}
                                onChange={(e) => {
                                  setFormData(prev => ({ ...prev, docuNumb: e.target.value }));
                                }}
                              >
                                <option value="">Select Document</option>
                                {recentDsr.map((dsr) => (
                                  <option key={dsr.docuNumb} value={dsr.docuNumb}>
                                    {dsr.dsrParamDesc} ~ {dsr.docuNumb}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </Col>
                        )}

                        <Col md={6}>
                          <ActivitySelector
                            value={formData.dsrParam}
                            onChange={handleActivityChange}
                            error={errors.dsrParam}
                          />
                        </Col>
                      </Row>

                      <hr />

                      <CustomerSelector
                        formData={formData}
                        setFormData={setFormData}
                        errors={errors}
                      />

                      <DsrRemarks
                        formData={formData}
                        setFormData={setFormData}
                        errors={errors}
                      />
                    </Card.Body>
                  </Card>
                </Tab.Pane>

                <Tab.Pane eventKey="market">
                  <MarketData
                    formData={formData}
                    setFormData={setFormData}
                    errors={errors}
                  />
                </Tab.Pane>

                <Tab.Pane eventKey="orders">
                  <OrderDetails
                    formData={formData}
                    setFormData={setFormData}
                  />
                  <GiftDistribution
                    formData={formData}
                    setFormData={setFormData}
                  />
                  <MarketPricing
                    formData={formData}
                    setFormData={setFormData}
                  />
                </Tab.Pane>

                <Tab.Pane eventKey="photos">
                  <ImageUpload
                    formData={formData}
                    setFormData={setFormData}
                  />
                </Tab.Pane>

                <Tab.Pane eventKey="location">
                  <LocationCapture
                    formData={formData}
                    setFormData={setFormData}
                  />
                </Tab.Pane>
              </Tab.Content>
            </Col>
          </Row>
        </Tab.Container>
      )}

      <div className="d-flex justify-content-center gap-3 mt-4">
        {isMobile ? (
          <>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => handleSubmit('A')}
              disabled={submitting}
            >
              {submitting ? <Spinner size="sm" /> : null} Submit & New
            </Button>
            <Button
              variant="primary"
              size="lg"
              onClick={() => handleSubmit('E')}
              disabled={submitting}
            >
              {submitting ? <Spinner size="sm" /> : null} Submit & Exit
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="light"
              onClick={() => handleSubmit('A')}
              disabled={submitting}
            >
              Add Another Activity
            </Button>
            <Button
              variant="primary"
              onClick={() => handleSubmit('E')}
              disabled={submitting}
            >
              Submit & Exit
            </Button>
            <Button
              variant="light"
              onClick={() => window.open('/BirlaWhite/Reports/General/DSRActvRepSelf.jsp')}
            >
              View Submitted Data
            </Button>
          </>
        )}
      </div>

      <div className="text-center mt-2">
        <Button
          variant="outline-primary"
          size="sm"
          onClick={() => {
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(
                (position) => {
                  setFormData(prev => ({
                    ...prev,
                    geoLatit: position.coords.latitude.toString(),
                    geoLongt: position.coords.longitude.toString()
                  }));
                }
              );
            }
          }}
        >
          Capture Location Again
        </Button>
      </div>
    </Container>
  );
};

export default DsrActivityPage;