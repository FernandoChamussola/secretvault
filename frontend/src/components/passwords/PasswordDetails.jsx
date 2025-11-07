import { useState } from 'react';
import { Eye, EyeOff, Copy, ExternalLink } from 'lucide-react';
import { formatDate, copyToClipboard, getCategoryColor } from '../../utils/helpers';
import toast from 'react-hot-toast';

export const PasswordDetails = ({ password }) => {
  const [showPassword, setShowPassword] = useState(false);

  const handleCopy = async (text, label) => {
    const success = await copyToClipboard(text);
    if (success) {
      toast.success(`${label} copied!`);
    } else {
      toast.error('Failed to copy');
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
        <p className="text-lg font-semibold text-gray-900">{password.title}</p>
      </div>

      {password.username && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Username / Email</label>
          <div className="flex items-center gap-2">
            <p className="text-gray-900">{password.username}</p>
            <button
              onClick={() => handleCopy(password.username, 'Username')}
              className="text-gray-500 hover:text-primary-600"
            >
              <Copy size={16} />
            </button>
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
        <div className="flex items-center gap-2">
          <p className="text-gray-900 font-mono">
            {showPassword ? password.password : '••••••••••••'}
          </p>
          <button
            onClick={() => setShowPassword(!showPassword)}
            className="text-gray-500 hover:text-primary-600"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
          <button
            onClick={() => handleCopy(password.password, 'Password')}
            className="text-gray-500 hover:text-primary-600"
          >
            <Copy size={16} />
          </button>
        </div>
      </div>

      {password.description && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <p className="text-gray-900 whitespace-pre-wrap">{password.description}</p>
        </div>
      )}

      {password.category && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(password.category)}`}>
            {password.category}
          </span>
        </div>
      )}

      {password.url && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
          <a
            href={password.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-600 hover:text-primary-700 flex items-center gap-1"
          >
            {password.url}
            <ExternalLink size={16} />
          </a>
        </div>
      )}

      <div className="pt-4 border-t border-gray-200 grid grid-cols-2 gap-4 text-sm">
        <div>
          <label className="block text-gray-500">Created</label>
          <p className="text-gray-900">{formatDate(password.createdAt)}</p>
        </div>
        <div>
          <label className="block text-gray-500">Updated</label>
          <p className="text-gray-900">{formatDate(password.updatedAt)}</p>
        </div>
      </div>
    </div>
  );
};
