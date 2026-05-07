import React from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import { ACTIVITY_REMARKS } from '../../hooks/useDsrForm';

const DsrRemarks = ({ formData, setFormData, errors }) => {
  const remarks = ACTIVITY_REMARKS[formData.dsrParam] || ACTIVITY_REMARKS['05'];

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div>
      <h6 className="fw-bold mb-3">DSR Details</h6>
      <Row>
        {/* Report Date - Always shown */}
        <Col md={6}>
          <div className="mb-3">
            <label className="form-label fw-bold">
              <span className="text-danger">*</span> Report Date
            </label>
            <Form.Control
              type="date"
              value={formData.docuDate}
              onChange={(e) => updateField('docuDate', e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              isInvalid={!!errors.docuDate}
            />
            {errors.docuDate && (
              <div className="text-danger small mt-1">{errors.docuDate}</div>
            )}
            <div className="text-muted small mt-1">
              DSR can only be submitted for last 3 days. For back date entry use Exception Entry.
            </div>
          </div>
        </Col>

        {/* Remark 01 - Always shown */}
        <Col md={6}>
          <div className="mb-3">
            <label className="form-label fw-bold">
              {remarks.rem01 || 'Remark 1'}
            </label>
            <Form.Control
              as="textarea"
              rows={2}
              value={formData.dsrRem01 || ''}
              onChange={(e) => updateField('dsrRem01', e.target.value)}
              maxLength={500}
              isInvalid={!!errors.dsrRem01}
              placeholder={remarks.rem01 || 'Enter details'}
            />
            {errors.dsrRem01 && (
              <div className="text-danger small mt-1">{errors.dsrRem01}</div>
            )}
          </div>
        </Col>
      </Row>

      <Row>
        {/* Remark 02 */}
        {remarks.rem02 && (
          <Col md={6}>
            <div className="mb-3">
              <label className="form-label fw-bold">{remarks.rem02}</label>
              <Form.Control
                as="textarea"
                rows={2}
                value={formData.dsrRem02 || ''}
                onChange={(e) => updateField('dsrRem02', e.target.value)}
                maxLength={500}
                isInvalid={!!errors.dsrRem02}
                placeholder={remarks.rem02}
              />
              {errors.dsrRem02 && (
                <div className="text-danger small mt-1">{errors.dsrRem02}</div>
              )}
            </div>
          </Col>
        )}

        {/* Remark 03 */}
        {remarks.rem03 && (
          <Col md={6}>
            <div className="mb-3">
              <label className="form-label fw-bold">{remarks.rem03}</label>
              <Form.Control
                as="textarea"
                rows={2}
                value={formData.dsrRem03 || ''}
                onChange={(e) => updateField('dsrRem03', e.target.value)}
                maxLength={500}
                isInvalid={!!errors.dsrRem03}
                placeholder={remarks.rem03}
              />
              {errors.dsrRem03 && (
                <div className="text-danger small mt-1">{errors.dsrRem03}</div>
              )}
            </div>
          </Col>
        )}
      </Row>

      <Row>
        {/* Remark 04 */}
        {remarks.rem04 && (
          <Col md={6}>
            <div className="mb-3">
              <label className="form-label fw-bold">{remarks.rem04}</label>
              <Form.Control
                as="textarea"
                rows={2}
                value={formData.dsrRem04 || ''}
                onChange={(e) => updateField('dsrRem04', e.target.value)}
                maxLength={500}
                isInvalid={!!errors.dsrRem04}
                placeholder={remarks.rem04}
              />
              {errors.dsrRem04 && (
                <div className="text-danger small mt-1">{errors.dsrRem04}</div>
              )}
            </div>
          </Col>
        )}

        {/* Remark 05 - Additional Remarks */}
        {remarks.rem05 && (
          <Col md={6}>
            <div className="mb-3">
              <label className="form-label fw-bold">{remarks.rem05}</label>
              <Form.Control
                as="textarea"
                rows={2}
                value={formData.dsrRem05 || ''}
                onChange={(e) => updateField('dsrRem05', e.target.value)}
                maxLength={500}
                placeholder={remarks.rem05}
              />
            </div>
          </Col>
        )}
      </Row>

      {/* Pin Code, District, City - For new purchaser visits */}
      {remarks.showPinCode && (
        <Row>
          <Col md={4}>
            <div className="mb-3">
              <label className="form-label fw-bold">
                <span className="text-danger">*</span> Pin Code
              </label>
              <Form.Control
                type="text"
                value={formData.pinCodeN || ''}
                onChange={(e) => updateField('pinCodeN', e.target.value)}
                maxLength={6}
                placeholder="Enter Pin Code"
                isInvalid={!!errors.pinCodeN}
              />
              {errors.pinCodeN && (
                <div className="text-danger small mt-1">{errors.pinCodeN}</div>
              )}
            </div>
          </Col>
          <Col md={4}>
            <div className="mb-3">
              <label className="form-label fw-bold">
                <span className="text-danger">*</span> District
              </label>
              <Form.Control
                type="text"
                value={formData.district || ''}
                onChange={(e) => updateField('district', e.target.value)}
                placeholder="District"
                readOnly
              />
            </div>
          </Col>
          <Col md={4}>
            <div className="mb-3">
              <label className="form-label fw-bold">City</label>
              <Form.Control
                type="text"
                value={formData.cityName || ''}
                onChange={(e) => updateField('cityName', e.target.value)}
                maxLength={30}
                placeholder="Visited City"
              />
            </div>
          </Col>
        </Row>
      )}

      {/* Mobile Number field */}
      {remarks.showMobile && (
        <Row>
          <Col md={6}>
            <div className="mb-3">
              <label className="form-label fw-bold">Mobile No</label>
              <Form.Control
                type="text"
                value={formData.mobileNo || formData.dsrRem08 || ''}
                onChange={(e) => {
                  if (remarks.rem08) {
                    updateField('dsrRem08', e.target.value);
                  } else {
                    updateField('mobileNo', e.target.value);
                  }
                }}
                maxLength={10}
                placeholder="Enter 10-digit Mobile Number"
                isInvalid={!!errors.mobileNo}
              />
              {errors.mobileNo && (
                <div className="text-danger small mt-1">{errors.mobileNo}</div>
              )}
            </div>
          </Col>
        </Row>
      )}

      {/* Counter Type - For new purchaser visits */}
      {remarks.showCounter && (
        <Col md={6}>
          <div className="mb-3">
            <label className="form-label fw-bold">Counter Type</label>
            <Form.Select
              value={formData.cstBisTy || ''}
              onChange={(e) => updateField('cstBisTy', e.target.value)}
            >
              <option value="">Select Counter Type</option>
              <option value="01">Paint Counter</option>
              <option value="02">Non Paint Counter</option>
              <option value="03">Gypsum Counter</option>
              <option value="04">Other</option>
            </Form.Select>
          </div>
        </Col>
      )}

      {/* Nearest Stockiest - For retailer visits */}
      {remarks.showNearestStockiest && (
        <Col md={6}>
          <div className="mb-3">
            <label className="form-label fw-bold">Nearest Stockiest</label>
            <Form.Control
              type="text"
              value={formData.custCdRt || ''}
              onChange={(e) => updateField('custCdRt', e.target.value)}
              maxLength={8}
              placeholder="Enter Stockiest Code"
            />
          </div>
        </Col>
      )}

      {/* Pending Issues Section */}
      <hr />
      <h6 className="fw-bold mb-3">Pending Issues</h6>
      <Row>
        <Col md={4}>
          <div className="mb-3">
            <label className="form-label fw-bold">Any Pending Issues?</label>
            <div className="d-flex gap-3">
              <Form.Check
                type="radio"
                label="Yes"
                name="pendIsue"
                value="Y"
                checked={formData.pendIsue === 'Y'}
                onChange={(e) => updateField('pendIsue', e.target.value)}
              />
              <Form.Check
                type="radio"
                label="No"
                name="pendIsue"
                value="N"
                checked={formData.pendIsue === 'N'}
                onChange={(e) => updateField('pendIsue', e.target.value)}
              />
            </div>
          </div>
        </Col>

        {formData.pendIsue === 'Y' && (
          <>
            <Col md={4}>
              <div className="mb-3">
                <label className="form-label fw-bold">Issue Type</label>
                <Form.Select
                  value={formData.pndIsuDt || ''}
                  onChange={(e) => updateField('pndIsuDt', e.target.value)}
                >
                  <option value="">Select</option>
                  <option value="T">Token</option>
                  <option value="S">Scheme</option>
                  <option value="P">Product</option>
                  <option value="O">Other</option>
                </Form.Select>
              </div>
            </Col>
            <Col md={4}>
              <div className="mb-3">
                <label className="form-label fw-bold">Specify Issue</label>
                <Form.Control
                  type="text"
                  value={formData.isuDetal || ''}
                  onChange={(e) => updateField('isuDetal', e.target.value)}
                  maxLength={200}
                  placeholder="Specify issue details"
                />
              </div>
            </Col>
          </>
        )}
      </Row>

      {/* Display Contest Participation */}
      <Row>
        <Col md={6}>
          <div className="mb-3">
            <label className="form-label fw-bold">
              Participation of Display Contest
            </label>
            <div className="d-flex gap-3">
              <Form.Check
                type="radio"
                label="Yes"
                name="prtDsCnt"
                value="Y"
                checked={formData.prtDsCnt === 'Y'}
                onChange={(e) => updateField('prtDsCnt', e.target.value)}
              />
              <Form.Check
                type="radio"
                label="No"
                name="prtDsCnt"
                value="N"
                checked={formData.prtDsCnt === 'N'}
                onChange={(e) => updateField('prtDsCnt', e.target.value)}
              />
              <Form.Check
                type="radio"
                label="NA"
                name="prtDsCnt"
                value="NA"
                checked={formData.prtDsCnt === 'NA'}
                onChange={(e) => updateField('prtDsCnt', e.target.value)}
              />
            </div>
          </div>
        </Col>
      </Row>

      {/* Exception Reason - Shown when location doesn't match */}
      {formData.dsrExcpA === 'Y' && (
        <Row>
          <Col md={6}>
            <div className="mb-3">
              <label className="form-label fw-bold text-danger">
                <span className="text-danger">*</span> Exception Reason
              </label>
              <Form.Select
                value={formData.cityNameReason || ''}
                onChange={(e) => updateField('cityNameReason', e.target.value)}
              >
                <option value="">Select Reason</option>
                <option value="01">Network Issue</option>
                <option value="02">Battery Low</option>
                <option value="03">Mobile Not working</option>
                <option value="04">Location not capturing</option>
                <option value="05">Wrong Location OF Retailer</option>
                <option value="06">Wrong current Location Captured</option>
              </Form.Select>
            </div>
          </Col>
        </Row>
      )}

      {/* Other Remarks */}
      <Row>
        <Col md={12}>
          <div className="mb-3">
            <label className="form-label fw-bold">Any Other Remarks</label>
            <Form.Control
              as="textarea"
              rows={2}
              value={formData.dsrRem05 || ''}
              onChange={(e) => updateField('dsrRem05', e.target.value)}
              maxLength={200}
              placeholder="Additional remarks (optional)"
            />
          </div>
        </Col>
      </Row>

      {/* Order Execution Date */}
      <Row>
        <Col md={6}>
          <div className="mb-3">
            <label className="form-label fw-bold">Order Execution Date</label>
            <Form.Control
              type="date"
              value={formData.ordExDat || ''}
              onChange={(e) => updateField('ordExDat', e.target.value)}
            />
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default DsrRemarks;