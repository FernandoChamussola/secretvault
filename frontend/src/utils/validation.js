export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  return password.length >= 8;
};

export const getPasswordStrength = (password) => {
  if (!password) return { strength: 0, label: 'None', color: 'gray' };

  let strength = 0;

  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^a-zA-Z0-9]/.test(password)) strength++;

  if (strength <= 2) return { strength, label: 'Weak', color: 'red' };
  if (strength <= 4) return { strength, label: 'Medium', color: 'yellow' };
  return { strength, label: 'Strong', color: 'green' };
};
