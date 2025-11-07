export const generatePassword = (length = 16, options = {}) => {
  const {
    uppercase = true,
    lowercase = true,
    numbers = true,
    symbols = true,
  } = options;

  let charset = '';
  if (uppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (lowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
  if (numbers) charset += '0123456789';
  if (symbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';

  if (!charset) return '';

  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
};

export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy:', error);
    return false;
  }
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('pt-BR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const getCategoryColor = (category) => {
  const colors = {
    'email': 'bg-blue-100 text-blue-800',
    'social': 'bg-purple-100 text-purple-800',
    'banking': 'bg-green-100 text-green-800',
    'work': 'bg-orange-100 text-orange-800',
    'personal': 'bg-pink-100 text-pink-800',
    'api': 'bg-yellow-100 text-yellow-800',
    'default': 'bg-gray-100 text-gray-800',
  };

  return colors[category?.toLowerCase()] || colors.default;
};
