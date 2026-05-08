import { useState, useEffect, useRef } from 'react';
import { Form, ListGroup } from 'react-bootstrap';
import { dsrApi } from '../services/dsrApi';

const CATEGORY_LABELS = {
  '01': 'Cement',
  '02': 'Putty',
  '03': 'Primers',
  '04': 'Paints',
  '05': 'Adhesives',
  '06': 'Coatings',
};

export default function ProductSelect({
  value,
  onChange,
  category,
  required = false,
}) {
  const [searchText, setSearchText] = useState('');
  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const debounceTimer = useRef(null);
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (value && !selectedProduct) {
      setSearchText(value.prodCode || '');
    }
  }, [value, selectedProduct]);

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

    if (!query.trim() || query.length < 2) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    setLoading(true);
    debounceTimer.current = setTimeout(async () => {
      try {
        const response = await dsrApi.searchProducts(query, category);
        setResults(response.data || []);
        setShowDropdown(true);
      } catch (error) {
        console.error('Product search failed:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  };

  const handleSelect = (product) => {
    setSearchText(product.repoCode || product.prodCode || '');
    setSelectedProduct(product);
    setShowDropdown(false);
    onChange({
      repoCatg: product.repoCatg,
      catgPack: product.catgPack,
      repoDesc: product.repoDesc,
      prodQnty: 1,
    });
  };

  const handleChange = (e) => {
    const input = e.target.value;
    setSearchText(input);
    if (selectedProduct && input !== (selectedProduct.repoCode || selectedProduct.prodCode)) {
      setSelectedProduct(null);
    }
  };

  return (
    <div ref={wrapperRef} style={{ position: 'relative' }}>
      <Form.Group className="mb-3">
        <Form.Label>
          Product {required && <span style={{ color: 'red' }}>*</span>}
        </Form.Label>
        <Form.Control
          type="text"
          value={searchText}
          onChange={handleChange}
          onFocus={() => searchText.length >= 2 && results.length > 0 && setShowDropdown(true)}
          placeholder="Type product code or name..."
          required={required}
          autoComplete="off"
        />
      </Form.Group>

      {showDropdown && results.length > 0 && (
        <ListGroup
          style={{
            position: 'absolute',
            zIndex: 1000,
            maxHeight: '300px',
            overflowY: 'auto',
            width: '100%',
            marginTop: '-5px',
          }}
        >
          {results.map((product, index) => (
            <ListGroup.Item
              key={product.repoCode || product.prodCode || index}
              action
              onClick={() => handleSelect(product)}
              style={{ cursor: 'pointer' }}
            >
              <div className="fw-bold">
                {product.repoCode || product.prodCode}
              </div>
              <div className="text-muted small">
                {product.repoDesc || product.description}
              </div>
              {(product.catgPack || product.category) && (
                <div className="text-muted small">
                  Category: {CATEGORY_LABELS[product.catgPack] || product.catgPack || product.category}
                </div>
              )}
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

      {selectedProduct && (
        <div className="mt-2 p-2 border rounded bg-light small">
          <strong>Product Details:</strong>
          <div className="row mt-1">
            <div className="col-6">
              <div><strong>Code:</strong> {selectedProduct.repoCode || selectedProduct.prodCode}</div>
              <div><strong>Description:</strong> {selectedProduct.repoDesc || selectedProduct.description}</div>
            </div>
            <div className="col-6">
              <div><strong>Category:</strong> {CATEGORY_LABELS[selectedProduct.catgPack] || selectedProduct.catgPack || selectedProduct.category || '-'}</div>
              {(selectedProduct.catgPack || selectedProduct.category) && (
                <div><strong>Package:</strong> {selectedProduct.catgPack || selectedProduct.category}</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}