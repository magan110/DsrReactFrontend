import React from 'react';
import { Form, Button, Table, Card } from 'react-bootstrap';

const BRANDS = [
  { value: 'BW', label: 'Birla White' },
  { value: 'JK', label: 'JK' },
  { value: 'AP', label: 'Asian Paint' },
  { value: 'BG', label: 'Berger' },
  { value: 'OT', label: 'Others' },
];

const MarketPricing = ({ formData, setFormData }) => {
  const marketPricingData = formData?.marketPricingData || [];

  const addMarketPricing = () => {
    const newItem = {
      id: Date.now(),
      branName: '',
      prdCodMk: '',
      bPriceVl: '0',
      cPriceVl: '0'
    };
    setFormData(prev => ({
      ...prev,
      marketPricingData: [...(prev.marketPricingData || []), newItem]
    }));
  };

  const removeMarketPricing = (id) => {
    setFormData(prev => ({
      ...prev,
      marketPricingData: (prev.marketPricingData || []).filter(item => item.id !== id)
    }));
  };

  const handleUpdateDetail = (id, field, value) => {
    setFormData(prev => ({
      ...prev,
      marketPricingData: (prev.marketPricingData || []).map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    }));
  };

  return (
    <Card className="mb-3">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h6 className="mb-0 fw-bold">Market - WCP (Highest Selling SKU)</h6>
        <Button variant="primary" size="sm" onClick={addMarketPricing}>
          + Add Row
        </Button>
      </Card.Header>
      <Card.Body>
        {marketPricingData.length === 0 ? (
          <div className="text-center text-muted py-3">
            No pricing data added yet.
          </div>
        ) : (
          <div className="table-responsive">
            <Table bordered size="sm" className="align-middle">
              <thead>
                <tr>
                  <th>Del</th>
                  <th>Brand</th>
                  <th>Product</th>
                  <th>Price - B</th>
                  <th>Price - C</th>
                </tr>
              </thead>
              <tbody>
                {marketPricingData.map((item) => (
                  <tr key={item.id}>
                    <td className="text-center">
                      <Button variant="danger" size="sm" onClick={() => removeMarketPricing(item.id)}>
                        Del
                      </Button>
                    </td>
                    <td>
                      <Form.Select
                        size="sm"
                        value={item.branName || ''}
                        onChange={(e) => handleUpdateDetail(item.id, 'branName', e.target.value)}
                      >
                        <option value="">Select Brand</option>
                        {BRANDS.map((brand) => (
                          <option key={brand.value} value={brand.value}>
                            {brand.label}
                          </option>
                        ))}
                      </Form.Select>
                    </td>
                    <td>
                      <Form.Control
                        type="text"
                        size="sm"
                        value={item.prdCodMk || ''}
                        onChange={(e) => handleUpdateDetail(item.id, 'prdCodMk', e.target.value)}
                        placeholder="Product Code"
                      />
                    </td>
                    <td>
                      <Form.Control
                        type="number"
                        size="sm"
                        step="0.01"
                        value={item.bPriceVl || '0'}
                        onChange={(e) => handleUpdateDetail(item.id, 'bPriceVl', e.target.value)}
                        placeholder="B Price"
                      />
                    </td>
                    <td>
                      <Form.Control
                        type="number"
                        size="sm"
                        step="0.01"
                        value={item.cPriceVl || '0'}
                        onChange={(e) => handleUpdateDetail(item.id, 'cPriceVl', e.target.value)}
                        placeholder="C Price"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default MarketPricing;