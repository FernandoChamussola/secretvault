import { useState, useEffect } from 'react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Eye, EyeOff, RefreshCw } from 'lucide-react';
import { generatePassword } from '../../utils/helpers';

export const PasswordForm = ({ password, onSubmit, onCancel, loading }) => {
  const [formData, setFormData] = useState({
    title: '',
    username: '',
    password: '',
    description: '',
    category: '',
    url: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (password) {
      setFormData({
        title: password.title || '',
        username: password.username || '',
        password: password.password || '',
        description: password.description || '',
        category: password.category || '',
        url: password.url || '',
      });
    }
  }, [password]);

  const handleGeneratePassword = () => {
    const newPassword = generatePassword(16);
    setFormData({ ...formData, password: newPassword });
    setShowPassword(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Title *"
        type="text"
        placeholder="e.g., Gmail Account, AWS API Key"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        required
      />

      <Input
        label="Username / Email"
        type="text"
        placeholder="user@example.com"
        value={formData.username}
        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
      />

      <div>
        <Input
          label="Password *"
          type={showPassword ? 'text' : 'password'}
          placeholder="••••••••"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          rightElement={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          }
          required
        />
        <button
          type="button"
          onClick={handleGeneratePassword}
          className="mt-2 text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
        >
          <RefreshCw size={14} />
          Generate strong password
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          rows={3}
          placeholder="Additional notes..."
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>

      <Input
        label="Category"
        type="text"
        placeholder="e.g., Email, Social, Banking, Work"
        value={formData.category}
        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
      />

      <Input
        label="URL"
        type="url"
        placeholder="https://example.com"
        value={formData.url}
        onChange={(e) => setFormData({ ...formData, url: e.target.value })}
      />

      <div className="flex gap-3 pt-4">
        <Button type="submit" fullWidth disabled={loading}>
          {loading ? 'Saving...' : password ? 'Update' : 'Create'}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel} fullWidth>
          Cancel
        </Button>
      </div>
    </form>
  );
};
