import { useState, useEffect, useMemo } from 'react';
import { Form, Button, Row, Col, Card, Alert, Table } from 'react-bootstrap';
import { dsrApi } from '../services/dsrApi';
import { validateMobile, validateRequired, validateMaxLength, validateNumeric, validateDate, validateDateRange, validateKycCount, validateProductCode, validateCounterType, validateNearestStockiest } from '../utils/validation';
import PincodeSelect from './PincodeSelect';
import ImageUpload from './ImageUpload';
import ProductSelect from './ProductSelect';
import LocationCapture from './LocationCapture';

const ACTIVITY_CATEGORY_MAP = {
  '01': '01', // Cement
  '02': '02', // Putty
  '51': '03', // Primers
  '11': '04', // Paints
  '21': '05', // Adhesives
  '61': null, // All products (no filter)
};

export default function DsrActivityForm({ zone = '' }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [formName] = useState('DSRActv');
  const [submMthd, setSubmMthd] = useState('A');
  const [randNmSt, setRandNmSt] = useState('');
  const [locaCapr] = useState('N');
  const [activityTypes, setActivityTypes] = useState([]);
  const [customerTypes, setCustomerTypes] = useState([]);
  const [errors, setErrors] = useState({});
  const [uploadedImageIds, setUploadedImageIds] = useState([]);
  const [activeDocuNumb, setActiveDocuNumb] = useState(null);
  const [customerName, setCustomerName] = useState('');
  const [customerLoading, setCustomerLoading] = useState(false);
  const [customerNotFound, setCustomerNotFound] = useState(false);
  const [customerLocation, setCustomerLocation] = useState(null);
  const [retailerTargetStatus, setRetailerTargetStatus] = useState(null);
  const [lastMarketData, setLastMarketData] = useState([]);
  
  const [formData, setFormData] = useState({
    procType: 'A',
    docuNumb: '',
    docuDate: new Date().toISOString().split('T')[0],
    dsrParam: '',
    cusRtlFl: '',
    areaCode: '',
    cusRtlCd: '',
    dsrRem01: '',
    dsrRem02: '',
    dsrRem03: '',
    dsrRem04: '',
    dsrRem05: '',
    dsrRem06: '',
    dsrRem07: '',
    dsrRem08: '',
    dsrRem09: '',
    district: '',
    pinCodeN: '',
    cityName: '',
    cstBisTy: '',
    cuRtType: '',
    deptCode: 'KKR116',
    custCdRt: '',
    latitute: '',
    lgtitute: '',
    geoLatit: '',
    geoLongt: '',
    FinlRslt: '',
    details: [],
    marketDetails: [],
    actionDetails: [],
  });

  const [detailRow, setDetailRow] = useState({
    repoCatg: '',
    prodQnty: '',
    projQnty: '',
    actnRemk: '',
    targetDt: '',
  });

  const [marketRow, setMarketRow] = useState({
    repoCatg: '',
    prodQnty: '',
    projQnty: '',
    mrktData: '',
  });

  const loadOptions = async () => {
    try {
      const [types, custTypes] = await Promise.all([
        dsrApi.getActivityTypes(),
        dsrApi.getCustomerTypes(),
      ]);
      setActivityTypes(types.data);
      setCustomerTypes(custTypes.data);
    } catch {
      console.error('Error loading options');
    }
  };

  const loadRetailerTargetStatus = async () => {
    try {
      const userId = localStorage.getItem('userId') || 'SYSTEM';
      const response = await dsrApi.getRetailerTargetStatus(userId);
      setRetailerTargetStatus(response.data);
    } catch {
      console.error('Error loading retailer target status');
    }
  };

  const loadLastMarketData = async () => {
    if (formData.dsrParam === '50' || formData.dsrParam === '01') {
      try {
        const userId = localStorage.getItem('userId') || 'SYSTEM';
        const response = await dsrApi.getLastMarketData(userId);
        const filtered = (response.data || []).filter(d => d.repoCatg === '01' || d.repoCatg === '02');
        setLastMarketData(filtered);
      } catch {
        setLastMarketData([]);
      }
    }
  };

  useEffect(() => {
    if (formData.dsrParam === '50' || formData.dsrParam === '01') {
      loadLastMarketData();
    } else {
      setLastMarketData([]);
    }
  }, [formData.dsrParam]);

  const loadActivity = async (docuNumb) => {
    try {
      setLoading(true);
      const response = await dsrApi.getActivity(docuNumb);
      const activity = response.data;
      setFormData((prev) => ({
        ...prev,
        dsrParam: activity.dsrParam,
        cusRtlFl: activity.cusRtlFl,
        areaCode: activity.areaCode,
        cusRtlCd: activity.cusRtlCd,
        dsrRem01: activity.dsrRem01 || '',
        dsrRem02: activity.dsrRem02 || '',
        dsrRem03: activity.dsrRem03 || '',
        dsrRem04: activity.dsrRem04 || '',
        dsrRem05: activity.dsrRem05 || '',
        dsrRem06: activity.dsrRem06 || '',
        dsrRem07: activity.dsrRem07 || '',
        dsrRem08: activity.dsrRem08 || '',
        dsrRem09: activity.dsrRem09 || '',
        district: activity.district || '',
        pinCodeN: activity.pinCodeN || '',
        cityName: activity.cityName || '',
        cstBisTy: activity.cstBisTy || '',
        cuRtType: activity.cuRtType || '',
        latitute: activity.latitute || '',
        lgtitute: activity.lgtitute || '',
        details: activity.details || [],
        marketDetails: [],
        actionDetails: [],
      }));
    } catch {
      setMessage('Error loading activity');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setRandNmSt(Math.random().toString(36).substring(2, 15) + Date.now().toString(36));
    loadOptions();
    loadRetailerTargetStatus();
  }, []);

  useEffect(() => {
    if (formData.procType === 'U' && formData.docuNumb) {
      loadActivity(formData.docuNumb);
    }
  }, [formData.procType, formData.docuNumb]);

  useEffect(() => {
    const fetchCustomerDetails = async () => {
      if (!formData.cusRtlCd || !formData.areaCode) {
        setCustomerName('');
        setCustomerNotFound(false);
        return;
      }
      setCustomerLoading(true);
      setCustomerNotFound(false);
      try {
        const response = await dsrApi.getCustomerDetails(formData.cusRtlCd, formData.areaCode);
        if (response.data && response.data.cusName) {
          setCustomerName(response.data.cusName);
          setCustomerNotFound(false);
          if (response.data.latitute && response.data.lgtitute) {
            setCustomerLocation({
              lat: parseFloat(response.data.latitute),
              lng: parseFloat(response.data.lgtitute),
            });
            setFormData((prev) => ({
              ...prev,
              latitute: response.data.latitute,
              lgtitute: response.data.lgtitute,
            }));
          } else {
            setCustomerLocation(null);
          }
        } else {
          setCustomerName('');
          setCustomerNotFound(true);
          setCustomerLocation(null);
        }
      } catch {
        setCustomerName('');
        setCustomerNotFound(true);
        setCustomerLocation(null);
      } finally {
        setCustomerLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchCustomerDetails, 300);
    return () => clearTimeout(timeoutId);
  }, [formData.cusRtlCd, formData.areaCode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    if (name === 'docuNumb' && formData.procType === 'U') {
      setActiveDocuNumb(value || null);
    }
    
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    if (name === 'dsrParam' && (value === '50' || value === '61')) {
      setFormData((prev) => ({ ...prev, dsrParam: value, dsrRem01: '', dsrRem02: '', dsrRem03: '', dsrRem04: '' }));
    }
  };

  const handleDetailChange = (e) => {
    const { name, value } = e.target;
    setDetailRow((prev) => ({ ...prev, [name]: value }));
  };

  const handleMarketChange = (e) => {
    const { name, value } = e.target;
    setMarketRow((prev) => ({ ...prev, [name]: value }));
  };

  const handleProductSelect = (productData) => {
    setDetailRow((prev) => ({
      ...prev,
      repoCatg: productData.repoCatg || '',
      catgPack: productData.catgPack || '',
      repoDesc: productData.repoDesc || '',
    }));
  };

  const handlePincodeChange = (pincodeData) => {
    setFormData((prev) => ({
      ...prev,
      pinCodeN: pincodeData.pinCodeN,
      cityName: pincodeData.cityName,
      district: pincodeData.district,
    }));
    if (errors.pinCodeN) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.pinCodeN;
        return newErrors;
      });
    }
  };

  const handleLocationChange = (location) => {
    if (location) {
      setFormData((prev) => ({
        ...prev,
        geoLatit: location.lat.toString(),
        geoLongt: location.lng.toString(),
      }));
    }
  };

  const isPincodeAutocompleteEnabled = (formData.dsrParam === '50' || formData.dsrParam === '61') && 
    (zone === 'A' || zone === 'B');

  const addDetailRow = () => {
    if (!detailRow.repoCatg && !detailRow.prodQnty && !detailRow.actnRemk) return;
    setFormData((prev) => ({
      ...prev,
      details: [...prev.details, { ...detailRow, docuSrNo: prev.details.length + 1 }],
    }));
    setDetailRow({ repoCatg: '', catgPack: '', repoDesc: '', prodQnty: '', projQnty: '', actnRemk: '', targetDt: '' });
  };

  const addMarketRow = () => {
    if (!marketRow.repoCatg) return;
    const isMarketDataRow = formData.dsrParam === '50' || formData.dsrParam === '01';
    setFormData((prev) => ({
      ...prev,
      marketDetails: [...prev.marketDetails, { ...marketRow, mrktData: isMarketDataRow ? '01' : null }],
    }));
    setMarketRow({ repoCatg: '', prodQnty: '', projQnty: '', mrktData: '' });
  };

  const removeDetailRow = (index) => {
    setFormData((prev) => ({
      ...prev,
      details: prev.details.filter((_, i) => i !== index),
    }));
  };

  const deleteSelectedRows = () => {
    setFormData((prev) => ({
      ...prev,
      details: prev.details.filter((d) => !d.selected),
    }));
  };

  const deleteSelectedMarketRows = () => {
    setFormData((prev) => ({
      ...prev,
      marketDetails: prev.marketDetails.filter((d) => !d.selected),
    }));
  };

  const removeMarketRow = (index) => {
    setFormData((prev) => ({
      ...prev,
      marketDetails: prev.marketDetails.filter((_, i) => i !== index),
    }));
  };

  const getFieldsForActivityType = () => {
    const param = formData.dsrParam;
    const fields = {
      showCustomer: param === '50' || param === '61' || param === '01' || param === '02' || param === '11' || param === '12' || param === '13' || param === '21' || param === '22' || param === '23' || param === '41',
      showNewVisit: param === '50' || param === '61',
      showProduct: param === '01' || param === '02' || param === '61' || param === '51' || param === '11' || param === '21',
      showProject: param === '01' || param === '02' || param === '21',
      showMarket: param === '50' || param === '01',
      showAction: param === '52' || param === '13' || param === '23' || param === '41' || param === '50',
      showSiteDetails: param === '21' || param === '22' || param === '23',
      showEngagement: param === '51',
      showLeave: param === '54',
      showOffice: param === '53',
      showAdvertisement: param === '41',
      showSampling: param === '31',
      hideCustomerCode: param === '50' || param === '61',
    };
    return fields;
  };

  const getRemarkLabels = () => {
    const param = formData.dsrParam;
    const labels = {
      rem01: 'Topic Discussed',
      rem02: 'Recovery Plans',
      rem03: 'Grievances',
      rem04: 'Other Points',
    };

    if (param === '50' || param === '61') {
      return { rem01: 'Party Name', rem02: 'Name and Designation', rem03: 'Topics Discussed', rem04: 'Other Points' };
    }
    if (param === '41') {
      return { rem01: 'Dangler', rem02: 'Posters', rem03: 'Stickers', rem04: 'Feedback', rem05: 'Recommendations', rem06: 'Insights' };
    }
    if (param === '51') {
      return { rem01: 'Type of Activity', rem02: 'No of Participants', rem03: 'Town', rem04: 'Learning\'s' };
    }
    if (param === '52') {
      return { rem01: 'Meeting Done With', rem02: 'Topics Discussed' };
    }
    if (param === '53') {
      return { rem01: 'Work Related To', rem02: 'No of Hours Spent' };
    }
    if (param === '54') {
      return { rem01: 'Remarks' };
    }
    if (param === '31') {
      return { rem01: 'Site Name', rem02: 'Product', rem03: 'Approx Potential (MT)', rem04: 'Applicator Name', rem05: 'Quality', rem06: 'Status', rem07: 'Contact Name', rem08: 'Mobile No' };
    }
    if (param === '11' || param === '12' || param === '13') {
      return { rem01: 'Site Name', rem02: 'Contractor', rem03: 'Met With', rem04: 'Name and Designation', rem05: 'Topic', rem06: 'Recovery Plans', rem07: 'Grievances', rem08: 'Other Points' };
    }
    if (param === '21' || param === '22' || param === '23') {
      return { rem01: 'Site Type', rem02: 'Contractor', rem03: 'Agenda', rem04: 'Action Points', rem05: 'Contact Name', rem06: 'Mobile No' };
    }
    return labels;
  };

  const validateFormData = () => {
    const newErrors = {};
    const fieldVisibility = getFieldsForActivityType();

    if (retailerTargetStatus && !retailerTargetStatus.isComplete) {
      newErrors.retailerTarget = `Retailer Target not complete. Please complete 100% target before submitting DSR. Cement: ${retailerTargetStatus.cementPercent || 0}%, Putty: ${retailerTargetStatus.puttyPercent || 0}%, VAP: ${retailerTargetStatus.vapPercent || 0}%`;
      return newErrors;
    }

    const dateRequired = validateRequired(formData.docuDate, 'Report Date');
    if (!dateRequired.isValid) newErrors.docuDate = dateRequired.message;
    else {
      const dateValid = validateDate(formData.docuDate, false);
      if (!dateValid.isValid) newErrors.docuDate = dateValid.message;
      else {
        const dateRange = validateDateRange(formData.docuDate, 3);
        if (!dateRange.isValid) newErrors.docuDate = dateRange.message;
      }
    }

    const activityRequired = validateRequired(formData.dsrParam, 'Activity Type');
    if (!activityRequired.isValid) newErrors.dsrParam = activityRequired.message;

    if (fieldVisibility.showCustomer) {
      const areaCodeLength = validateMaxLength(formData.areaCode, 'Area Code', 10);
      if (!areaCodeLength.isValid) newErrors.areaCode = areaCodeLength.message;

      const customerLength = validateMaxLength(formData.cusRtlCd, 'Customer Code', 20);
      if (!customerLength.isValid) newErrors.cusRtlCd = customerLength.message;

      const pincodeResult = validateNumeric(formData.pinCodeN, 'Pin Code');
      if (!pincodeResult.isValid) newErrors.pinCodeN = pincodeResult.message;
    }

    if (fieldVisibility.showNewVisit) {
      if (formData.dsrRem08) {
        const mobileResult = validateMobile(formData.dsrRem08);
        if (!mobileResult.isValid) newErrors.dsrRem08 = mobileResult.message;
      }

      if (formData.dsrRem09) {
        const kycResult = validateKycCount(formData.dsrRem09);
        if (!kycResult.isValid) newErrors.dsrRem09 = kycResult.message;
      }

      const stockiestLength = validateMaxLength(formData.custCdRt, 'Nearest Stockiest', 20);
      if (!stockiestLength.isValid) newErrors.custCdRt = stockiestLength.message;

      const districtLength = validateMaxLength(formData.district, 'District', 50);
      if (!districtLength.isValid) newErrors.district = districtLength.message;

      const cityLength = validateMaxLength(formData.cityName, 'City', 50);
      if (!cityLength.isValid) newErrors.cityName = cityLength.message;

      const counterTypeResult = validateCounterType(formData.cstBisTy);
      if (!counterTypeResult.isValid) newErrors.cstBisTy = counterTypeResult.message;

      const nearestStockiestResult = validateNearestStockiest(formData.custCdRt, formData.cusRtlFl);
      if (!nearestStockiestResult.isValid) newErrors.custCdRt = nearestStockiestResult.message;
    }

    if (fieldVisibility.showSampling) {
      const remLength1 = validateMaxLength(formData.dsrRem01, remarkLabels.rem01 || 'Site Name', 100);
      if (!remLength1.isValid) newErrors.dsrRem01 = remLength1.message;

      const remLength7 = validateMaxLength(formData.dsrRem07, remarkLabels.rem07 || 'Contact Name', 50);
      if (!remLength7.isValid) newErrors.dsrRem07 = remLength7.message;

      if (formData.dsrRem08) {
        const mobileResult = validateMobile(formData.dsrRem08);
        if (!mobileResult.isValid) newErrors.dsrRem08 = mobileResult.message;
      }
    }

    if (fieldVisibility.showProduct) {
      formData.details.forEach((detail, index) => {
        if (detail.repoCatg && !fieldVisibility.showAction) {
          const productResult = validateProductCode(detail.repoCatg);
          if (!productResult.isValid) {
            newErrors[`details_${index}_repoCatg`] = productResult.message;
          }
        }

        if (detail.prodQnty !== undefined && detail.prodQnty !== '') {
          const qtyResult = validateNumeric(detail.prodQnty, `Quantity for row ${index + 1}`);
          if (!qtyResult.isValid) {
            newErrors[`details_${index}_prodQnty`] = qtyResult.message;
          }
        }

        if (detail.projQnty !== undefined && detail.projQnty !== '') {
          const projResult = validateNumeric(detail.projQnty, `Projection for row ${index + 1}`);
          if (!projResult.isValid) {
            newErrors[`details_${index}_projQnty`] = projResult.message;
          }
        }
      });
    }

    const remarkFields = ['dsrRem01', 'dsrRem02', 'dsrRem03', 'dsrRem04', 'dsrRem05', 'dsrRem06', 'dsrRem07', 'dsrRem08', 'dsrRem09'];
    remarkFields.forEach(field => {
      if (formData[field]) {
        const lengthResult = validateMaxLength(formData[field], field, 500);
        if (!lengthResult.isValid) {
          newErrors[field] = lengthResult.message;
        }
      }
    });

    return newErrors;
  };

  const isFormValid = useMemo(() => {
    const validationErrors = validateFormData();
    return Object.keys(validationErrors).length === 0;
  }, [formData]);

  const handleSubmit = async (e, submitMethod = 'A') => {
    e.preventDefault();
    setSubmMthd(submitMethod);
    setLoading(true);
    setMessage('');

    const validationErrors = validateFormData();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setLoading(false);
      return;
    }

    try {
      const payload = {
        ...formData,
        formName,
        submMthd: submitMethod,
        randNmSt,
        locaCapr,
        docuDate: formData.docuDate,
        atchNmId: uploadedImageIds,
        details: formData.details.map((d, i) => ({
          ...d,
          docuSrNo: i + 1,
          prodQnty: parseFloat(d.prodQnty) || 0,
          projQnty: parseFloat(d.projQnty) || 0,
        })),
      };

      let response;
      if (formData.procType === 'A') {
        response = await dsrApi.createActivity(payload);
        const newDocuNumb = response.data.docuNumb;
        setMessage(`Activity created: ${newDocuNumb}`);
        setActiveDocuNumb(newDocuNumb);
      } else {
        response = await dsrApi.updateActivity(formData.docuNumb, payload);
        setMessage('Activity updated successfully');
        setActiveDocuNumb(formData.docuNumb);
      }
      
      resetForm();
    } catch {
      setMessage('Error saving activity');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = (keepImages = false, keepDocuNumb = false) => {
    setSubmMthd('A');
    setFormData({
      procType: keepDocuNumb && formData.procType === 'U' ? 'U' : 'A',
      docuNumb: keepDocuNumb && formData.procType === 'U' ? formData.docuNumb : '',
      docuDate: new Date().toISOString().split('T')[0],
      dsrParam: '',
      cusRtlFl: '',
      areaCode: '',
      cusRtlCd: '',
      dsrRem01: '',
      dsrRem02: '',
      dsrRem03: '',
      dsrRem04: '',
      dsrRem05: '',
      dsrRem06: '',
      dsrRem07: '',
      dsrRem08: '',
      dsrRem09: '',
      district: '',
      pinCodeN: '',
      cityName: '',
      cstBisTy: '',
      cuRtType: '',
      deptCode: 'KKR116',
      custCdRt: '',
      latitute: '',
      lgtitute: '',
      geoLatit: '',
      geoLongt: '',
      FinlRslt: '',
      details: [],
      marketDetails: [],
      actionDetails: [],
    });
    if (!keepDocuNumb || formData.procType !== 'U') {
      setRandNmSt(Math.random().toString(36).substring(2, 15) + Date.now().toString(36));
    }
    setMessage('');
    setErrors({});
    if (!keepImages) {
      setUploadedImageIds([]);
      setActiveDocuNumb(null);
    }
    setCustomerLocation(null);
  };

  const handleImagesChange = (images) => {
    const ids = images.map(img => img.atchNmId).filter(Boolean);
    setUploadedImageIds(ids);
  };

  const remarkLabels = getRemarkLabels();
  const fieldVisibility = getFieldsForActivityType();
  
  const { showCustomer, showNewVisit, showProduct, showProject, showMarket, showAction, showSiteDetails, showEngagement, showLeave, showOffice, showSampling, hideCustomerCode } = fieldVisibility;

  const counterTypes = [
    { code: '01', name: 'Paint Counter' },
    { code: '02', name: 'Non Paint Counter' },
    { code: '03', name: 'Gypsum Counter' },
    { code: '04', name: 'Other' },
  ];

  const siteTypes = ['IHB', 'Project'];
  const sampleQuality = ['Average', 'Medium', 'Good'];
  const sampleStatus = ['Yet to be checked', 'Approved', 'Rejected'];
  const engagementTypes = ['Retailer Meet', 'Rural Retailer Meet', 'Stockiest Meet', 'Painter Meet', 'Architect Meet', 'Counter Meet', 'Painter Training Program', 'Other BTL Activities'];
  const products = ['White Cement', 'Wall Care Putty', 'Textura', 'Levelplast', 'Wall Primer'];

  return (
    <div className="container-fluid py-4">
      <h4 className="mb-4">DSR Activity Entry</h4>
      
      {message && (
        <Alert variant={message.includes('Error') ? 'danger' : 'success'}>{message}</Alert>
      )}

      <Form onSubmit={(e) => handleSubmit(e, 'A')}>
        <input type="hidden" name="formName" value={formName} />
        <input type="hidden" name="submMthd" value={submMthd} />
        <input type="hidden" name="randNmSt" value={randNmSt} />
        <input type="hidden" name="locaCapr" value={locaCapr} />
        <Card className="mb-3">
          <Card.Header>Basic Information</Card.Header>
          <Card.Body>
            <Row>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Process Type</Form.Label>
                  <Form.Select name="procType" value={formData.procType} onChange={handleChange}>
                    <option value="A">Add</option>
                    <option value="U">Update</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              
              {formData.procType === 'U' && (
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>Document No</Form.Label>
                    <Form.Control
                      type="text"
                      name="docuNumb"
                      value={formData.docuNumb}
                      onChange={handleChange}
                      placeholder="Enter Document No"
                    />
                  </Form.Group>
                </Col>
              )}
              
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Report Date</Form.Label>
                  <Form.Control type="date" name="docuDate" value={formData.docuDate} onChange={handleChange} isInvalid={!!errors.docuDate} />
                  <Form.Control.Feedback type="invalid">{errors.docuDate}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              
<Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>Activity Type</Form.Label>
                    <Form.Select name="dsrParam" value={formData.dsrParam} onChange={handleChange} required isInvalid={!!errors.dsrParam}>
                      <option value="">Select Activity</option>
                      {activityTypes.map((type) => (
                        <option key={type.code} value={type.code}>{type.description}</option>
                      ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">{errors.dsrParam}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
            </Row>
          </Card.Body>
        </Card>

        {showCustomer && (
          <Card className="mb-3">
            <Card.Header>Customer Information</Card.Header>
            <Card.Body>
              <Row>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>Area Code</Form.Label>
                    <Form.Control type="text" name="areaCode" value={formData.areaCode} onChange={handleChange} placeholder="Area Code" />
                  </Form.Group>
                </Col>
                
                {showCustomer && !hideCustomerCode && (
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>Customer Type</Form.Label>
                      <Form.Select name="cusRtlFl" value={formData.cusRtlFl} onChange={handleChange}>
                        <option value="">Select Type</option>
                        {customerTypes.map((type) => (
                          <option key={type.code} value={type.code}>{type.description}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                )}
                
                {!hideCustomerCode && (
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>Customer Code</Form.Label>
                      <Form.Control type="text" name="cusRtlCd" value={formData.cusRtlCd} onChange={handleChange} placeholder="Customer Code" />
                    </Form.Group>
                    {(formData.cusRtlCd || formData.areaCode) && (
                      <div id="cusRtlCdDiv1" className="mt-2">
                        {customerLoading ? (
                          <span className="text-muted">Loading...</span>
                        ) : customerNotFound ? (
                          <span className="text-danger">Not Found</span>
                        ) : customerName ? (
                          <span className="text-success">{customerName}</span>
                        ) : null}
                      </div>
                    )}
                  </Col>
                )}
                
                {showNewVisit && (
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>Mobile No</Form.Label>
                      <Form.Control type="text" name="dsrRem08" value={formData.dsrRem08} onChange={handleChange} placeholder="Mobile Number" isInvalid={!!errors.dsrRem08} />
                      <Form.Control.Feedback type="invalid">{errors.dsrRem08}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                )}
              </Row>
              
              {showNewVisit && (
                <>
                  <Row>
                    <Col md={3}>
                      <Form.Group className="mb-3">
                        <Form.Label>Nearest Stockiest</Form.Label>
                        <Form.Control type="text" name="custCdRt" value={formData.custCdRt} onChange={handleChange} placeholder="Nearest Stockiest Code" />
                      </Form.Group>
                    </Col>
                    
                    <Col md={3}>
                      <Form.Group className="mb-3">
                        <Form.Label>Counter Type</Form.Label>
                        <Form.Select name="cstBisTy" value={formData.cstBisTy} onChange={handleChange}>
                          <option value="">Select Type</option>
                          {counterTypes.map((ct) => (
                            <option key={ct.code} value={ct.code}>{ct.name}</option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    
                    <Col md={3}>
                      <PincodeSelect
                        value={formData.pinCodeN}
                        onChange={handlePincodeChange}
                        areaCode={formData.areaCode}
                        enabled={isPincodeAutocompleteEnabled}
                      />
                    </Col>
                    
                    <Col md={3}>
                      <Form.Group className="mb-3">
                        <Form.Label>District</Form.Label>
                        <Form.Control type="text" name="district" value={formData.district} onChange={handleChange} placeholder="District" />
                      </Form.Group>
                    </Col>
                  </Row>
                  
                  <Row>
                    <Col md={3}>
                      <Form.Group className="mb-3">
                        <Form.Label>Visited City</Form.Label>
                        <Form.Control type="text" name="cityName" value={formData.cityName} onChange={handleChange} placeholder="City" />
                      </Form.Group>
                    </Col>
                    
                    <Col md={3}>
                      <Form.Group className="mb-3">
                        <Form.Label>No of KYC Documents</Form.Label>
                        <Form.Control type="number" name="dsrRem09" value={formData.dsrRem09} onChange={handleChange} placeholder="0-3" max={3} isInvalid={!!errors.dsrRem09} />
                        <Form.Control.Feedback type="invalid">{errors.dsrRem09}</Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  </Row>
                </>
              )}
            </Card.Body>
          </Card>
        )}

        {showSampling && (
          <Card className="mb-3">
            <Card.Header>Site Sampling Details</Card.Header>
            <Card.Body>
              <Row>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>{remarkLabels.rem01}</Form.Label>
                    <Form.Control type="text" name="dsrRem01" value={formData.dsrRem01} onChange={handleChange} />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>{remarkLabels.rem02}</Form.Label>
                    <Form.Select name="dsrRem02" value={formData.dsrRem02} onChange={handleChange}>
                      <option value="">Select Product</option>
                      {products.map((p) => <option key={p} value={p}>{p}</option>)}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>{remarkLabels.rem03}</Form.Label>
                    <Form.Control type="number" name="dsrRem03" value={formData.dsrRem03} onChange={handleChange} />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>{remarkLabels.rem04}</Form.Label>
                    <Form.Control type="text" name="dsrRem04" value={formData.dsrRem04} onChange={handleChange} />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>{remarkLabels.rem05}</Form.Label>
                    <Form.Select name="dsrRem05" value={formData.dsrRem05} onChange={handleChange}>
                      <option value="">Select Quality</option>
                      {sampleQuality.map((q) => <option key={q} value={q}>{q}</option>)}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>{remarkLabels.rem06}</Form.Label>
                    <Form.Select name="dsrRem06" value={formData.dsrRem06} onChange={handleChange}>
                      <option value="">Select Status</option>
                      {sampleStatus.map((s) => <option key={s} value={s}>{s}</option>)}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>{remarkLabels.rem07}</Form.Label>
                    <Form.Control type="text" name="dsrRem07" value={formData.dsrRem07} onChange={handleChange} />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>{remarkLabels.rem08}</Form.Label>
                    <Form.Control type="text" name="dsrRem08" value={formData.dsrRem08} onChange={handleChange} />
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        )}

        {showEngagement && (
          <Card className="mb-3">
            <Card.Header>Engagement Activity</Card.Header>
            <Card.Body>
              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>{remarkLabels.rem01}</Form.Label>
                    <Form.Select name="dsrRem01" value={formData.dsrRem01} onChange={handleChange}>
                      <option value="">Select Activity Type</option>
                      {engagementTypes.map((e) => <option key={e} value={e}>{e}</option>)}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>{remarkLabels.rem02}</Form.Label>
                    <Form.Control type="number" name="dsrRem02" value={formData.dsrRem02} onChange={handleChange} />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>{remarkLabels.rem03}</Form.Label>
                    <Form.Control type="text" name="dsrRem03" value={formData.dsrRem03} onChange={handleChange} />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label>{remarkLabels.rem04}</Form.Label>
                    <Form.Control as="textarea" rows={2} name="dsrRem04" value={formData.dsrRem04} onChange={handleChange} />
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        )}

        {showLeave && (
          <Card className="mb-3">
            <Card.Header>Leave</Card.Header>
            <Card.Body>
              <Form.Group className="mb-3">
                <Form.Label>{remarkLabels.rem01}</Form.Label>
                <Form.Control as="textarea" rows={3} name="dsrRem01" value={formData.dsrRem01} onChange={handleChange} />
              </Form.Group>
            </Card.Body>
          </Card>
        )}

        {showOffice && (
          <Card className="mb-3">
            <Card.Header>Office Work</Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>{remarkLabels.rem01}</Form.Label>
                    <Form.Control type="text" name="dsrRem01" value={formData.dsrRem01} onChange={handleChange} />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>{remarkLabels.rem02}</Form.Label>
                    <Form.Control type="number" name="dsrRem02" value={formData.dsrRem02} onChange={handleChange} />
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        )}

        {showSiteDetails && (
          <Card className="mb-3">
            <Card.Header>Site Visit Details</Card.Header>
            <Card.Body>
              <Row>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>{remarkLabels.rem01}</Form.Label>
                    <Form.Select name="dsrRem01" value={formData.dsrRem01} onChange={handleChange}>
                      <option value="">Select Site Type</option>
                      {siteTypes.map((s) => <option key={s} value={s}>{s}</option>)}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>{remarkLabels.rem02}</Form.Label>
                    <Form.Control type="text" name="dsrRem02" value={formData.dsrRem02} onChange={handleChange} />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>{remarkLabels.rem03}</Form.Label>
                    <Form.Control as="textarea" rows={1} name="dsrRem03" value={formData.dsrRem03} onChange={handleChange} />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>{remarkLabels.rem04}</Form.Label>
                    <Form.Control as="textarea" rows={1} name="dsrRem04" value={formData.dsrRem04} onChange={handleChange} />
                  </Form.Group>
                </Col>
              </Row>
              {(formData.dsrParam === '21') && (
                <Row>
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>{remarkLabels.rem05}</Form.Label>
                      <Form.Control type="text" name="dsrRem05" value={formData.dsrRem05} onChange={handleChange} />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>{remarkLabels.rem06}</Form.Label>
                      <Form.Control type="text" name="dsrRem06" value={formData.dsrRem06} onChange={handleChange} />
                    </Form.Group>
                  </Col>
                </Row>
              )}
            </Card.Body>
          </Card>
        )}

        {!showSampling && !showEngagement && !showLeave && !showOffice && !showSiteDetails && (
          <Card className="mb-3">
            <Card.Header>Remarks</Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>{remarkLabels.rem01}</Form.Label>
                    <Form.Control as="textarea" rows={2} name="dsrRem01" value={formData.dsrRem01} onChange={handleChange} />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>{remarkLabels.rem02}</Form.Label>
                    <Form.Control as="textarea" rows={2} name="dsrRem02" value={formData.dsrRem02} onChange={handleChange} />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>{remarkLabels.rem03}</Form.Label>
                    <Form.Control as="textarea" rows={2} name="dsrRem03" value={formData.dsrRem03} onChange={handleChange} />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>{remarkLabels.rem04}</Form.Label>
                    <Form.Control as="textarea" rows={2} name="dsrRem04" value={formData.dsrRem04} onChange={handleChange} />
                  </Form.Group>
                </Col>
              </Row>
              {remarkLabels.rem05 && (
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>{remarkLabels.rem05}</Form.Label>
                      <Form.Control as="textarea" rows={2} name="dsrRem05" value={formData.dsrRem05} onChange={handleChange} />
                    </Form.Group>
                  </Col>
                  {remarkLabels.rem06 && (
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>{remarkLabels.rem06}</Form.Label>
                        <Form.Control as="textarea" rows={2} name="dsrRem06" value={formData.dsrRem06} onChange={handleChange} />
                      </Form.Group>
                    </Col>
                  )}
                </Row>
              )}
              {remarkLabels.rem07 && (
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>{remarkLabels.rem07}</Form.Label>
                      <Form.Control as="textarea" rows={2} name="dsrRem07" value={formData.dsrRem07} onChange={handleChange} />
                    </Form.Group>
                  </Col>
                  {remarkLabels.rem08 && (
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>{remarkLabels.rem08}</Form.Label>
                        <Form.Control as="textarea" rows={2} name="dsrRem08" value={formData.dsrRem08} onChange={handleChange} />
                      </Form.Group>
                    </Col>
                  )}
                </Row>
              )}
            </Card.Body>
          </Card>
        )}

        {showProduct && (
          <Card className="mb-3">
            <Card.Header>{formData.dsrParam === '01' || formData.dsrParam === '02' ? 'Order Details' : 'Action Remarks'}</Card.Header>
            <Card.Body>
              <Table responsive size="sm">
                <thead>
                  <tr>
                    <th><Form.Check type="checkbox" onChange={(e) => {
                      if (e.target.checked) {
                        setFormData(prev => ({ ...prev, details: prev.details.map(d => ({ ...d, selected: true })) }));
                      } else {
                        setFormData(prev => ({ ...prev, details: prev.details.map(d => ({ ...d, selected: false })) }));
                      }
                    }} /></th>
                    <th>{showAction ? 'Action Points' : 'Product'}</th>
                    <th>Qty (MT)</th>
                    {showProject && <th>Potential (MT)</th>}
                    <th>Remarks</th>
                    {showProject && <th>Target Date</th>}
                  </tr>
                </thead>
                <tbody>
                  {formData.details.map((detail, index) => (
                    <tr key={index}>
                      <td><Form.Check type="checkbox" checked={detail.selected || false} onChange={(e) => {
                        const newDetails = [...formData.details];
                        newDetails[index] = { ...newDetails[index], selected: e.target.checked };
                        setFormData(prev => ({ ...prev, details: newDetails }));
                      }} /></td>
                      <td>
                        {detail.repoDesc || detail.repoCatg || detail.actnRemk || ''}
                        {detail.catgPack && <span className="text-muted small ms-2">({detail.catgPack})</span>}
                      </td>
                      <td>{detail.prodQnty}</td>
                      {showProject && <td>{detail.projQnty}</td>}
                      <td>{detail.actnRemk}</td>
                      {showProject && <td>{detail.targetDt}</td>}
                    </tr>
                  ))}
                </tbody>
              </Table>
              <Row className="align-items-end">
                <Col md={showAction ? 4 : 3}>
                  {!showAction && (
                    <ProductSelect
                      category={ACTIVITY_CATEGORY_MAP[formData.dsrParam] || ''}
                      onChange={handleProductSelect}
                      value={detailRow.repoCatg ? { prodCode: detailRow.repoCatg } : null}
                    />
                  )}
                  {showAction && (
                    <Form.Group className="mb-3">
                      <Form.Label>Action Point</Form.Label>
                      <Form.Control
                        type="text"
                        name="repoCatg"
                        value={detailRow.repoCatg}
                        onChange={handleDetailChange}
                        placeholder="Enter action point"
                      />
                    </Form.Group>
                  )}
                </Col>
                <Col md={2}>
                  <Form.Group className="mb-3">
                    <Form.Label>Quantity (MT)</Form.Label>
                    <Form.Control
                      type="number"
                      name="prodQnty"
                      value={detailRow.prodQnty}
                      onChange={handleDetailChange}
                      placeholder="Qty"
                      step="0.01"
                    />
                  </Form.Group>
                </Col>
                {showProject && (
                  <>
                    <Col md={2}>
                      <Form.Group className="mb-3">
                        <Form.Label>Potential (MT)</Form.Label>
                        <Form.Control
                          type="number"
                          name="projQnty"
                          value={detailRow.projQnty}
                          onChange={handleDetailChange}
                          placeholder="Potential"
                          step="0.01"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={2}>
                      <Form.Group className="mb-3">
                        <Form.Label>Target Date</Form.Label>
                        <Form.Control
                          type="date"
                          name="targetDt"
                          value={detailRow.targetDt}
                          onChange={handleDetailChange}
                        />
                      </Form.Group>
                    </Col>
                  </>
                )}
                <Col md={showProject ? 4 : (showAction ? 5 : 4)}>
                  <Form.Group className="mb-3">
                    <Form.Label>Remarks</Form.Label>
                    <Form.Control
                      type="text"
                      name="actnRemk"
                      value={detailRow.actnRemk}
                      onChange={handleDetailChange}
                      placeholder="Remarks"
                    />
                  </Form.Group>
                </Col>
                <Col md={1}>
                  <Button variant="primary" onClick={addDetailRow} className="mb-3">Add</Button>
                </Col>
                {formData.details.some(d => d.selected) && (
                  <Col md={1}>
                    <Button variant="danger" onClick={deleteSelectedRows} className="mb-3">Del</Button>
                  </Col>
                )}
              </Row>
            </Card.Body>
          </Card>
        )}

        {showMarket && lastMarketData.length > 0 && (
          <Card className="mb-3" style={{ backgroundColor: '#f8f9fa' }}>
            <Card.Header className="bg-secondary text-white">Last Recorded Market Mapping Data</Card.Header>
            <Card.Body>
              <Table responsive size="sm">
                <thead>
                  <tr>
                    <th>Products</th>
                    <th>Total Quantity Sold in a year (MT)</th>
                    <th>Total BW Quantity Sold in a year (MT)</th>
                    <th>Date Last Modified</th>
                  </tr>
                </thead>
                <tbody>
                  {lastMarketData.map((item, index) => (
                    <tr key={index}>
                      <td>{item.repoDesc || item.repoCatg}</td>
                      <td>{item.prodQnty}</td>
                      <td>{item.projQnty}</td>
                      <td>{item.docuDate || item.targetDt || ''}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        )}

        {showMarket && (
          <Card className="mb-3">
            <Card.Header>Edit Market Mapping Data (Optional)</Card.Header>
            <Card.Body>
              <Table responsive>
                <thead>
                  <tr>
                    <th><Form.Check type="checkbox" onChange={(e) => {
                      if (e.target.checked) {
                        setFormData(prev => ({ ...prev, marketDetails: prev.marketDetails.map(d => ({ ...d, selected: true })) }));
                      } else {
                        setFormData(prev => ({ ...prev, marketDetails: prev.marketDetails.map(d => ({ ...d, selected: false })) }));
                      }
                    }} /></th>
                    <th>Products</th>
                    <th>Total Quantity Sold (MT)</th>
                    <th>Total BW Quantity (MT)</th>
                    <th>Date Last Modified</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.marketDetails.map((detail, index) => (
                    <tr key={index}>
                      <td><Form.Check type="checkbox" checked={detail.selected || false} onChange={(e) => {
                        const newDetails = [...formData.marketDetails];
                        newDetails[index] = { ...newDetails[index], selected: e.target.checked };
                        setFormData(prev => ({ ...prev, marketDetails: newDetails }));
                      }} /></td>
                      <td>{detail.repoCatg}</td>
                      <td>{detail.prodQnty}</td>
                      <td>{detail.projQnty}</td>
                      <td>{detail.targetDt || ''}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              <Row className="align-items-center">
                <Col md={3}>
                  <Form.Control
                    as="select"
                    name="repoCatg"
                    value={marketRow.repoCatg}
                    onChange={handleMarketChange}
                  >
                    <option value="">Select Product</option>
                    <option value="01">White Cement</option>
                    <option value="02">Wall Care Putty</option>
                  </Form.Control>
                </Col>
                <Col md={3}>
                  <Form.Control
                    type="number"
                    name="prodQnty"
                    value={marketRow.prodQnty}
                    onChange={handleMarketChange}
                    placeholder="Total Qty"
                  />
                </Col>
                <Col md={3}>
                  <Form.Control
                    type="number"
                    name="projQnty"
                    value={marketRow.projQnty}
                    onChange={handleMarketChange}
                    placeholder="BW Qty"
                  />
                </Col>
                <Col md={3}>
                  <Button variant="primary" onClick={addMarketRow}>Add</Button>
                  {formData.marketDetails.some(d => d.selected) && (
                    <Button variant="danger" size="sm" onClick={deleteSelectedMarketRows} className="ms-2">Del</Button>
                  )}
                </Col>
              </Row>
            </Card.Body>
          </Card>
        )}

        <LocationCapture
          onLocationChange={handleLocationChange}
          initialLocation={customerLocation}
          isMobileApp={false}
        />

        <div className="d-flex gap-2">
          <Button type="submit" variant="primary" disabled={loading || !isFormValid} onClick={() => setSubmMthd('A')}>
            {loading ? 'Saving...' : formData.procType === 'A' ? 'Submit & New' : 'Update'}
          </Button>
          {formData.procType === 'A' && (
            <Button type="button" variant="success" disabled={loading || !isFormValid} onClick={(e) => handleSubmit(e, 'E')}>
              Submit & Exit
            </Button>
          )}
          <Button type="button" variant="secondary" onClick={() => resetForm(false)}>Reset</Button>
        </div>
      </Form>

      {(activeDocuNumb || formData.procType === 'U') && (
        <ImageUpload
          docuNumb={activeDocuNumb || formData.docuNumb}
          onImagesChange={handleImagesChange}
        />
      )}
    </div>
  );
}