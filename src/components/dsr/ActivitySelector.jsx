import React from 'react';
import { Form } from 'react-bootstrap';

// Activity types from JSP wcmParametr table (paramTyp = 83)
const ACTIVITY_TYPES = [
  { code: '01', desc: 'Visit to Stockiest(Trade Purchaser) / Retailer' },
  { code: '02', desc: 'Visit to Stockiest / Retailer Meeting' },
  { code: '03', desc: 'Site Survey' },
  { code: '04', desc: 'Tele Call' },
  { code: '05', desc: 'Personal Visit' },
  { code: '06', desc: 'CASC - Architect/Engineer Visit' },
  { code: '11', desc: 'Meeting with New Purchaser' },
  { code: '12', desc: 'Project Site Visit' },
  { code: '13', desc: 'Meeting with Project' },
  { code: '21', desc: 'CASC Site Visit' },
  { code: '22', desc: 'CASC Retailer Visit' },
  { code: '23', desc: 'CASC Meeting' },
  { code: '31', desc: 'Visit to Get Check Sampling at Site' },
  { code: '41', desc: 'Advertisement Activity' },
  { code: '50', desc: 'Meeting with New Purchaser/Retailer' },
  { code: '51', desc: 'Engagement Activities' },
  { code: '52', desc: 'Internal Team Meetings' },
  { code: '53', desc: 'Office Work' },
  { code: '54', desc: 'Leave' },
  { code: '55', desc: 'Any Other Activity' },
  { code: '60', desc: 'Market Research' },
  { code: '61', desc: 'Counter Visit' },
];

const ActivitySelector = ({ value, onChange, error }) => {
  return (
    <div className="mb-3">
      <label className="form-label fw-bold">
        <span className="text-danger">*</span> Activity Type
      </label>
      <Form.Select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        isInvalid={!!error}
      >
        <option value="">Select Activity Type</option>
        {ACTIVITY_TYPES.map((activity) => (
          <option key={activity.code} value={activity.code}>
            {activity.code} - {activity.desc}
          </option>
        ))}
      </Form.Select>
      {error && <div className="text-danger small mt-1">{error}</div>}
    </div>
  );
};

export default ActivitySelector;
