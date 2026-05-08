import axios from 'axios';

const API_BASE_URL = 'http://localhost:8081/api/dsr';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const userId = localStorage.getItem('userId') || 'SYSTEM';
  config.headers['X-User-Id'] = userId;
  return config;
});

const CUSTOMER_API_URL = 'http://localhost:8081/api/customers';

const AREAS_API_URL = 'http://localhost:8081/api/areas';

const PRODUCTS_API_URL = 'http://localhost:8081/api/products';

const RETAILER_TARGETS_API_URL = 'http://localhost:8081/api/retailer-targets';

const PINCODE_API_URL = 'http://localhost:8081/api/pincodes';

export const dsrApi = {
  searchPincodes: (pincode, areaCode) => {
    const params = { search: pincode };
    if (areaCode) params.area = areaCode;
    return axios.get(PINCODE_API_URL, { params });
  },

  getRetailerTargets: (loginIdM, monthYear) => {
    return axios.get(RETAILER_TARGETS_API_URL, { params: { loginIdM, monthYear } });
  },

  saveRetailerTargets: (loginIdM, targets) => {
    return axios.post(RETAILER_TARGETS_API_URL, { loginIdM, targets });
  },

  getAreas: (loginIdM, zone) => {
    const params = { loginIdM };
    if (zone) params.zone = zone;
    return axios.get(AREAS_API_URL, { params });
  },

  searchCustomers: (query, customerType, areaCode) => {
    const params = { search: query };
    if (customerType) params.type = customerType;
    if (areaCode) params.area = areaCode;
    return axios.get(CUSTOMER_API_URL, { params });
  },

  searchProducts: (query, category) => {
    const params = { search: query };
    if (category) params.category = category;
    return axios.get(PRODUCTS_API_URL, { params });
  },

  searchProductsByCategory: (category) => {
    return axios.get(PRODUCTS_API_URL, { params: { category } });
  },

  getActivities: (params) => api.get('/activities', { params }),
  
  getRecentActivities: (loginIdM, days = 3) => 
    api.get('/activities/recent', { params: { loginIdM, days } }),
  
  getActivity: (docuNumb) => api.get(`/activities/${docuNumb}`),
  
  createActivity: (data) => api.post('/activities', data),
  
  updateActivity: (docuNumb, data) => api.put(`/activities/${docuNumb}`, data),
  
  deleteActivity: (docuNumb) => api.delete(`/activities/${docuNumb}`),
  
  getActivityTypes: (deptCode) => 
    api.get('/activity-types', { params: { deptCode } }),
  
  getCustomerTypes: () => api.get('/customer-types'),
  
  getDocumentTypes: () => api.get('/document-types'),

  uploadImage: (docuNumb, file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('docuNumb', docuNumb);
    return api.post('/images/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  getImages: (docuNumb) => api.get(`/images/${docuNumb}`),

  deleteImage: (atchNmId) => api.delete(`/images/${atchNmId}`),

  checkMobileDuplicate: (mobile) => {
    return api.get('/customers/check-mobile', { params: { mobile } });
  },

  getCustomerDetails: (customerCode, areaCode) => {
    return api.get('/customers/details', { params: { customerCode, areaCode } });
  },

  getRetailerTargetStatus: (loginIdM) => {
    return api.get('/retailer-targets/status', { params: { loginIdM } });
  },

  getLastMarketData: (loginIdM) => {
    return api.get('/market-mapping/last', { params: { loginIdM } });
  },

  getMarketMappingData: (loginIdM) => {
    return api.get('/market-mapping', { params: { loginIdM } });
  },
};

export const authApi = {
  setUserId: (userId) => localStorage.setItem('userId', userId),
  getUserId: () => localStorage.getItem('userId'),
};

export default api;