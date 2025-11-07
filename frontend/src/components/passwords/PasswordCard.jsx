import { Copy, Edit2, Trash2, Eye, ExternalLink } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { getCategoryColor, formatDate, copyToClipboard } from '../../utils/helpers';
import toast from 'react-hot-toast';

export const PasswordCard = ({ password, onEdit, onDelete, onView }) => {
  const handleCopy = async () => {
    const success = await copyToClipboard(password.password || '••••••••');
    if (success) {
      toast.success('Password copied to clipboard!');
    } else {
      toast.error('Failed to copy password');
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {password.title}
          </h3>
          {password.username && (
            <p className="text-sm text-gray-600">{password.username}</p>
          )}
        </div>
        {password.category && (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(password.category)}`}>
            {password.category}
          </span>
        )}
      </div>

      {password.description && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {password.description}
        </p>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-gray-200">
        <span className="text-xs text-gray-500">
          {formatDate(password.createdAt)}
        </span>

        <div className="flex gap-2">
          {password.url && (
            <button
              onClick={() => window.open(password.url, '_blank')}
              className="text-gray-500 hover:text-primary-600 transition-colors"
              title="Open URL"
            >
              <ExternalLink size={18} />
            </button>
          )}
          <button
            onClick={handleCopy}
            className="text-gray-500 hover:text-primary-600 transition-colors"
            title="Copy password"
          >
            <Copy size={18} />
          </button>
          <button
            onClick={() => onView(password)}
            className="text-gray-500 hover:text-primary-600 transition-colors"
            title="View details"
          >
            <Eye size={18} />
          </button>
          <button
            onClick={() => onEdit(password)}
            className="text-gray-500 hover:text-primary-600 transition-colors"
            title="Edit"
          >
            <Edit2 size={18} />
          </button>
          <button
            onClick={() => onDelete(password)}
            className="text-gray-500 hover:text-red-600 transition-colors"
            title="Delete"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </Card>
  );
};
