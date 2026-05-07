import React, { useState, useEffect } from 'react';
import { Button, Card, Alert, Spinner, Row, Col, Form } from 'react-bootstrap';
import { locationApi } from '../../api/dsrApi';

const LocationCapture = ({ formData, setFormData }) => {
  const [capturing, setCapturing] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [distance, setDistance] = useState(null);
  const [distanceValid, setDistanceValid] = useState(null);
  const [mapUrl, setMapUrl] = useState('');

  // Replicate getLocation from JSP
  const captureLocation = () => {
    setCapturing(true);
    setLocationError('');

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude.toString();
          const lng = position.coords.longitude.toString();
          
          setFormData(prev => ({
            ...prev,
            geoLatit: lat,
            geoLongt: lng
          }));

          // Generate map image URL (Leaflet-like static map)
          setMapUrl(
            `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/` +
            `pin-l-marker+285A98(${lng},${lat})/${lng},${lat},15/600x400?access_token=pk.placeholder`
          );

          setCapturing(false);

          // Calculate distance if customer location exists
          if (formData.latitute && formData.lgtitute) {
            calculateDistance(lat, lng);
          }
        },
        (error) => {
          console.error('Location error:', error);
          setLocationError(
            'Could not get location. Please enable GPS and try again. ' +
            'If issue persists, select an exception reason.'
          );
          setCapturing(false);
          setFormData(prev => ({ ...prev, dsrExcpA: 'Y' }));
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setLocationError('Geolocation is not supported by this browser.');
      setCapturing(false);
    }
  };

  // Calculate distance between current location and customer
  const calculateDistance = async (currentLat, currentLon) => {
    try {
      const response = await locationApi.calculateDistance(
        formData.cusRtlCd,
        formData.cusRtlFl,
        currentLat,
        currentLon
      );
      
      const data = response.data;
      setDistance(data.distanceInMeters);
      setDistanceValid(data.isWithinLimit);
      
      setFormData(prev => ({
        ...prev,
        ltLgDist: data.distanceInMeters?.toString() || ''
      }));

      // If distance exceeds 500m, show exception
      if (!data.isWithinLimit) {
        setFormData(prev => ({ ...prev, dsrExcpA: 'Y' }));
        setLocationError(
          `You are ${data.distanceFormatted} away from customer's shop. ` +
          'Maximum allowed distance is 500 meters.'
        );
      }
    } catch (error) {
      console.error('Error calculating distance:', error);
      setDistance(null);
      setDistanceValid(null);
    }
  };

  // Auto-capture on mount
  useEffect(() => {
    captureLocation();
  }, []);

  return (
    <Card className="mb-3">
      <Card.Header>
        <h6 className="mb-0 fw-bold">Location Details</h6>
      </Card.Header>
      <Card.Body>
        {locationError && (
          <Alert variant="warning" dismissible onClose={() => setLocationError('')}>
            {locationError}
          </Alert>
        )}

        <Row>
          {/* Current Location */}
          <Col md={6}>
            <div className="mb-3">
              <label className="form-label fw-bold">Current Location</label>
              <Form.Control
                type="text"
                value={formData.geoLatit || ''}
                readOnly
                className="mb-1 bg-light"
                placeholder="Latitude"
              />
              <Form.Control
                type="text"
                value={formData.geoLongt || ''}
                readOnly
                className="bg-light"
                placeholder="Longitude"
              />
              <div className="text-muted small mt-1">
                {formData.FinlRslt || 'Address will appear here'}
              </div>
            </div>
          </Col>

          {/* Customer Location */}
          <Col md={6}>
            <div className="mb-3">
              <label className="form-label fw-bold">Customer Location</label>
              <Form.Control
                type="text"
                value={formData.latitute || ''}
                readOnly
                className="mb-1 bg-light"
                placeholder="Customer Latitude"
              />
              <Form.Control
                type="text"
                value={formData.lgtitute || ''}
                readOnly
                className="bg-light"
                placeholder="Customer Longitude"
              />
              {formData.latitute && formData.lgtitute && (
                <div className="text-muted small mt-1">
                  {formData.locaCapr || 'Customer Address'}
                </div>
              )}
            </div>
          </Col>
        </Row>

        {/* Distance Display */}
        {distance !== null && (
          <Alert variant={distanceValid ? 'success' : 'danger'}>
            <strong>Distance from Customer:</strong> {distance.toFixed(0)} meters
            {!distanceValid && (
              <div className="mt-1">
                <strong>Warning:</strong> You are beyond the 500m limit!
              </div>
            )}
          </Alert>
        )}

        {/* Map Display */}
        {mapUrl && (
          <div className="mb-3">
            <label className="form-label fw-bold">Map View</label>
            <div className="border rounded overflow-hidden">
              <img 
                src={mapUrl} 
                alt="Location Map" 
                className="w-100"
                style={{ maxHeight: '400px', objectFit: 'cover' }}
              />
            </div>
          </div>
        )}

        {/* Capture Button */}
        <div className="text-center mb-3">
          <Button
            variant="primary"
            onClick={captureLocation}
            disabled={capturing}
          >
            {capturing ? (
              <>
                <Spinner size="sm" className="me-1" />
                Capturing Location...
              </>
            ) : (
              'Capture Location Again'
            )}
          </Button>
        </div>

        {/* Exception Reason (if distance exceeded) */}
        {formData.dsrExcpA === 'Y' && (
          <div className="mb-3">
            <label className="form-label fw-bold text-danger">
              <span className="text-danger">*</span> Exception Reason
            </label>
            <Form.Select
              value={formData.cityNameReason || ''}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                cityNameReason: e.target.value
              }))}
            >
              <option value="">Select Reason</option>
              <option value="01">Network Issue</option>
              <option value="02">Battery Low</option>
              <option value="03">Mobile Not working</option>
              <option value="04">Location not capturing</option>
              <option value="05">Wrong Location OF Retailer</option>
              <option value="06">Wrong current Location Captured</option>
            </Form.Select>
            <div className="text-muted small mt-1">
              Current DSR Entry exception approval goes to your supervisor. 
              Without approving this Entry You cannot fill your attendance.
            </div>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default LocationCapture;