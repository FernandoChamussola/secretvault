import { useState, useEffect } from 'react';
import { Search, Plus, KeyRound } from 'lucide-react';
import { passwordService } from '../../services/passwords';
import { PasswordCard } from './PasswordCard';
import { PasswordForm } from './PasswordForm';
import { PasswordDetails } from './PasswordDetails';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import toast from 'react-hot-toast';

export const PasswordList = () => {
  const [passwords, setPasswords] = useState([]);
  const [filteredPasswords, setFilteredPasswords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [selectedPassword, setSelectedPassword] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchPasswords();
  }, []);

  useEffect(() => {
    filterPasswords();
  }, [searchTerm, passwords]);

  const fetchPasswords = async () => {
    try {
      setLoading(true);
      const response = await passwordService.getAll();
      setPasswords(response.passwords);
    } catch (error) {
      toast.error('Failed to load passwords');
    } finally {
      setLoading(false);
    }
  };

  const filterPasswords = () => {
    if (!searchTerm) {
      setFilteredPasswords(passwords);
      return;
    }

    const filtered = passwords.filter(
      (p) =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPasswords(filtered);
  };

  const handleCreate = async (data) => {
    try {
      setActionLoading(true);
      await passwordService.create(data);
      toast.success('Password created successfully!');
      setShowCreateModal(false);
      fetchPasswords();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create password');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdate = async (data) => {
    try {
      setActionLoading(true);
      await passwordService.update(selectedPassword.id, data);
      toast.success('Password updated successfully!');
      setShowEditModal(false);
      setSelectedPassword(null);
      fetchPasswords();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update password');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setActionLoading(true);
      await passwordService.delete(selectedPassword.id);
      toast.success('Password deleted successfully!');
      setShowDeleteModal(false);
      setSelectedPassword(null);
      fetchPasswords();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete password');
    } finally {
      setActionLoading(false);
    }
  };

  const handleView = async (password) => {
    try {
      const response = await passwordService.getById(password.id);
      setSelectedPassword(response.password);
      setShowViewModal(true);
    } catch (error) {
      toast.error('Failed to load password details');
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <Input
          type="text"
          placeholder="Search passwords..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          icon={<Search className="text-gray-400" size={20} />}
          className="w-full sm:w-96"
        />
        <Button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 w-full sm:w-auto">
          <Plus size={20} />
          Add Password
        </Button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      )}

      {/* Empty state */}
      {!loading && filteredPasswords.length === 0 && !searchTerm && (
        <div className="text-center py-12">
          <KeyRound className="mx-auto text-gray-400 mb-4" size={64} />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No passwords yet</h3>
          <p className="text-gray-600 mb-6">Get started by adding your first password</p>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus size={20} className="mr-2" />
            Add Your First Password
          </Button>
        </div>
      )}

      {/* No search results */}
      {!loading && filteredPasswords.length === 0 && searchTerm && (
        <div className="text-center py-12">
          <p className="text-gray-600">No passwords found for "{searchTerm}"</p>
        </div>
      )}

      {/* Password grid */}
      {!loading && filteredPasswords.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPasswords.map((password) => (
            <PasswordCard
              key={password.id}
              password={password}
              onView={handleView}
              onEdit={(p) => {
                setSelectedPassword(p);
                setShowEditModal(true);
              }}
              onDelete={(p) => {
                setSelectedPassword(p);
                setShowDeleteModal(true);
              }}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Add New Password">
        <PasswordForm
          onSubmit={handleCreate}
          onCancel={() => setShowCreateModal(false)}
          loading={actionLoading}
        />
      </Modal>

      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Password">
        <PasswordForm
          password={selectedPassword}
          onSubmit={handleUpdate}
          onCancel={() => setShowEditModal(false)}
          loading={actionLoading}
        />
      </Modal>

      <Modal isOpen={showViewModal} onClose={() => setShowViewModal(false)} title="Password Details">
        {selectedPassword && <PasswordDetails password={selectedPassword} />}
      </Modal>

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        password={selectedPassword}
        loading={actionLoading}
      />
    </div>
  );
};
