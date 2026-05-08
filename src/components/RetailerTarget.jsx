import { useState, useEffect, useCallback } from 'react';
import { Card, Form, Button, ProgressBar, Row, Col, Alert, Table } from 'react-bootstrap';
import { dsrApi } from '../services/dsrApi';

const REPO_CATEGORIES = [
  { code: '01', name: 'Cement' },
  { code: '02', name: 'Putty' },
  { code: '03', name: 'VAP' },
];

export default function RetailerTarget({ loginIdM, monthYear, onTargetsComplete, blocked = true }) {
  const [targets, setTargets] = useState([]);
  const [mappedRetailers, setMappedRetailers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editing, setEditing] = useState({});

  const loadData = useCallback(async () => {
    if (!loginIdM || !monthYear) return;
    setLoading(true);
    setError('');
    try {
      const [targetsRes, retailersRes] = await Promise.all([
        dsrApi.getRetailerTargets(loginIdM, monthYear),
        dsrApi.searchCustomers('', '01'),
      ]);
      const targetsData = targetsRes.data || [];
      const retailersData = retailersRes.data || [];
      setTargets(targetsData);
      setMappedRetailers(retailersData);
      setEditing({});
      targetsData.forEach((t) => {
        if (t.targetCem > 0 || t.targetPut > 0 || t.targetVap > 0) {
          setEditing((prev) => ({ ...prev, [t.retaId]: true }));
        }
      });
    } catch (err) {
      console.error('Failed to load retailer targets:', err);
      setError('Failed to load retailer targets');
    } finally {
      setLoading(false);
    }
  }, [loginIdM, monthYear]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const calculatePercentages = (repoCatg) => {
    if (mappedRetailers.length === 0) return { entered: 0, total: 0, percentage: 0 };
    const total = mappedRetailers.length;
    let entered = 0;
    targets.forEach((t) => {
      const hasTarget =
        (repoCatg === '01' && t.targetCem > 0) ||
        (repoCatg === '02' && t.targetPut > 0) ||
        (repoCatg === '03' && t.targetVap > 0);
      if (hasTarget) entered++;
    });
    const percentage = total > 0 ? Math.round((entered / total) * 100) : 0;
    return { entered, total, percentage };
  };

  const isAllComplete = () => {
    return REPO_CATEGORIES.every((catg) => calculatePercentages(catg.code).percentage === 100);
  };

  const handleTargetChange = (retaId, repoCatg, value) => {
    const numValue = parseFloat(value) || 0;
    setTargets((prev) => {
      const existing = prev.find((t) => t.retaId === retaId);
      if (existing) {
        return prev.map((t) => {
          if (t.retaId === retaId) {
            const updated = { ...t };
            if (repoCatg === '01') updated.targetCem = numValue;
            if (repoCatg === '02') updated.targetPut = numValue;
            if (repoCatg === '03') updated.targetVap = numValue;
            return updated;
          }
          return t;
        });
      } else {
        const newTarget = {
          retaId,
          repoCatg,
          loginIdM,
          monthYear,
          targetCem: repoCatg === '01' ? numValue : 0,
          targetPut: repoCatg === '02' ? numValue : 0,
          targetVap: repoCatg === '03' ? numValue : 0,
        };
        return [...prev, newTarget];
      }
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await dsrApi.saveRetailerTargets(loginIdM, targets);
      setSuccess('Targets saved successfully');
      if (onTargetsComplete && isAllComplete()) {
        onTargetsComplete(true);
      }
      setEditing({});
    } catch (err) {
      console.error('Failed to save targets:', err);
      setError('Failed to save targets');
    } finally {
      setSaving(false);
    }
  };

  const handleEditToggle = (retaId) => {
    setEditing((prev) => ({ ...prev, [retaId]: !prev[retaId] }));
  };

  const getTargetValue = (retaId, repoCatg) => {
    const target = targets.find((t) => t.retaId === retaId);
    if (!target) return '';
    if (repoCatg === '01') return target.targetCem || '';
    if (repoCatg === '02') return target.targetPut || '';
    if (repoCatg === '03') return target.targetVap || '';
    return '';
  };

  const percentages = {
    cement: calculatePercentages('01'),
    putty: calculatePercentages('02'),
    vap: calculatePercentages('03'),
  };

  const allComplete = isAllComplete();

  if (loading) {
    return (
      <Card className="mb-3">
        <Card.Body className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="mb-3">
      <Card.Header className="bg-primary text-white">
        <h5 className="mb-0">Retailer Target Entry</h5>
      </Card.Header>
      <Card.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        <Alert variant={allComplete ? 'success' : 'warning'}>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <strong>Mapped Retailers: {mappedRetailers.length}</strong>
              <div className="small text-muted">Set targets for all retailers to unlock DSR entry</div>
            </div>
            <div className="text-end">
              <strong>Status: </strong>
              {allComplete ? (
                <span className="text-success">100% Complete</span>
              ) : (
                <span className="text-danger">Incomplete</span>
              )}
            </div>
          </div>
        </Alert>

        <Row className="mb-3 g-3">
          {REPO_CATEGORIES.map((catg) => {
            const pct = percentages[catg.name.toLowerCase()];
            return (
              <Col key={catg.code} xs={12} md={4}>
                <Card className="h-100">
                  <Card.Body className="py-2">
                    <div className="d-flex justify-content-between mb-2">
                      <strong>{catg.name}</strong>
                      <span className={pct.percentage === 100 ? 'text-success' : 'text-danger'}>
                        {pct.entered}/{pct.total} ({pct.percentage}%)
                      </span>
                    </div>
                    <ProgressBar
                      now={pct.percentage}
                      variant={pct.percentage === 100 ? 'success' : 'danger'}
                      style={{ height: '20px' }}
                    />
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>

        {blocked && !allComplete && (
          <Alert variant="danger" className="mb-3">
            <strong>DSR Entry Blocked:</strong> Please set 100% targets for all categories (Cement, Putty, VAP) to unlock DSR entry.
          </Alert>
        )}

        <Form>
          <Table responsive striped hover bordered>
            <thead>
              <tr>
                <th>#</th>
                <th>Retailer</th>
                <th>Cement</th>
                <th>Putty</th>
                <th>VAP</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {mappedRetailers.map((retailer, index) => {
                const retaId = retailer.cusRtlCd || retailer.code;
                const isEditing = editing[retaId];
                return (
                  <tr key={retaId}>
                    <td>{index + 1}</td>
                    <td>
                      <div className="fw-bold">{retaId}</div>
                      <div className="text-muted small">{retailer.cusRtlNm || retailer.name || '-'}</div>
                    </td>
                    <td>
                      {isEditing ? (
                        <Form.Control
                          type="number"
                          size="sm"
                          value={getTargetValue(retaId, '01')}
                          onChange={(e) => handleTargetChange(retaId, '01', e.target.value)}
                          placeholder="Target"
                          min="0"
                        />
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                    <td>
                      {isEditing ? (
                        <Form.Control
                          type="number"
                          size="sm"
                          value={getTargetValue(retaId, '02')}
                          onChange={(e) => handleTargetChange(retaId, '02', e.target.value)}
                          placeholder="Target"
                          min="0"
                        />
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                    <td>
                      {isEditing ? (
                        <Form.Control
                          type="number"
                          size="sm"
                          value={getTargetValue(retaId, '03')}
                          onChange={(e) => handleTargetChange(retaId, '03', e.target.value)}
                          placeholder="Target"
                          min="0"
                        />
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                    <td>
                      <Button
                        variant={isEditing ? 'outline-secondary' : 'outline-primary'}
                        size="sm"
                        onClick={() => handleEditToggle(retaId)}
                      >
                        {isEditing ? 'Cancel' : 'Edit'}
                      </Button>
                    </td>
                  </tr>
                );
              })}
              {mappedRetailers.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center text-muted py-4">
                    No mapped retailers found
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Form>

        {targets.length > 0 && (
          <div className="d-flex justify-content-end gap-2 mt-3">
            <Button variant="primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Targets'}
            </Button>
          </div>
        )}
      </Card.Body>
    </Card>
  );
}