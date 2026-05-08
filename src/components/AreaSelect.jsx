import { useState, useEffect } from 'react';
import { Form } from 'react-bootstrap';
import { dsrApi } from '../services/dsrApi';

export default function AreaSelect({
  value,
  onChange,
  loginIdM,
  zoneFilter,
  required = false,
  disabled = false,
}) {
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAreas = async () => {
      if (!loginIdM) {
        setAreas([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const params = { loginIdM };
        if (zoneFilter) {
          params.zone = zoneFilter;
        }
        const response = await dsrApi.getAreas(loginIdM, zoneFilter);
        setAreas(response.data || []);
      } catch (err) {
        console.error('Failed to load areas:', err);
        setError('Failed to load areas');
        setAreas([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAreas();
  }, [loginIdM, zoneFilter]);

  const handleChange = (e) => {
    const selectedCode = e.target.value;
    const selectedArea = areas.find(a => a.areaCode === selectedCode);
    onChange(selectedArea || { areaCode: selectedCode });
  };

  return (
    <Form.Group className="mb-3">
      <Form.Label>
        Area {required && <span style={{ color: 'red' }}>*</span>}
      </Form.Label>
      <Form.Select
        value={value?.areaCode || ''}
        onChange={handleChange}
        required={required}
        disabled={disabled || loading}
      >
        <option value="">Select Area</option>
        {areas.map((area) => (
          <option key={area.areaCode} value={area.areaCode}>
            {area.areaCode} - {area.areaDesc || area.areaName}
          </option>
        ))}
      </Form.Select>
      {loading && <Form.Text className="text-muted">Loading areas...</Form.Text>}
      {error && <Form.Text className="text-danger">{error}</Form.Text>}
    </Form.Group>
  );
}