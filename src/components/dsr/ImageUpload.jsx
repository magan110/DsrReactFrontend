import React, { useState, useRef } from 'react';
import { Button, Table, Card, Modal, Alert } from 'react-bootstrap';

const DOCUMENT_TYPES = [
  { code: '1BF', desc: 'Before' },
  { code: '2AF', desc: 'After' },
  { code: 'ADH', desc: 'More Image' },
];

const ImageUpload = ({ formData, setFormData }) => {
  const images = formData?.images || [];
  const [showViewer, setShowViewer] = useState(false);
  const [viewImage, setViewImage] = useState('');
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef(null);

  const addImage = () => {
    const newImage = {
      id: Date.now(),
      file: null,
      preview: '',
      docuType: 'ADH',
      uploaded: false
    };
    setFormData(prev => ({
      ...prev,
      images: [...(prev.images || []), newImage]
    }));
  };

  const removeImage = (id) => {
    setFormData(prev => ({
      ...prev,
      images: (prev.images || []).filter(img => img.id !== id)
    }));
  };

  const updateImage = (id, updates) => {
    setFormData(prev => ({
      ...prev,
      images: (prev.images || []).map(img =>
        img.id === id ? { ...img, ...updates } : img
      )
    }));
  };

  const handleFileSelect = (imageId, file) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Only JPG, JPEG, and PNG files are allowed');
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      setUploadError('File size should not exceed 3MB');
      return;
    }

    setUploadError('');

    const reader = new FileReader();
    reader.onload = (e) => {
      const upldFlNm = `KKR1162948${formData?.randNmSt || '001'}${imageId}`;
      updateImage(imageId, { file, preview: e.target.result, upldFlNm });
    };
    reader.readAsDataURL(file);
  };

  const handleView = (image) => {
    if (image.preview) {
      setViewImage(image.preview);
      setShowViewer(true);
    }
  };

  return (
    <Card className="mb-3">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h6 className="mb-0 fw-bold">Upload Supporting / View Images</h6>
        <Button variant="primary" size="sm" onClick={addImage}>
          + Add Image
        </Button>
      </Card.Header>
      <Card.Body>
        {uploadError && (
          <Alert variant="warning" dismissible onClose={() => setUploadError('')}>
            {uploadError}
          </Alert>
        )}

        {images.length === 0 ? (
          <div className="text-center text-muted py-3">
            No images added yet. Click "Add Image" to upload photos.
          </div>
        ) : (
          <div className="table-responsive">
            <Table bordered size="sm" className="align-middle">
              <thead>
                <tr>
                  <th style={{ width: '80px' }}>Del</th>
                  <th style={{ width: '120px' }}>Type</th>
                  <th>Preview</th>
                  <th style={{ width: '200px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {images.map((image) => (
                  <tr key={image.id}>
                    <td className="text-center">
                      <Button variant="danger" size="sm" onClick={() => removeImage(image.id)}>
                        Del
                      </Button>
                    </td>
                    <td>
                      <select
                        className="form-select form-select-sm"
                        value={image.docuType || 'ADH'}
                        onChange={(e) => updateImage(image.id, { docuType: e.target.value })}
                      >
                        {DOCUMENT_TYPES.map((type) => (
                          <option key={type.code} value={type.code}>
                            {type.desc}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      {image.preview ? (
                        <img
                          src={image.preview}
                          alt="Preview"
                          className="img-thumbnail"
                          style={{ maxHeight: '80px', cursor: 'pointer' }}
                          onClick={() => handleView(image)}
                        />
                      ) : (
                        <span className="text-muted small">No file</span>
                      )}
                    </td>
                    <td>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="me-1"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Select
                      </Button>
                      <Button
                        variant="info"
                        size="sm"
                        onClick={() => handleView(image)}
                        disabled={!image.preview}
                      >
                        View
                      </Button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".jpg,.jpeg,.png"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          if (e.target.files[0]) {
                            handleFileSelect(image.id, e.target.files[0]);
                          }
                        }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </Card.Body>

      <Modal show={showViewer} onHide={() => setShowViewer(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Image View</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          {viewImage && (
            <img src={viewImage} alt="View" className="img-fluid" style={{ maxHeight: '70vh' }} />
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowViewer(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Card>
  );
};

export default ImageUpload;

