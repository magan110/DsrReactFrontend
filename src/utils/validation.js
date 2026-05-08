export const validateMobile = (mobile) => {
  if (!mobile) return { isValid: true, message: '' };
  
  const cleaned = mobile.replace(/\D/g, '');
  
  if (cleaned.length !== 10) {
    return { isValid: false, message: 'Mobile number must be 10 digits' };
  }
  
  const invalidPatterns = ['999', '000', '9876543210', '1234567890', '1111111111', '2222222222', '3333333333', '4444444444', '5555555555', '6666666666', '7777777777', '8888888888', '0000000000'];
  
  if (invalidPatterns.some(pattern => cleaned.startsWith(pattern))) {
    return { isValid: false, message: 'Invalid mobile number pattern' };
  }
  
  return { isValid: true, message: '' };
};

export const validateRequired = (value, fieldName) => {
  if (value === undefined || value === null || value === '') {
    return { isValid: false, message: `${fieldName} is required` };
  }
  return { isValid: true, message: '' };
};

export const validateMaxLength = (value, fieldName, maxLength) => {
  if (value && value.length > maxLength) {
    return { isValid: false, message: `${fieldName} must be ${maxLength} characters or less` };
  }
  return { isValid: true, message: '' };
};

export const validateNumeric = (value, fieldName) => {
  if (value === '' || value === null || value === undefined) {
    return { isValid: true, message: '' };
  }
  
  if (isNaN(Number(value))) {
    return { isValid: false, message: `${fieldName} must be a number` };
  }
  return { isValid: true, message: '' };
};

export const validateDate = (date, allowFuture = false) => {
  if (!date) {
    return { isValid: true, message: '' };
  }
  
  const inputDate = new Date(date);
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  
  if (isNaN(inputDate.getTime())) {
    return { isValid: false, message: 'Invalid date format' };
  }
  
  if (!allowFuture && inputDate > today) {
    return { isValid: false, message: 'Date cannot be in the future' };
  }
  
  return { isValid: true, message: '' };
};

export const validateDateRange = (date, withinDays = 30) => {
  if (!date) {
    return { isValid: true, message: '' };
  }
  
  const inputDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const pastDate = new Date(today);
  pastDate.setDate(pastDate.getDate() - withinDays);
  pastDate.setHours(0, 0, 0, 0);
  
  if (inputDate < pastDate || inputDate > today) {
    return { isValid: false, message: `Date must be within last ${withinDays} days (JSP allows max 3 days; use exception entry path for beyond 3 days)` };
  }
  
  return { isValid: true, message: '' };
};

export const validateDateNotFuture = (date) => {
  return validateDate(date, false);
};

export const validateDateWithinDays = (date, days) => {
  return validateDateRange(date, days);
};

export const validateKycCount = (count) => {
  if (!count && count !== 0) {
    return { isValid: true, message: '' };
  }
  
  const numCount = parseInt(count, 10);
  
  if (isNaN(numCount)) {
    return { isValid: false, message: 'KYC count must be a number' };
  }
  
  if (numCount < 0 || numCount > 3) {
    return { isValid: false, message: 'KYC documents must be between 0 and 3' };
  }
  
  return { isValid: true, message: '' };
};

const VALID_PRODUCT_CODES = [
  'White Cement',
  'Wall Care Putty',
  'Textura',
  'Levelplast',
  'Wall Primer',
  '01',
  '02',
  '03',
  '04',
  'WC',
  'TC',
  'LP',
  'WP',
  'TX'
];

export const validateProductCode = (code) => {
  if (!code) {
    return { isValid: true, message: '' };
  }
  
  const validCodes = VALID_PRODUCT_CODES.map(c => c.toLowerCase());
  
  if (!validCodes.includes(code.toLowerCase())) {
    return { isValid: false, message: 'Invalid product code' };
  }
  
  return { isValid: true, message: '' };
};

export const validateCounterType = (value) => {
  if (!value) {
    return { isValid: false, message: 'Counter Type is required' };
  }
  return { isValid: true, message: '' };
};

export const validateDistrict = (value) => {
  if (!value || value.trim() === '') {
    return { isValid: false, message: 'District Name is required' };
  }
  return { isValid: true, message: '' };
};

export const validatePinCode = (value) => {
  if (!value || value.trim() === '') {
    return { isValid: false, message: 'Pin Code is required' };
  }
  return { isValid: true, message: '' };
};

export const validateCity = (value) => {
  if (!value || value.trim() === '') {
    return { isValid: false, message: 'City Name is required' };
  }
  return { isValid: true, message: '' };
};

export const validateContactName = (value) => {
  if (!value || value.trim() === '') {
    return { isValid: false, message: 'Contact Name is required' };
  }
  return { isValid: true, message: '' };
};

export const validateNearestStockiest = (value, customerType) => {
  if (customerType === 'R' || customerType === 'RR') {
    if (!value || value.trim() === '') {
      return { isValid: false, message: 'Nearest Stockiest is required for Retailer' };
    }
  }
  return { isValid: true, message: '' };
};

