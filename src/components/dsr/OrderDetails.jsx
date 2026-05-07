import React, { useState, useEffect } from 'react';
import { Form, Row, Col, Button, Table, Card } from 'react-bootstrap';
import { productApi } from '../../api/dsrApi';
import { useDsrForm } from '../../hooks/useDsrForm';

const OrderDetails = ({ formData, setFormData }) => {
  const { addOrderDetail, removeOrderDetail, updateOrderDetail } = useDsrForm();
  const [productCategories, setProductCategories] = useState([]);
  const [skuOptions, setSkuOptions] = useState({});

  // Load product categories on mount
  useEffect(() => {
    loadProductCategories();
  }, []);

  const loadProductCategories = async () => {
    try {
      // Load categories for dropdown
      const categories = [
        { repoCatg: '01', repCatNm: 'WC', repoDesc: 'White Cement' },
        { repoCatg: '02', repCatNm: 'WCP', repoDesc: 'Wall Care Putty' },
        { repoCatg: '03', repCatNm: 'VAP', repoDesc: 'Value Added Products' },
        { repoCatg: '09', repCatNm: 'TILE', repoDesc: 'Tile Adhesives' },
        { repoCatg: '12', repCatNm: 'GP', repoDesc: 'Gypsum Products' },
      ];
      setProductCategories(categories);
    } catch (error) {
      console.error('Error loading product categories:', error);
    }
  };

  // Load SKUs when category changes - replicate prodRateGet from JSP
  const handleCategoryChange = async (detailId, repoCatg) => {
    updateOrderDetail(detailId, 'repoCatg', repoCatg);
    updateOrderDetail(detailId, 'catgPkPr', '');
    updateOrderDetail(detailId, 'prodQnty', '0');
    updateOrderDetail(detailId, 'projQnty', '0');

    if (repoCatg && formData.areaCode) {
      try {
        const response = await productApi.getSkuDropdown(repoCatg);
        setSkuOptions(prev => ({
          ...prev,
          [detailId]: response.data || []
        }));
      } catch (error) {
        console.error('Error loading SKUs:', error);
      }
    }
  };

  // Calculate Qty in MT when bags change - replicate repoDescChng from JSP
  const handleQtyChange = (detailId, prodQnty, secNoTon) => {
    updateOrderDetail(detailId, 'prodQnty', prodQnty);
    if (secNoTon && secNoTon > 0) {
      const qtyInMT = (parseFloat(prodQnty) / parseFloat(secNoTon)).toFixed(3);
      updateOrderDetail(detailId, 'projQnty', qtyInMT);
    }
  };

  return (
    <Card className="mb-3">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h6 className="mb-0 fw-bold">Order Booked in Call/E-Meet</h6>
        <Button
          variant="primary"
          size="sm"
          onClick={addOrderDetail}
        >
          + Add Row
        </Button>
      </Card.Header>
      <Card.Body>
        {formData.orderDetails.length === 0 ? (
          <div className="text-center text-muted py-3">
            No orders added yet. Click "Add Row" to add order details.
          </div>
        ) : (
          <div className="table-responsive">
            <Table bordered size="sm" className="align-middle">
              <thead>
                <tr>
                  <th style={{ width: '50px' }}>Sr</th>
                  <th>Product</th>
                  <th>Product SKU</th>
                  <th style={{ width: '120px' }}>Qty (Bags)</th>
                  <th style={{ width: '120px' }}>Qty (MT)</th>
                  <th style={{ width: '80px' }}>Del</th>
                </tr>
              </thead>
              <tbody>
                {formData.orderDetails.map((detail, index) => (
                  <tr key={detail.id}>
                    <td className="text-center">{index + 1}</td>
                    <td>
                      <Form.Select
                        size="sm"
                        value={detail.repoCatg || ''}
                        onChange={(e) => handleCategoryChange(detail.id, e.target.value)}
                      >
                        <option value="">Select Product</option>
                        {productCategories.map((cat) => (
                          <option key={cat.repoCatg} value={cat.repoCatg}>
                            {cat.repCatNm} - {cat.repoDesc}
                          </option>
                        ))}
                      </Form.Select>
                    </td>
                    <td>
                      <Form.Select
                        size="sm"
                        value={detail.catgPkPr || ''}
                        onChange={(e) => {
                          const selected = skuOptions[detail.id]?.find(
                            sku => sku[0] === e.target.value
                          );
                          updateOrderDetail(detail.id, 'catgPkPr', e.target.value);
                          if (selected) {
                            const parts = selected[1].split(' : ');
                            const secNoTon = parts[4] || '0';
                            updateOrderDetail(detail.id, 'secNoTon', secNoTon);
                          }
                        }}
                      >
                        <option value="">Select SKU</option>
                        {(skuOptions[detail.id] || []).map((sku) => (
                          <option key={sku[0]} value={sku[0]}>
                            {sku[1]}
                          </option>
                        ))}
                      </Form.Select>
                    </td>
                    <td>
                      <Form.Control
                        type="number"
                        size="sm"
                        value={detail.prodQnty || '0'}
                        onChange={(e) => handleQtyChange(
                          detail.id, 
                          e.target.value, 
                          detail.secNoTon
                        )}
                        min="0"
                        step="1"
                        placeholder="Bags"
                      />
                    </td>
                    <td>
                      <Form.Control
                        type="text"
                        size="sm"
                        value={detail.projQnty || '0'}
                        readOnly
                        className="bg-light"
                      />
                    </td>
                    <td className="text-center">
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => removeOrderDetail(detail.id)}
                        disabled={formData.orderDetails.length <= 1}
                      >
                        Del
                      </Button>
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

export default OrderDetails;