import React from 'react';
import { Form } from 'react-bootstrap';

const ProcessTypeSelector = ({ value, onChange, error }) => {
  return (
    <div className="mb-3">
      <label className="form-label fw-bold">
        <span className="text-danger">*</span> Process Type
      </label>
      <div className="d-flex gap-4">
        <Form.Check
          type="radio"
          id="procTypeAdd"
          label="Add"
          name="procType"
          value="A"
          checked={value === 'A'}
          onChange={(e) => onChange(e.target.value)}
          isInvalid={!!error}
        />
        <Form.Check
          type="radio"
          id="procTypeUpdate"
          label="Update"
          name="procType"
          value="U"
          checked={value === 'U'}
          onChange={(e) => onChange(e.target.value)}
          isInvalid={!!error}
        />
        <Form.Check
          type="radio"
          id="procTypeDelete"
          label="Delete"
          name="procType"
          value="D"
          checked={value === 'D'}
          onChange={(e) => onChange(e.target.value)}
          isInvalid={!!error}
        />
      </div>
      {error && <div className="text-danger small mt-1">{error}</div>}
    </div>
  );
};

export default ProcessTypeSelector;