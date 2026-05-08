import { useState, useEffect, useRef } from 'react';
import { Card, Button, Alert, Form, Row, Col } from 'react-bootstrap';

const DISTANCE_THRESHOLD_METERS = 500;
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function getCurrentPosition(options = {}) {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
      ...options,
    });
  });
}

async function reverseGeocode(lat, lng) {
  if (!GOOGLE_MAPS_API_KEY) {
    return '';
  }
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`
    );
    const data = await response.json();
    if (data.results && data.results[0]) {
      return data.results[0].formatted_address;
    }
  } catch {
    return '';
  }
  return '';
}

export default function LocationCapture({
  onLocationChange,
  initialLocation,
  isMobileApp = false,
}) {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [customerLocation] = useState(initialLocation ?? null);
  const [address, setAddress] = useState('');
  const [distance, setDistance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [geoError, setGeoError] = useState('');
  const [manualAddress, setManualAddress] = useState('');
  const mapContainerRef = useRef(null);
  const googleMapsLoaded = useRef(false);

  useEffect(() => {
    if (!isMobileApp && GOOGLE_MAPS_API_KEY && !googleMapsLoaded.current) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        googleMapsLoaded.current = true;
      };
      document.head.appendChild(script);
    }
  }, [isMobileApp]);

  useEffect(() => {
    if (
      !isMobileApp &&
      googleMapsLoaded.current &&
      currentLocation &&
      mapContainerRef.current
    ) {
      const map = new window.google.maps.Map(mapContainerRef.current, {
        center: currentLocation,
        zoom: 15,
      });

      new window.google.maps.Marker({
        position: currentLocation,
        map,
        title: 'Your Location',
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: '#4285F4',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        },
      });

      if (customerLocation) {
        new window.google.maps.Marker({
          position: customerLocation,
          map,
          title: 'Customer Location',
        });

        const bounds = new window.google.maps.LatLngBounds();
        bounds.extend(currentLocation);
        bounds.extend(customerLocation);
        map.fitBounds(bounds);
      }
    }
  }, [currentLocation, customerLocation, isMobileApp]);

  const updateDistance = () => {
    if (customerLocation && currentLocation) {
      const dist = calculateDistance(
        currentLocation.lat,
        currentLocation.lng,
        customerLocation.lat,
        customerLocation.lng
      );
      setDistance(dist);

      if (dist > DISTANCE_THRESHOLD_METERS) {
        setError(
          `You are ${Math.round(dist)}m away from customer location. Please move within ${DISTANCE_THRESHOLD_METERS}m.`
        );
      } else {
        setError('');
      }
    }
  };

  const handleGetLocation = async () => {
    setLoading(true);
    setError('');
    setGeoError('');

    try {
      const position = await getCurrentPosition();
      const loc = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };

      let addr = '';
      if (!isMobileApp) {
        addr = await reverseGeocode(loc.lat, loc.lng);
      }
      setAddress(addr);
      setCurrentLocation(loc);

      setTimeout(() => {
        updateDistance();
      }, 100);

      if (onLocationChange) {
        onLocationChange({ lat: loc.lat, lng: loc.lng, address: addr });
      }
    } catch (err) {
      if (err.code === 1) {
        setGeoError('Location permission denied. Please enable location access.');
      } else if (err.code === 2) {
        setGeoError('Location unavailable. Please check your device location settings.');
      } else if (err.code === 3) {
        setGeoError('Location request timed out. Please try again.');
      } else {
        setGeoError(err.message || 'Failed to get location');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleManualAddressChange = (e) => {
    const value = e.target.value;
    setManualAddress(value);
    if (onLocationChange && currentLocation) {
      onLocationChange({
        lat: currentLocation.lat,
        lng: currentLocation.lng,
        address: value,
      });
    }
  };

  const handleManualLocationSubmit = (e) => {
    e.preventDefault();
    if (!customerLocation) {
      setError('Customer location not set');
      return;
    }
    if (onLocationChange) {
      onLocationChange({
        lat: customerLocation.lat,
        lng: customerLocation.lng,
        address: manualAddress || address,
      });
    }
  };

  return (
    <Card className="mb-3">
      <Card.Header>Location Capture</Card.Header>
      <Card.Body>
        {geoError && (
          <Alert variant="warning" className="mb-3">
            {geoError}
          </Alert>
        )}

        {error && (
          <Alert variant="danger" className="mb-3">
            {error}
          </Alert>
        )}

        {distance !== null && distance <= DISTANCE_THRESHOLD_METERS && (
          <Alert variant="success" className="mb-3">
            Location verified! You are within {Math.round(distance)}m of customer location.
          </Alert>
        )}

        <div className="mb-3">
          <Button
            variant="primary"
            onClick={handleGetLocation}
            disabled={loading}
          >
            {loading ? 'Getting Location...' : 'Get Current Location'}
          </Button>
        </div>

        {currentLocation && (
          <div className="mb-3">
            <Row>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Current Latitude</Form.Label>
                  <Form.Control
                    type="text"
                    value={currentLocation.lat.toFixed(6)}
                    readOnly
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Current Longitude</Form.Label>
                  <Form.Control
                    type="text"
                    value={currentLocation.lng.toFixed(6)}
                    readOnly
                  />
                </Form.Group>
              </Col>
            </Row>
          </div>
        )}

        {!isMobileApp && currentLocation && (
          <div className="mb-3">
            <Form.Group>
              <Form.Label>Detected Address</Form.Label>
              <Form.Control
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter address manually if needed"
              />
            </Form.Group>
          </div>
        )}

        {isMobileApp && (
          <Form.Group className="mb-3">
            <Form.Label>Customer Address</Form.Label>
            <Form.Control
              type="text"
              value={manualAddress}
              onChange={handleManualAddressChange}
              placeholder="Enter customer address"
            />
          </Form.Group>
        )}

        {!isMobileApp && customerLocation && (
          <div className="mb-3">
            <Row>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Customer Latitude</Form.Label>
                  <Form.Control
                    type="text"
                    value={customerLocation.lat.toFixed(6)}
                    readOnly
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Customer Longitude</Form.Label>
                  <Form.Control
                    type="text"
                    value={customerLocation.lng.toFixed(6)}
                    readOnly
                  />
                </Form.Group>
              </Col>
            </Row>
          </div>
        )}

        {!isMobileApp && customerLocation && currentLocation && (
          <Form onSubmit={handleManualLocationSubmit} className="mb-3">
            <Form.Group className="mb-2">
              <Form.Label>Update Address</Form.Label>
              <Form.Control
                type="text"
                value={manualAddress}
                onChange={(e) => setManualAddress(e.target.value)}
                placeholder="Enter customer address"
              />
            </Form.Group>
            <Button type="submit" variant="secondary">
              Save Location
            </Button>
          </Form>
        )}

        {!isMobileApp && (
          <div
            ref={mapContainerRef}
            style={{
              width: '100%',
              height: '300px',
              backgroundColor: '#f0f0f0',
              borderRadius: '4px',
            }}
          >
            {!GOOGLE_MAPS_API_KEY && (
              <div className="d-flex align-items-center justify-content-center h-100">
                <span className="text-muted">
                  Configure VITE_GOOGLE_MAPS_API_KEY to view map
                </span>
              </div>
            )}
          </div>
        )}

        <small className="text-muted d-block mt-2">
          {!isMobileApp
            ? 'Click "Get Current Location" to capture your GPS coordinates. Make sure you are within 500m of the customer location.'
            : 'Enable location services to capture GPS coordinates automatically.'}
        </small>
      </Card.Body>
    </Card>
  );
}