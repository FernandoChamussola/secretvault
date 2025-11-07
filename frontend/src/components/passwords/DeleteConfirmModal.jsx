import { AlertTriangle } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

export const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, password, loading }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Password" size="sm">
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
          <AlertTriangle className="text-red-600" size={24} />
        </div>

        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Are you sure?
        </h3>

        <p className="text-sm text-gray-600 mb-4">
          You are about to delete{' '}
          <span className="font-semibold">"{password?.title}"</span>.
          This action cannot be undone.
        </p>

        <div className="flex gap-3">
          <Button
            variant="danger"
            onClick={onConfirm}
            fullWidth
            disabled={loading}
          >
            {loading ? 'Deleting...' : 'Delete'}
          </Button>
          <Button
            variant="secondary"
            onClick={onClose}
            fullWidth
            disabled={loading}
          >
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
};
