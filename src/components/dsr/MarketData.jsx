import React from 'react';
import { Form, Row, Col, Card, Table } from 'react-bootstrap';

const MarketData = ({ formData, setFormData, errors }) => {
  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isRetailerOrRural = formData.cusRtlFl === 'R' || formData.cusRtlFl === 'RR' || 
                            formData.cusRtlFl === 'D' || formData.cusRtlFl === 'AD' || 
                            formData.cusRtlFl === 'UR';

  const isStockiest = formData.cusRtlFl === 'C' || formData.cusRtlFl === 'RD';

  return (
    <div>
      {/* Enrolment Slabs */}
      <Card className="mb-3">
        <Card.Header>
          <h6 className="mb-0 fw-bold">Enrolment Slab (in MT)</h6>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={4}>
              <div className="form-label-group mb-3">
                <label className="form-label fw-bold">WC</label>
                <Form.Control
                  type="number"
                  step="0.01"
                  value={formData.wcErlSlb || '0'}
                  onChange={(e) => updateField('wcErlSlb', e.target.value)}
                  isInvalid={!!errors.wcErlSlb}
                  placeholder="WC Enrolment"
                />
              </div>
            </Col>
            <Col md={4}>
              <div className="form-label-group mb-3">
                <label className="form-label fw-bold">WCP</label>
                <Form.Control
                  type="number"
                  step="0.01"
                  value={formData.wpErlSlb || '0'}
                  onChange={(e) => updateField('wpErlSlb', e.target.value)}
                  isInvalid={!!errors.wpErlSlb}
                  placeholder="WCP Enrolment"
                />
              </div>
            </Col>
            <Col md={4}>
              <div className="form-label-group mb-3">
                <label className="form-label fw-bold">VAP</label>
                <Form.Control
                  type="number"
                  step="0.01"
                  value={formData.vpErlSlb || '0'}
                  onChange={(e) => updateField('vpErlSlb', e.target.value)}
                  isInvalid={!!errors.vpErlSlb}
                  placeholder="VAP Enrolment"
                />
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* BW Stocks Availability */}
      <Card className="mb-3">
        <Card.Header>
          <h6 className="mb-0 fw-bold">BW Stocks Availability (in MT)</h6>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={4}>
              <div className="mb-3">
                <label className="form-label fw-bold">WC</label>
                <Form.Control
                  type="number"
                  step="0.01"
                  value={formData.bwStkWcc || '0.00'}
                  onChange={(e) => updateField('bwStkWcc', e.target.value)}
                  disabled={isStockiest}
                  placeholder="BW Stock WC"
                />
              </div>
            </Col>
            <Col md={4}>
              <div className="mb-3">
                <label className="form-label fw-bold">WCP</label>
                <Form.Control
                  type="number"
                  step="0.01"
                  value={formData.bwStkWcp || '0.00'}
                  onChange={(e) => updateField('bwStkWcp', e.target.value)}
                  disabled={isStockiest}
                  placeholder="BW Stock WCP"
                />
              </div>
            </Col>
            <Col md={4}>
              <div className="mb-3">
                <label className="form-label fw-bold">VAP</label>
                <Form.Control
                  type="number"
                  step="0.01"
                  value={formData.bwStkVap || '0.00'}
                  onChange={(e) => updateField('bwStkVap', e.target.value)}
                  disabled={isStockiest}
                  placeholder="BW Stock VAP"
                />
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Brand Selling - WC */}
      {isRetailerOrRural && (
        <Card className="mb-3">
          <Card.Header>
            <h6 className="mb-0 fw-bold">Brands Selling - WC (Industry Volume) (in MT)</h6>
          </Card.Header>
          <Card.Body>
            <div className="mb-3">
              <div className="d-flex flex-wrap gap-3 mb-2">
                {['BW', 'JK', 'RAK', 'Other'].map(brand => (
                  <Form.Check
                    key={brand}
                    type="checkbox"
                    label={brand}
                    name="brndSlWc"
                    value={brand}
                    checked={formData.brndSlWc?.includes(brand) || false}
                    onChange={(e) => {
                      const current = formData.brndSlWc ? formData.brndSlWc.split(',') : [];
                      let updated;
                      if (e.target.checked) {
                        updated = [...current, e.target.value];
                      } else {
                        updated = current.filter(v => v !== e.target.value);
                      }
                      updateField('brndSlWc', updated.join(','));
                    }}
                  />
                ))}
              </div>
              <Form.Control
                type="text"
                value={formData.slWcVlum || ''}
                onChange={(e) => updateField('slWcVlum', e.target.value)}
                placeholder="WC Industry Volume in (MT)"
              />
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Brand Selling - WCP */}
      {isRetailerOrRural && (
        <Card className="mb-3">
          <Card.Header>
            <h6 className="mb-0 fw-bold">Brands Selling - WCP (Industry Volume) (in MT)</h6>
          </Card.Header>
          <Card.Body>
            <div className="mb-3">
              <div className="d-flex flex-wrap gap-3 mb-2">
                {[
                  { value: 'BW', label: 'BW' },
                  { value: 'JK', label: 'JK' },
                  { value: 'AP', label: 'Asian Paints' },
                  { value: 'BG', label: 'Berger' },
                  { value: 'AC', label: 'Aerocon' },
                  { value: 'PM', label: 'Paint Major' },
                  { value: 'OT', label: 'Any Other' }
                ].map(brand => (
                  <Form.Check
                    key={brand.value}
                    type="checkbox"
                    label={brand.label}
                    name="brndSlWp"
                    value={brand.value}
                    checked={formData.brndSlWp?.includes(brand.value) || false}
                    onChange={(e) => {
                      const current = formData.brndSlWp ? formData.brndSlWp.split(',') : [];
                      let updated;
                      if (e.target.checked) {
                        updated = [...current, e.target.value];
                      } else {
                        updated = current.filter(v => v !== e.target.value);
                      }
                      updateField('brndSlWp', updated.join(','));
                    }}
                  />
                ))}
              </div>
              <Form.Control
                type="text"
                value={formData.slWpVlum || ''}
                onChange={(e) => updateField('slWpVlum', e.target.value)}
                placeholder="WCP Industry Volume in (MT)"
              />
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Last 3 Months Average - BW (Read-only display) */}
      {formData.cusRtlCd && (
        <Card className="mb-3">
          <Card.Header>
            <h6 className="mb-0 fw-bold">Last 3 Months Average - BW (in MT)</h6>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={4}>
                <div className="mb-3">
                  <label className="form-label">WC</label>
                  <Form.Control
                    type="text"
                    value={formData.bwAvgWcc || '0.00'}
                    readOnly
                    className="bg-light"
                  />
                </div>
              </Col>
              <Col md={4}>
                <div className="mb-3">
                  <label className="form-label">WCP</label>
                  <Form.Control
                    type="text"
                    value={formData.bwAvgWcp || '0.00'}
                    readOnly
                    className="bg-light"
                  />
                </div>
              </Col>
              <Col md={4}>
                <div className="mb-3">
                  <label className="form-label">VAP</label>
                  <Form.Control
                    type="text"
                    value={formData.bwAvgVap || '0.00'}
                    readOnly
                    className="bg-light"
                  />
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      )}

      {/* Current Month - BW (Read-only display) */}
      {formData.cusRtlCd && (
        <Card className="mb-3">
          <Card.Header>
            <h6 className="mb-0 fw-bold">Current Month - BW (in MT)</h6>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={4}>
                <div className="mb-3">
                  <label className="form-label">WC</label>
                  <Form.Control
                    type="text"
                    value={formData.bwCurWcc || '0.00'}
                    readOnly
                    className="bg-light"
                  />
                </div>
              </Col>
              <Col md={4}>
                <div className="mb-3">
                  <label className="form-label">WCP</label>
                  <Form.Control
                    type="text"
                    value={formData.bwCurWcp || '0.00'}
                    readOnly
                    className="bg-light"
                  />
                </div>
              </Col>
              <Col md={4}>
                <div className="mb-3">
                  <label className="form-label">VAP</label>
                  <Form.Control
                    type="text"
                    value={formData.bwCurVap || '0.00'}
                    readOnly
                    className="bg-light"
                  />
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      )}

      {/* Competitor Last 3 Months Average */}
      {isRetailerOrRural && (
        <Card className="mb-3">
          <Card.Header>
            <h6 className="mb-0 fw-bold">Last 3 Months Average - Other Brands (in MT)</h6>
          </Card.Header>
          <Card.Body>
            <Table bordered size="sm">
              <thead>
                <tr>
                  <th>Brand</th>
                  <th>WC Qty</th>
                  <th>WCP Qty</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>JK</td>
                  <td>
                    <Form.Control
                      type="number"
                      step="0.01"
                      value={formData.jkAvgWcc || '0'}
                      onChange={(e) => updateField('jkAvgWcc', e.target.value)}
                      placeholder="WC"
                    />
                  </td>
                  <td>
                    <Form.Control
                      type="number"
                      step="0.01"
                      value={formData.jkAvgWcp || '0'}
                      onChange={(e) => updateField('jkAvgWcp', e.target.value)}
                      placeholder="WCP"
                    />
                  </td>
                </tr>
                <tr>
                  <td>Asian</td>
                  <td>
                    <Form.Control
                      type="number"
                      step="0.01"
                      value={formData.asAvgWcc || '0'}
                      onChange={(e) => updateField('asAvgWcc', e.target.value)}
                      placeholder="WC"
                    />
                  </td>
                  <td>
                    <Form.Control
                      type="number"
                      step="0.01"
                      value={formData.asAvgWcp || '0'}
                      onChange={(e) => updateField('asAvgWcp', e.target.value)}
                      placeholder="WCP"
                    />
                  </td>
                </tr>
                <tr>
                  <td>Other</td>
                  <td>
                    <Form.Control
                      type="number"
                      step="0.01"
                      value={formData.otAvgWcc || '0'}
                      onChange={(e) => updateField('otAvgWcc', e.target.value)}
                      placeholder="WC"
                    />
                  </td>
                  <td>
                    <Form.Control
                      type="number"
                      step="0.01"
                      value={formData.otAvgWcp || '0'}
                      onChange={(e) => updateField('otAvgWcp', e.target.value)}
                      placeholder="WCP"
                    />
                  </td>
                </tr>
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}

      {/* Tile Adhesives Section */}
      {isRetailerOrRural && (
        <Card className="mb-3">
          <Card.Header>
            <h6 className="mb-0 fw-bold">Tile Adhesives</h6>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={6}>
                <div className="mb-3">
                  <label className="form-label">Is this Tile Adhesives seller?</label>
                  <Form.Select
                    value={formData.isTilRtl || 'N'}
                    onChange={(e) => updateField('isTilRtl', e.target.value)}
                  >
                    <option value="Y">Yes</option>
                    <option value="N">No</option>
                  </Form.Select>
                </div>
              </Col>
              {formData.isTilRtl === 'Y' && (
                <Col md={6}>
                  <div className="mb-3">
                    <label className="form-label">Tile Adhesive Stock</label>
                    <Form.Control
                      type="number"
                      step="0.01"
                      value={formData.tileStck || '0'}
                      onChange={(e) => updateField('tileStck', e.target.value)}
                      placeholder="Stock"
                    />
                  </div>
                </Col>
              )}
            </Row>
          </Card.Body>
        </Card>
      )}
    </div>
  );
};

export default MarketData;