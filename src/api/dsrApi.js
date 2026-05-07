import axios from 'axios';

const API_BASE_URL = 'http://localhost:8081/api/v1';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor for adding auth
apiClient.interceptors.request.use(
  (config) => {
    // Add Basic Auth - replicate loginIdM from JSP
    const username = '2948'; // Hardcoded for now
    const password = 'Ram@1234';
    const token = btoa(`${username}:${password}`);
    config.headers.Authorization = `Basic ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
      console.error('Authentication failed');
    }
    if (error.response?.status === 400) {
      // Validation errors
      console.error('Validation failed:', error.response.data);
    }
    return Promise.reject(error);
  }
);

// DSR Activity APIs
export const dsrApi = {
  // Create new DSR activity
  createActivity: (data) => {
    return apiClient.post('/dsr/activities', data);
  },

  // Update existing DSR activity
  updateActivity: (docuNumb, data) => {
    return apiClient.put(`/dsr/activities/${docuNumb}`, data);
  },

  // Get DSR activity by document number
  getActivity: (docuNumb) => {
    return apiClient.get(`/dsr/activities/${docuNumb}`);
  },

  // Delete (cancel) DSR activity
  deleteActivity: (docuNumb) => {
    return apiClient.delete(`/dsr/activities/${docuNumb}`);
  },

  // Get recent DSR entries for update mode
  getRecentDsr: () => {
    return apiClient.get('/dsr/activities/recent');
  },

  // Submit and exit
  submitAndExit: (docuNumb, data) => {
    return apiClient.post(`/dsr/activities/${docuNumb}/submit`, data);
  },

  // Submit and create new
  submitAndNew: (docuNumb, data) => {
    return apiClient.post(`/dsr/activities/${docuNumb}/submit-new`, data);
  },

  // Check if user can enter DSR (Market MIS, Stockiest Target)
  checkEligibility: () => {
    return apiClient.get('/dsr/activities/eligibility');
  },
};

// CASC DSR APIs
export const cascApi = {
  // Create CASC activity
  createCascActivity: (data) => {
    return apiClient.post('/casc/activities', data);
  },

  // Update CASC activity
  updateCascActivity: (docuNumb, data) => {
    return apiClient.put(`/casc/activities/${docuNumb}`, data);
  },

  // Get CASC activity
  getCascActivity: (docuNumb) => {
    return apiClient.get(`/casc/activities/${docuNumb}`);
  },

  // Delete CASC activity
  deleteCascActivity: (docuNumb) => {
    return apiClient.delete(`/casc/activities/${docuNumb}`);
  },

  // Check if mobile number is already registered
  checkMobileNumber: (mobileNo) => {
    return apiClient.get(`/casc/check-mobile/${mobileNo}`);
  },
};

// Customer APIs - Replicate AJAX dropdowns from JSP
export const customerApi = {
  // Search customers for autocomplete dropdown
  searchCustomers: (areaCode, customerType, searchTerm = '') => {
    return apiClient.get('/customers/search', {
      params: { areaCode, customerType, searchTerm }
    });
  },

  // Search retailers for autocomplete dropdown
  searchRetailers: (areaCode, searchTerm = '') => {
    return apiClient.get('/customers/retailers/search', {
      params: { areaCode, searchTerm }
    });
  },

  // Get customer/retailer details with sales data
  getCustomerDetail: (code, type) => {
    return apiClient.get(`/customers/${code}`, {
      params: { type }
    });
  },

  // Get customer sales summary
  getCustomerSales: (code, type) => {
    return apiClient.get(`/customers/${code}/sales`, {
      params: { type }
    });
  },

  // Get customer billing data
  getCustomerBilling: (code, type) => {
    return apiClient.get(`/customers/${code}/billing`, {
      params: { type }
    });
  },

  // Get customer location
  getCustomerLocation: (code, type) => {
    return apiClient.get(`/customers/${code}/location`, {
      params: { type }
    });
  },
};

// Product APIs
export const productApi = {
  // Get all active products
  getAllProducts: () => {
    return apiClient.get('/products');
  },

  // Get products by category
  getProductsByCategory: (repoCatg) => {
    return apiClient.get(`/products/category/${repoCatg}`);
  },

  // Get trade products
  getTradeProducts: (repoCatg) => {
    return apiClient.get('/products/trade', {
      params: { repoCatg }
    });
  },

  // Get products for SKU dropdown
  getSkuDropdown: (repoCatg) => {
    return apiClient.get('/products/sku-dropdown', {
      params: { repoCatg }
    });
  },

  // Get products by pack size
  getProductsByPackSize: (repoCatg, packSizes) => {
    return apiClient.get('/products/pack-size', {
      params: { repoCatg, packSizes: packSizes.join(',') }
    });
  },

  // Search products
  searchProducts: (query) => {
    return apiClient.get('/products/search', {
      params: { query }
    });
  },

  // Get WCP products for market pricing
  getWcpMarketPricing: () => {
    return apiClient.get('/products/wcp-market-pricing');
  },
};

// Location APIs
export const locationApi = {
  // Capture location
  captureLocation: (data) => {
    return apiClient.post('/location/capture', data);
  },

  // Calculate distance
  calculateDistance: (customerCode, customerType, currentLat, currentLon) => {
    return apiClient.get('/location/distance', {
      params: { customerCode, customerType, currentLat, currentLon }
    });
  },

  // Validate distance (500 meter check)
  validateDistance: (customerCode, customerType, currentLat, currentLon) => {
    return apiClient.get('/location/validate', {
      params: { customerCode, customerType, currentLat, currentLon }
    });
  },

  // Get customer location
  getCustomerLocation: (customerCode, customerType) => {
    return apiClient.get(`/location/customer-location/${customerCode}`, {
      params: { customerType }
    });
  },
};

// Approval APIs
export const approvalApi = {
  // Get pending approvals
  getPendingApprovals: () => {
    return apiClient.get('/approvals/pending');
  },

  // Get DSR for approval view
  getDsrForApproval: (docuNumb) => {
    return apiClient.get(`/approvals/${docuNumb}`);
  },

  // Approve DSR
  approveDsr: (docuNumb, remarks) => {
    return apiClient.post(`/approvals/${docuNumb}/approve`, null, {
      params: { remarks }
    });
  },

  // Reject DSR
  rejectDsr: (docuNumb, remarks) => {
    return apiClient.post(`/approvals/${docuNumb}/reject`, null, {
      params: { remarks }
    });
  },

  // Get approval status
  getApprovalStatus: (docuNumb) => {
    return apiClient.get(`/approvals/${docuNumb}/status`);
  },
};

// Pin Code API - Replicate fillPinLoc1 from JSP
export const pinCodeApi = {
  searchPinCodes: (areaCode, pinCode) => {
    return apiClient.get('/location/pincode', {
      params: { areaCode, pinCode }
    });
  },
};

export default apiClient;