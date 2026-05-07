import { useState, useCallback, useRef, useEffect } from 'react';

const INITIAL_FORM_DATA = {
  // Process & Document
  procType: 'A',
  docuNumb: '',
  docuDate: new Date().toISOString().split('T')[0],
  dsrParam: '05', // Default to Personal Visit
  submMthd: '',
  deptCode: 'KKR116',
  formName: 'DSRActvNew',

  // Customer Details
  cusRtlFl: '',
  areaCode: '',
  cusRtlCd: '',
  cusRtlNm: '',
  cuRtType: '',

  // DSR Remarks (dynamic based on activity type)
  dsrRem01: '', // Market Name / Primary Remark
  dsrRem02: '', // Pending Issues / Secondary Remark
  dsrRem03: '', // Issue Type / Tertiary Remark
  dsrRem04: '', // Issue Details / Quaternary Remark
  dsrRem05: '', // Additional Remarks
  dsrRem06: '', // WC Brands / Mobile No
  dsrRem07: '', // WCP Brands / Name
  dsrRem08: '', // Display Contest / Action Points
  dsrRem09: '', // WC Volume / GRC Lead
  dsrRem10: '', // WCP Volume / Email

  // Brand & Market Data
  brndSlWc: '',
  brndSlWp: '',
  slWcVlum: '',
  slWpVlum: '',

  // Pending Issues
  pendIsue: 'N',
  pndIsuDt: '',
  isuDetal: '',

  // Display Contest
  prtDsCnt: 'N',

  // Enrolment Slabs
  wcErlSlb: '0',
  wpErlSlb: '0',
  vpErlSlb: '0',

  // BW Stock Availability
  bwStkWcc: '0.00',
  bwStkWcp: '0.00',
  bwStkVap: '0.00',

  // Competitor Average Data
  jkAvgWcc: '0',
  jkAvgWcp: '0',
  asAvgWcc: '0',
  asAvgWcp: '0',
  otAvgWcc: '0',
  otAvgWcp: '0',

  // Location Data
  geoLatit: '',
  geoLongt: '',
  latitute: '',
  lgtitute: '',
  locaCapr: '',
  ltLgDist: '',
  FinlRslt: '',

  // Pin Code & City
  pinCodeN: '',
  pinCdCty: '',
  cityName: '',
  district: '',

  // Counter Type (for new purchaser)
  cstBisTy: '',
  
  // Nearest Stockiest (for retailer visits)
  custCdRt: '',

  // Mobile Number (for new purchaser)
  mobileNo: '',

  // Exception Reason
  dsrExcpA: 'N',
  cityNameReason: '',

  // Tile Retailer
  isTilRtl: 'N',
  tileStck: '0',

  // Order Details (array of line items)
  orderDetails: [],

  // Market Pricing Data (array)
  marketPricingData: [],

  // Gift Distribution (array)
  giftDistributions: [],

  // Images (array)
  images: [],

  // Authorization flag
  isAuthorized: true,

  // User context (for backend pendWith hierarchy)
  loginId: '',
  sapLgnGr: '',
  userType: '',
  zoneCode: 'N',
  statCode: '',

  // Order execution date
  ordExDat: '',

  // Customer average sales (read-only display)
  bwAvgWcc: '0.00',
  bwAvgWcp: '0.00',
  bwAvgVap: '0.00',
  bwCurWcc: '0.00',
  bwCurWcp: '0.00',
  bwCurVap: '0.00',

  // KYC Status
  kycVerFl: 'N',

  // Market name update flag
  mktNamUF: 'Y'
};

// Activity-specific remark labels (replicate dsrRemAr from JSP)
export const ACTIVITY_REMARKS = {
  '01': { // Visit to Stockiest/Retailer
    rem01: 'Topic Discussed',
    rem02: 'Ugai Recovery Plans',
    rem03: 'Any Purchaser Grievances',
    rem04: 'Any Other Points',
    showCustomer: true,
    showProduct: true,
    showProjection: true
  },
  '02': { // Retailer Meeting
    rem01: 'Topic Discussed',
    rem02: 'Ugai Recovery Plans',
    rem03: 'Any Purchaser Grievances',
    rem04: 'Any Other Points',
    showCustomer: true,
    showProduct: true,
    showProjection: true
  },
  '04': { // Tele Call
    rem01: 'Market Name',
    rem02: 'Pending Issues',
    rem03: 'Issue Type',
    rem04: 'Issue Details',
    showCustomer: true,
    showProduct: true
  },
  '05': { // Personal Visit
    rem01: 'Market Name',
    rem02: 'Pending Issues',
    rem03: 'Issue Type',
    rem04: 'Issue Details',
    showCustomer: true,
    showProduct: true,
    showLocation: true
  },
  '06': { // CASC Visit
    rem01: 'Sampling Lead',
    rem02: 'Sampling Product',
    rem03: 'Sale Lead',
    rem04: 'Sale Lead Product',
    rem08: 'Action Points',
    rem09: 'GRC Lead',
    showCustomer: false,
    showMobile: true,
    showEmail: true
  },
  '11': { // New Purchaser Meeting
    rem01: 'Site Name',
    rem02: 'Contractor Working at Site',
    rem03: 'Met With',
    rem04: 'Name and Designation of Person',
    rem05: 'Topic Discussed',
    showCustomer: true
  },
  '12': { // Project Site Visit
    rem01: 'Site Name',
    rem02: 'Contractor Working at Site',
    rem03: 'Met With',
    rem04: 'Name and Designation',
    showCustomer: true,
    showProduct: true
  },
  '21': { // CASC Site Visit
    rem01: 'Site Type',
    rem02: 'Contractor Working at Site',
    rem03: 'Agenda of Site Visit',
    rem04: 'Action Points',
    showCustomer: true,
    showProduct: true
  },
  '31': { // Sample Check
    rem01: 'Site Name',
    rem02: 'Product for Sample',
    rem03: 'Approx Potential (MT)',
    rem04: 'Applicator Name',
    rem05: 'Quality of Sample',
    rem06: 'Status of Sample',
    rem07: 'Contact Name',
    rem08: 'Mobile No'
  },
  '41': { // Advertisement
    rem01: 'Dangler',
    rem02: 'Posters',
    rem03: 'Stickers',
    rem04: 'Feedback',
    rem05: 'Recommendations',
    rem06: 'Insights'
  },
  '50': { // New Purchaser/Retailer Meeting
    rem01: 'Party Name',
    rem02: 'Name and Designation of Person',
    rem03: 'Topics Discussed',
    rem04: 'Any Other Points',
    rem08: 'Mobile No',
    showCustomer: true,
    showMobile: true,
    showPinCode: true,
    showDistrict: true,
    showCity: true
  },
  '51': { // Engagement Activities
    rem01: 'Type of Activity',
    rem02: 'No of Participants',
    rem03: 'Town',
    rem04: 'Learnings from Activity',
    showProduct: true
  },
  '52': { // Internal Team Meetings
    rem01: 'Meeting Done With',
    rem02: 'Topics Discussed',
    showActionPoints: true
  },
  '53': { // Office Work
    rem01: 'Work Related To',
    rem02: 'No of Hours Spent'
  },
  '54': { // Leave
    rem01: 'Remarks'
  },
  '55': { // Other Activity
    rem01: 'Activity Details 1',
    rem02: 'Activity Details 2',
    rem03: 'Activity Details 3',
    rem04: 'Other Points'
  },
  '60': { // Market Research
    rem01: 'Activity Details 1',
    rem02: 'Activity Details 2'
  },
  '61': { // Counter Visit
    rem01: 'Party Name',
    rem02: 'Name and Designation',
    rem03: 'Topics Discussed',
    rem04: 'Any Other Points',
    rem08: 'Mobile No',
    showCustomer: true,
    showMobile: true
  }
};

// Conditional flags based on dsrParam (replicate JSP logic from ActvDsrNew.jsp lines 555-572)
export const DSR_PARAM_FLAGS = {
  // actPntRq = true - Show Action Points table
  '52': { actPntRq: true, prdSelRq: false, prjSelRq: false, cusSelRq: true, cusCodRq: true },
  '13': { actPntRq: true, prdSelRq: false, prjSelRq: false, cusSelRq: true, cusCodRq: true },
  '23': { actPntRq: true, prdSelRq: false, prjSelRq: false, cusSelRq: true, cusCodRq: true },
  '41': { actPntRq: true, prdSelRq: false, prjSelRq: false, cusSelRq: true, cusCodRq: true },
  '50': { actPntRq: true, prdSelRq: false, prjSelRq: false, cusSelRq: true, cusCodRq: false },

  // prdSelRq = true - Show Product Selection (Order Details)
  '01': { actPntRq: false, prdSelRq: true, prjSelRq: true, cusSelRq: true, cusCodRq: true },
  '02': { actPntRq: false, prdSelRq: true, prjSelRq: false, cusSelRq: true, cusCodRq: true },
  '61': { actPntRq: false, prdSelRq: true, prjSelRq: false, cusSelRq: true, cusCodRq: false },
  '51': { actPntRq: false, prdSelRq: true, prjSelRq: false, cusSelRq: false, cusCodRq: false },
  '11': { actPntRq: false, prdSelRq: true, prjSelRq: false, cusSelRq: true, cusCodRq: true },
  '21': { actPntRq: false, prdSelRq: true, prjSelRq: true, cusSelRq: true, cusCodRq: true },

  // prjSelRq = true - Show Projection column
  '01': { actPntRq: false, prdSelRq: true, prjSelRq: true, cusSelRq: true, cusCodRq: true },
  '21': { actPntRq: false, prdSelRq: true, prjSelRq: true, cusSelRq: true, cusCodRq: true },

  // Show Customer selection
  '04': { actPntRq: false, prdSelRq: false, prjSelRq: false, cusSelRq: true, cusCodRq: true },
  '05': { actPntRq: false, prdSelRq: false, prjSelRq: false, cusSelRq: true, cusCodRq: true },
  '12': { actPntRq: false, prdSelRq: false, prjSelRq: false, cusSelRq: true, cusCodRq: true },
  '22': { actPntRq: false, prdSelRq: false, prjSelRq: false, cusSelRq: true, cusCodRq: true },

  // Default - show customer and require code
  'default': { actPntRq: false, prdSelRq: false, prjSelRq: false, cusSelRq: true, cusCodRq: true }
};

// Get conditional flags for a dsrParam
export const getDsrParamFlags = (dsrParam) => {
  return DSR_PARAM_FLAGS[dsrParam] || DSR_PARAM_FLAGS['default'];
};

// Get customer type list for a dsrParam
export const getCustomerTypes = (dsrParam) => {
  const baseTypes = [
    { code: 'R', desc: 'Retailer' },
    { code: 'RR', desc: 'Rural Retailer' },
    { code: 'C', desc: 'Stockiest/Urban Stockiest' },
    { code: 'D', desc: 'Direct Dealer' },
    { code: 'RD', desc: 'Rural Stockiest' },
    { code: 'AD', desc: 'AD' },
    { code: 'UR', desc: 'UBS' }
  ];
  return baseTypes;
};

// Check if pin code is required (Zone A/B)
export const isPinCodeRequired = (zoneCode) => {
  return zoneCode === 'A' || zoneCode === 'B';
};

export const useDsrForm = () => {
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const locationRef = useRef({ geoLatit: '', geoLongt: '' });

  useEffect(() => {
    if (formData.geoLatit || formData.geoLongt) {
      locationRef.current = {
        geoLatit: formData.geoLatit,
        geoLongt: formData.geoLongt
      };
    }
  }, [formData.geoLatit, formData.geoLongt]);

  const resetForm = useCallback(() => {
    setFormData({
      ...INITIAL_FORM_DATA,
      docuDate: new Date().toISOString().split('T')[0],
      geoLatit: locationRef.current.geoLatit,
      geoLongt: locationRef.current.geoLongt
    });
    setErrors({});
    setMessage('');
  }, []);

  const updateField = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const addOrderDetail = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      orderDetails: [
        ...prev.orderDetails,
        {
          id: Date.now(),
          repoCatg: '02',
          catgPkPr: '',
          prodQnty: '0',
          projQnty: '0',
          actnRemk: ''
        }
      ]
    }));
  }, []);

  const removeOrderDetail = useCallback((id) => {
    setFormData(prev => ({
      ...prev,
      orderDetails: prev.orderDetails.filter(item => item.id !== id)
    }));
  }, []);

  const updateOrderDetail = useCallback((id, field, value) => {
    setFormData(prev => ({
      ...prev,
      orderDetails: prev.orderDetails.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    }));
  }, []);

  const addMarketPricing = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      marketPricingData: [
        ...prev.marketPricingData,
        {
          id: Date.now(),
          branName: '',
          prdCodMk: '',
          bPriceVl: '0',
          cPriceVl: '0'
        }
      ]
    }));
  }, []);

  const removeMarketPricing = useCallback((id) => {
    setFormData(prev => ({
      ...prev,
      marketPricingData: prev.marketPricingData.filter(item => item.id !== id)
    }));
  }, []);

  const addGiftDistribution = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      giftDistributions: [
        ...prev.giftDistributions,
        {
          id: Date.now(),
          mrtlCode: '',
          isueQnty: '1'
        }
      ]
    }));
  }, []);

  const removeGiftDistribution = useCallback((id) => {
    setFormData(prev => ({
      ...prev,
      giftDistributions: prev.giftDistributions.filter(item => item.id !== id)
    }));
  }, []);

  const addImage = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      images: [
        ...prev.images,
        {
          id: Date.now(),
          file: null,
          preview: '',
          docuType: 'ADH'
        }
      ]
    }));
  }, []);

  const removeImage = useCallback((id) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter(item => item.id !== id)
    }));
  }, []);

  // Get activity-specific remark labels
  const getActivityRemarks = useCallback(() => {
    return ACTIVITY_REMARKS[formData.dsrParam] || ACTIVITY_REMARKS['05'];
  }, [formData.dsrParam]);

  // Calculate pack size conversion (bags to MT)
  const calculateQtyInMT = useCallback((bags, packsPerMT) => {
    if (!bags || !packsPerMT || packsPerMT === 0) return '0';
    return (parseFloat(bags) / parseFloat(packsPerMT)).toFixed(3);
  }, []);

  return {
    formData,
    setFormData,
    errors,
    setErrors,
    loading,
    setLoading,
    submitting,
    setSubmitting,
    message,
    setMessage,
    resetForm,
    updateField,
    addOrderDetail,
    removeOrderDetail,
    updateOrderDetail,
    addMarketPricing,
    removeMarketPricing,
    addGiftDistribution,
    removeGiftDistribution,
    addImage,
    removeImage,
    getActivityRemarks,
    calculateQtyInMT,
    ACTIVITY_REMARKS
  };
};