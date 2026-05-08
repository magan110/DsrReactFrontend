import { useState, useEffect, useRef } from 'react';
import { Form, ListGroup, Alert } from 'react-bootstrap';
import { dsrApi } from '../services/dsrApi';

const MAX_DISTANCE_METERS = 520;

function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export default function CustomerSearch({
  value,
  onChange,
  customerType,
  areaCode,
  required = false,
  currentLat,
  currentLng,
}) {
  const [searchText, setSearchText] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [mobileError, setMobileError] = useState('');
  const [distanceError, setDistanceError] = useState('');
  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerDetails, setCustomerDetails] = useState(null);
  const debounceTimer = useRef(null);
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (value && !selectedCustomer) {
      setSearchText(value);
    }
  }, [value, selectedCustomer]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMobileChange = async (e) => {
    const mobile = e.target.value;
    setMobileNumber(mobile);
    setMobileError('');

    if (mobile.length >= 10) {
      try {
        const response = await dsrApi.checkMobileDuplicate(mobile);
        if (response.data && response.data.exists) {
          setMobileError(`Mobile number already exists for customer: ${response.data.customerCode}`);
        }
      } catch (error) {
        console.error('Mobile duplicate check failed:', error);
      }
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchText(query);

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (!query.trim()) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    setLoading(true);
    debounceTimer.current = setTimeout(async () => {
      try {
        const response = await dsrApi.searchCustomers(query, customerType, areaCode);
        setResults(response.data || []);
        setShowDropdown(true);
      } catch (error) {
        console.error('Customer search failed:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  };

  const handleSelect = async (customer) => {
    setSearchText(customer.cusRtlCd || customer.code);
    setSelectedCustomer(customer);
    setShowDropdown(false);
    setDistanceError('');

    try {
      const response = await dsrApi.getCustomerDetails(
        customer.cusRtlCd || customer.code,
        areaCode
      );
      const details = response.data;
      setCustomerDetails(details);

      if (currentLat && currentLng && (details.latitute || details.lgtitute)) {
        const custLat = parseFloat(details.latitute);
        const custLng = parseFloat(details.lgtitute);
        const distance = calculateHaversineDistance(
          currentLat,
          currentLng,
          custLat,
          custLng
        );

        if (distance > MAX_DISTANCE_METERS) {
          setDistanceError(`Distance exceeds ${MAX_DISTANCE_METERS}m limit (${Math.round(distance)}m)`);
        }
      }

      const fullCustomer = {
        ...customer,
        ...details,
        cusRtlNm: details.cusRtlNm || customer.cusRtlNm || customer.name,
      };
      onChange(fullCustomer);
    } catch (error) {
      console.error('Failed to fetch customer details:', error);
      onChange(customer);
    }
  };

  const handleChange = (e) => {
    const input = e.target.value;
    setSearchText(input);
    if (selectedCustomer && input !== selectedCustomer.cusRtlCd) {
      setSelectedCustomer(null);
      setCustomerDetails(null);
      setDistanceError('');
      onChange({ code: input });
    }
  };

  return (
    <div ref={wrapperRef} style={{ position: 'relative' }}>
      <Form.Group className="mb-3">
        <Form.Label>
          Customer Code {required && <span style={{ color: 'red' }}>*</span>}
        </Form.Label>
        <Form.Control
          type="text"
          value={searchText}
          onChange={handleChange}
          onFocus={() => searchText.length >= 2 && results.length > 0 && setShowDropdown(true)}
          placeholder="Type customer code or name..."
          required={required}
          autoComplete="off"
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Mobile Number</Form.Label>
        <Form.Control
          type="text"
          value={mobileNumber}
          onChange={handleMobileChange}
          placeholder="Enter mobile number..."
          maxLength={10}
        />
        {mobileError && (
          <Alert variant="danger" className="mt-2 py-2">
            {mobileError}
          </Alert>
        )}
      </Form.Group>

      {showDropdown && results.length > 0 && (
        <ListGroup
          style={{
            position: 'absolute',
            zIndex: 1000,
            maxHeight: '300px',
            overflowY: 'auto',
            width: '100%',
            marginTop: '-5px',
          }}
        >
          {results.map((customer, index) => (
            <ListGroup.Item
              key={customer.cusRtlCd || customer.code || index}
              action
              onClick={() => handleSelect(customer)}
              style={{ cursor: 'pointer' }}
            >
              <div className="fw-bold">{customer.cusRtlCd || customer.code}</div>
              <div className="text-muted small">
                {customer.cusRtlNm || customer.name}
              </div>
              {(customer.areaName || customer.area) && (
                <div className="text-muted small">
                  Area: {customer.areaName || customer.area}
                </div>
              )}
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}

      {showDropdown && loading && (
        <ListGroup
          style={{
            position: 'absolute',
            zIndex: 1000,
            width: '100%',
            marginTop: '-5px',
          }}
        >
          <ListGroup.Item className="text-muted">Searching...</ListGroup.Item>
        </ListGroup>
      )}

      {(selectedCustomer || customerDetails) && (
        <div className="mt-2 p-2 border rounded bg-light small">
          {(selectedCustomer.cusRtlNm || customerDetails?.cusRtlNm || selectedCustomer.name) && (
            <div className="mb-2">
              <strong>Customer Name:</strong> {customerDetails?.cusRtlNm || selectedCustomer.cusRtlNm || selectedCustomer.name}
            </div>
          )}
          <div className="row mt-1">
            <div className="col-6">
              <div><strong>Name:</strong> {customerDetails?.cusRtlNm || selectedCustomer.cusRtlNm || selectedCustomer.name}</div>
              <div><strong>Address:</strong> {customerDetails?.cusRtlAd || selectedCustomer.cusRtlAd || selectedCustomer.address || '-'}</div>
              <div><strong>City:</strong> {customerDetails?.cityName || selectedCustomer.cityName || selectedCustomer.city || '-'}</div>
            </div>
            <div className="col-6">
              <div><strong>District:</strong> {customerDetails?.district || selectedCustomer.district || '-'}</div>
              <div><strong>Pincode:</strong> {customerDetails?.pinCodeN || selectedCustomer.pinCodeN || selectedCustomer.pincode || '-'}</div>
              <div><strong>Type:</strong> {customerDetails?.cstBisTy || selectedCustomer.cstBisTy || selectedCustomer.type || '-'}</div>
            </div>
          </div>
          {(customerDetails?.latitute || customerDetails?.lgtitute || selectedCustomer.latitute || selectedCustomer.lgtitute) && (
            <div className="mt-1">
              <strong>Location:</strong> {customerDetails?.latitute || selectedCustomer.latitute || selectedCustomer.lat}, {customerDetails?.lgtitute || selectedCustomer.lgtitute || selectedCustomer.lng}
            </div>
          )}
          {customerDetails?.locaCapr && (
            <div className="mt-1">
              <strong>Location Capability:</strong> {customerDetails.locaCapr}
            </div>
          )}
        </div>
      )}

      {distanceError && (
        <Alert variant="danger" className="mt-2 py-2">
          {distanceError}
        </Alert>
      )}
    </div>
  );
}