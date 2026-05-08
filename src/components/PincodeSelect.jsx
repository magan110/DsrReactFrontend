import { useState, useEffect, useRef } from 'react';
import { Form, ListGroup } from 'react-bootstrap';
import { dsrApi } from '../services/dsrApi';

export default function PincodeSelect({
  value,
  onChange,
  areaCode,
  enabled = false,
}) {
  const [searchText, setSearchText] = useState('');
  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceTimer = useRef(null);
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (value && !searchText) {
      setSearchText(value);
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchText(query);

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (!query.trim() || query.length < 4 || !enabled) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    setLoading(true);
    debounceTimer.current = setTimeout(async () => {
      try {
        const response = await dsrApi.searchPincodes(query, areaCode);
        setResults(response.data || []);
        setShowDropdown(true);
      } catch (error) {
        console.error('Pincode search failed:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  };

  const handleSelect = (pincodeData) => {
    const parts = pincodeData.split('~');
    const pincode = parts[0] || '';
    const city = parts[1] || '';
    const district = parts[2] || '';

    setSearchText(pincode);
    setShowDropdown(false);

    onChange({
      pinCodeN: pincode,
      cityName: city,
      district: district,
    });
  };

  const handleChange = (e) => {
    const input = e.target.value;
    setSearchText(input);
    onChange({ pinCodeN: input, cityName: '', district: '' });
  };

  if (!enabled) {
    return (
      <Form.Group className="mb-3">
        <Form.Label>Pin Code</Form.Label>
        <Form.Control
          type="text"
          name="pinCodeN"
          value={value || ''}
          onChange={(e) => onChange({ pinCodeN: e.target.value, cityName: '', district: '' })}
          placeholder="Pin Code"
        />
      </Form.Group>
    );
  }

  return (
    <div ref={wrapperRef} style={{ position: 'relative' }}>
      <Form.Group className="mb-3">
        <Form.Label>Pin Code</Form.Label>
        <Form.Control
          type="text"
          value={searchText}
          onChange={handleSearch}
          onFocus={() => searchText.length >= 4 && results.length > 0 && setShowDropdown(true)}
          placeholder="Type pincode (min 4 chars)..."
          autoComplete="off"
        />
      </Form.Group>

      {showDropdown && results.length > 0 && (
        <ListGroup
          style={{
            position: 'absolute',
            zIndex: 1000,
            maxHeight: '250px',
            overflowY: 'auto',
            width: '100%',
            marginTop: '-5px',
          }}
        >
          {results.map((item, index) => (
            <ListGroup.Item
              key={index}
              action
              onClick={() => handleSelect(item)}
              style={{ cursor: 'pointer' }}
            >
              {item}
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
    </div>
  );
}