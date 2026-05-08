import { useState, useRef } from 'react';
import { Card, Button, Row, Col, Figure, Alert } from 'react-bootstrap';
import { dsrApi } from '../services/dsrApi';

const MAX_FILE_SIZE = 3 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];

export default function ImageUpload({ docuNumb, onImagesChange }) {
  const [uploadedImages, setUploadedImages] = useState([]);
  const [previewFiles, setPreviewFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const loadImages = async () => {
    if (!docuNumb) return;
    try {
      setLoading(true);
      const response = await dsrApi.getImages(docuNumb);
      setUploadedImages(response.data || []);
      if (onImagesChange) onImagesChange(response.data || []);
    } catch {
      setUploadedImages([]);
    } finally {
      setLoading(false);
    }
  };

  const validateFile = (file) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Only jpg, jpeg, and png files are allowed';
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'File size must be less than 3MB';
    }
    return null;
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setError('');

    const newPreviews = [];
    for (const file of files) {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }
      newPreviews.push({
        file,
        preview: URL.createObjectURL(file),
        name: file.name,
      });
    }

    setPreviewFiles((prev) => [...prev, ...newPreviews]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removePreview = (index) => {
    const file = previewFiles[index];
    if (file) {
      URL.revokeObjectURL(file.preview);
    }
    setPreviewFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (!docuNumb) {
      setError('Document number is required');
      return;
    }
    if (previewFiles.length === 0) {
      setError('No files to upload');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const newUploaded = [];
      for (const pf of previewFiles) {
        const response = await dsrApi.uploadImage(docuNumb, pf.file);
        newUploaded.push(response.data);
        URL.revokeObjectURL(pf.preview);
      }
      const updated = [...uploadedImages, ...newUploaded];
      setUploadedImages(updated);
      setPreviewFiles([]);
      if (onImagesChange) onImagesChange(updated);
    } catch {
      setError('Failed to upload images');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (atchNmId) => {
    try {
      await dsrApi.deleteImage(atchNmId);
      const updated = uploadedImages.filter((img) => img.atchNmId !== atchNmId);
      setUploadedImages(updated);
      if (onImagesChange) onImagesChange(updated);
    } catch {
      setError('Failed to delete image');
    }
  };

  const handleRemovePreview = (index) => {
    removePreview(index);
  };

  const handleClearAll = () => {
    previewFiles.forEach((pf) => URL.revokeObjectURL(pf.preview));
    setPreviewFiles([]);
  };

  return (
    <Card className="mb-3">
      <Card.Header>Image Upload</Card.Header>
      <Card.Body>
        {error && <Alert variant="danger" className="mb-3">{error}</Alert>}

        {uploadedImages.length > 0 && (
          <div className="mb-4">
            <h6 className="mb-2">Uploaded Images</h6>
            <Row xs={2} md={4} className="g-2">
              {uploadedImages.map((img) => (
                <Col key={img.atchNmId}>
                  <Figure.Image
                    src={img.imageUrl || `data:image/jpeg;base64,${img.imageData}`}
                    alt={img.fileName}
                    rounded
                    fluid
                    className="w-100"
                    style={{ height: '150px', objectFit: 'cover' }}
                  />
                  <div className="d-flex justify-content-between align-items-center mt-1">
                    <small className="text-muted text-truncate" style={{ maxWidth: '120px' }}>
                      {img.fileName}
                    </small>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleDelete(img.atchNmId)}
                    >
                      Delete
                    </Button>
                  </div>
                </Col>
              ))}
            </Row>
          </div>
        )}

        {previewFiles.length > 0 && (
          <div className="mb-4">
            <h6 className="mb-2">Pending Upload</h6>
            <Row xs={2} md={4} className="g-2">
              {previewFiles.map((pf, index) => (
                <Col key={index}>
                  <Figure.Image
                    src={pf.preview}
                    alt={pf.name}
                    rounded
                    fluid
                    className="w-100"
                    style={{ height: '150px', objectFit: 'cover' }}
                  />
                  <div className="d-flex justify-content-between align-items-center mt-1">
                    <small className="text-muted text-truncate" style={{ maxWidth: '120px' }}>
                      {pf.name}
                    </small>
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={() => handleRemovePreview(index)}
                    >
                      Remove
                    </Button>
                  </div>
                </Col>
              ))}
            </Row>
            <div className="d-flex gap-2 mt-3">
              <Button
                variant="primary"
                onClick={handleUpload}
                disabled={uploading || previewFiles.length === 0}
              >
                {uploading ? 'Uploading...' : 'Upload All'}
              </Button>
              <Button
                variant="outline-secondary"
                onClick={handleClearAll}
                disabled={uploading}
              >
                Clear All
              </Button>
            </div>
          </div>
        )}

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept={ALLOWED_TYPES.join(',')}
          multiple
          className="d-none"
        />
        <div className="d-flex gap-2 mt-2">
          <Button
            variant="secondary"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            Add More Images
          </Button>
          <Button
            variant="outline-primary"
            onClick={loadImages}
            disabled={loading || !docuNumb}
          >
            {loading ? 'Loading...' : 'Refresh Images'}
          </Button>
        </div>
        <small className="text-muted d-block mt-2">
          Accepted formats: jpg, jpeg, png (max 3MB)
        </small>
      </Card.Body>
    </Card>
  );
}