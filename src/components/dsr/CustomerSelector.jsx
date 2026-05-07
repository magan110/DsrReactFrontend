import React, { useState, useEffect, useCallback } from 'react';
import { Form, Row, Col, InputGroup, Button, Spinner } from 'react-bootstrap';
import { customerApi } from '../../api/dsrApi';

const CUSTOMER_TYPES = [
  { code: 'C', desc: 'Stockiest/Urban Stockiest' },
  { code: 'D', desc: 'Direct Dealer' },
  { code: 'RD', desc: 'Rural Stockiest' },
  { code: 'R', desc: 'Retailer' },
  { code: 'RR', desc: 'Rural Retailer' },
  { code: 'AD', desc: 'Authorised Dealer' },
  { code: 'UR', desc: 'Urban Stockiest' },
  { code: '07', desc: 'Registered Applicator' },
  { code: '08', desc: 'Painter' },
];

// Mock area list - should come from API
const AREA_LIST = [
  { code: 'AGR', desc: 'Agra' },
  { code: 'DEL', desc: 'Delhi' },
  { code: 'CAL', desc: 'Kolkata' },
  { code: 'MUM', desc: 'Mumbai' },
  { code: 'JDP', desc: 'Jodhpur' },
];

const CustomerSelector = ({ formData, setFormData, errors }) => {
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerResults, setCustomerResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Search customers for autocomplete - replicate AJAX from JSP
  useEffect(() => {
    if (customerSearch.length > 3 && formData.areaCode) {
      searchCustomers();
    } else {
      setCustomerResults([]);
    }
  }, [customerSearch, formData.areaCode, formData.cusRtlFl]);

  const searchCustomers = async () => {
    setSearching(true);
    try {
      let response;
      if (formData.cusRtlFl === 'R' || formData.cusRtlFl === 'RR') {
        response = await customerApi.searchRetailers(
          formData.areaCode,
          customerSearch
        );
      } else {
        response = await customerApi.searchCustomers(
          formData.areaCode,
          formData.cusRtlFl,
          customerSearch
        );
      }
      setCustomerResults(response.data || []);
      setShowDropdown(true);
    } catch (error) {
      console.error('Error searching customers:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleCustomerSelect = useCallback(async (customer) => {
    setFormData(prev => ({
      ...prev,
      cusRtlCd: customer.code,
      cusRtlNm: customer.displayName
    }));
    setCustomerSearch(customer.displayName);
    setShowDropdown(false);

    // Fetch customer details with sales data - replicate refreshed() from JSP
    try {
      const type = formData.cusRtlFl === 'R' || formData.cusRtlFl === 'RR' ? 'R' : 'C';
      const response = await customerApi.getCustomerDetail(customer.code, type);
      const data = response.data;
      
      setFormData(prev => ({
        ...prev,
        cusRtlNm: data.name,
        latitute: data.latitute || '',
        lgtitute: data.lgtitute || '',
        locaCapr: data.locaCapr || '',
        kycVerFl: data.kycVerFl || 'N',
        mobileNo: data.mobileNo || '',
        mrktName: data.mrktName || '',
        bwAvgWcc: data.avgSalesWc || '0.00',
        bwAvgWcp: data.avgSalesWcp || '0.00',
        bwAvgVap: data.avgSalesVap || '0.00',
        bwCurWcc: data.currentMonthWc || '0.00',
        bwCurWcp: data.currentMonthWcp || '0.00',
        bwCurVap: data.currentMonthVap || '0.00',
      }));
    } catch (error) {
      console.error('Error fetching customer details:', error);
    }
  }, [formData.cusRtlFl, setFormData]);

  const handleAreaChange = useCallback((areaCode) => {
    setFormData(prev => ({
      ...prev,
      areaCode,
      cusRtlCd: '',
      cusRtlNm: ''
    }));
    setCustomerSearch('');
    setCustomerResults([]);
  }, [setFormData]);

  return (
    <div className="mb-3">
      <Row>
        <Col md={6}>
          <div className="mb-3">
            <label className="form-label fw-bold">
              <span className="text-danger">*</span> Area Code
            </label>
            <Form.Select
              value={formData.areaCode}
              onChange={(e) => handleAreaChange(e.target.value)}
              isInvalid={!!errors.areaCode}
            >
              <option value="">Select Area</option>
              {AREA_LIST.map((area) => (
                <option key={area.code} value={area.code}>
                  {area.code} - {area.desc}
                </option>
              ))}
            </Form.Select>
            {errors.areaCode && (
              <div className="text-danger small mt-1">{errors.areaCode}</div>
            )}
          </div>
        </Col>

        <Col md={6}>
          <div className="mb-3">
            <label className="form-label fw-bold">
              <span className="text-danger">*</span> Purchaser / Retailer Type
            </label>
            <Form.Select
              value={formData.cusRtlFl}
              onChange={(e) => {
                setFormData(prev => ({
                  ...prev,
                  cusRtlFl: e.target.value,
                  cusRtlCd: '',
                  cusRtlNm: ''
                }));
                setCustomerSearch('');
                setCustomerResults([]);
              }}
              isInvalid={!!errors.cusRtlFl}
            >
              <option value="">Select Type</option>
              {CUSTOMER_TYPES.map((type) => (
                <option key={type.code} value={type.code}>
                  {type.code} - {type.desc}
                </option>
              ))}
            </Form.Select>
            {errors.cusRtlFl && (
              <div className="text-danger small mt-1">{errors.cusRtlFl}</div>
            )}
          </div>
        </Col>
      </Row>

      <div className="mb-3">
        <label className="form-label fw-bold">
          <span className="text-danger">*</span> Code
        </label>
        <InputGroup>
          <Form.Control
            type="text"
            placeholder="Search Purchaser Code"
            value={customerSearch}
            onChange={(e) => setCustomerSearch(e.target.value)}
            onFocus={() => customerResults.length > 0 && setShowDropdown(true)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
            isInvalid={!!errors.cusRtlCd}
            autoComplete="off"
          />
          <Button
            variant="outline-secondary"
            onClick={searchCustomers}
            disabled={!formData.areaCode || !formData.cusRtlFl}
          >
            {searching ? <Spinner size="sm" /> : 'Search'}
          </Button>
        </InputGroup>
        {errors.cusRtlCd && (
          <div className="text-danger small mt-1">{errors.cusRtlCd}</div>
        )}

        {/* Autocomplete dropdown - replicate AJAX dropdown from JSP */}
        {showDropdown && customerResults.length > 0 && (
          <div className="border rounded mt-1 position-absolute bg-white shadow-sm" 
               style={{ zIndex: 1000, maxHeight: '200px', overflowY: 'auto' }}>
            {customerResults.map((customer, index) => (
              <div
                key={index}
                className="px-3 py-2 cursor-pointer hover-bg-light border-bottom"
                style={{ cursor: 'pointer' }}
                onMouseDown={() => handleCustomerSelect(customer)}
              >
                <strong>{customer.code}</strong> - {customer.displayName}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Display selected customer name */}
      {formData.cusRtlNm && (
        <div className="mb-3 p-2 bg-light rounded">
          <strong>Selected: </strong> {formData.cusRtlNm}
          {formData.cusRtlCd && (
            <Button
              variant="link"
              size="sm"
              onClick={() => {
                const url = formData.cusRtlFl === 'R' || formData.cusRtlFl === 'RR'
                  ? `/Master/Customer/RetailerEntry.jsp?procType=U&areaCode=${formData.areaCode}&retlCode=${formData.cusRtlCd}`
                  : `/Master/Customer/CustProfileUpdSelf.jsp?procType=U&areaCode=${formData.areaCode}&custCode=${formData.cusRtlCd}`;
                window.open(url);
              }}
            >
              Edit KYC
            </Button>
          )}
        </div>
      )}

      {/* KYC Status display */}
      {formData.cusRtlCd && (
        <div className="mb-3">
          <label className="form-label">KYC Status</label>
          <Form.Control
            type="text"
            value={formData.kycVerFl === 'Y' ? 'Verified' : 'Not Verified'}
            readOnly
            className={formData.kycVerFl === 'Y' ? 'bg-success text-white' : 'bg-warning'}
          />
        </div>
      )}
    </div>
  );
};

export default CustomerSelector;
