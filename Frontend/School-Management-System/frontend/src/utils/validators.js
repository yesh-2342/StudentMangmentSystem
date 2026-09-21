export const validateRequired = (val, fieldName) => {
  if (!val || (typeof val === 'string' && val.trim() === '')) {
    return `${fieldName || 'Field'} is required`;
  }
  return null;
};

export const validateEmail = (email) => {
  if (!email) return 'Email is required';
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(email)) return 'Invalid email address';
  return null;
};
