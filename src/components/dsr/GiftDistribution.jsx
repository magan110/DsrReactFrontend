import React from 'react';
import { Form, Button, Table, Card } from 'react-bootstrap';

const GIFT_TYPES = [
  { code: '01', desc: 'Gift Type 1' },
  { code: '02', desc: 'Gift Type 2' },
  { code: '03', desc: 'Gift Type 3' },
  { code: '04', desc: 'Gift Type 4' },
  { code: '05', desc: 'Gift Type 5' },
];

const GiftDistribution = ({ formData, setFormData }) => {
  const giftDistributions = formData?.giftDistributions || [];

  const addGiftDistribution = () => {
    const newGift = {
      id: Date.now(),
      mrtlCode: '',
      isueQnty: '1'
    };
    setFormData(prev => ({
      ...prev,
      giftDistributions: [...(prev.giftDistributions || []), newGift]
    }));
  };

  const removeGiftDistribution = (id) => {
    setFormData(prev => ({
      ...prev,
      giftDistributions: (prev.giftDistributions || []).filter(item => item.id !== id)
    }));
  };

  const handleUpdateGift = (id, field, value) => {
    setFormData(prev => ({
      ...prev,
      giftDistributions: (prev.giftDistributions || []).map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    }));
  };

  return (
    <Card className="mb-3">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h6 className="mb-0 fw-bold">Gift Distribution</h6>
        <Button variant="primary" size="sm" onClick={addGiftDistribution}>
          + Add Row
        </Button>
      </Card.Header>
      <Card.Body>
        {giftDistributions.length === 0 ? (
          <div className="text-center text-muted py-3">
            No gifts added yet.
          </div>
        ) : (
          <div className="table-responsive">
            <Table bordered size="sm" className="align-middle">
              <thead>
                <tr>
                  <th style={{ width: '80px' }}>Del</th>
                  <th>Gift Type</th>
                  <th style={{ width: '120px' }}>Quantity</th>
                </tr>
              </thead>
              <tbody>
                {giftDistributions.map((item) => (
                  <tr key={item.id}>
                    <td className="text-center">
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => removeGiftDistribution(item.id)}
                      >
                        Del
                      </Button>
                    </td>
                    <td>
                      <Form.Select
                        size="sm"
                        value={item.mrtlCode || ''}
                        onChange={(e) => handleUpdateGift(item.id, 'mrtlCode', e.target.value)}
                      >
                        <option value="">Select Gift Type</option>
                        {GIFT_TYPES.map((gift) => (
                          <option key={gift.code} value={gift.code}>
                            {gift.code} - {gift.desc}
                          </option>
                        ))}
                      </Form.Select>
                    </td>
                    <td>
                      <Form.Control
                        type="number"
                        size="sm"
                        value={item.isueQnty || '1'}
                        onChange={(e) => handleUpdateGift(item.id, 'isueQnty', e.target.value)}
                        min="1"
                        placeholder="Qty"
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

export default GiftDistribution;
