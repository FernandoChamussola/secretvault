import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { passwordsAPI } from '../lib/api';
import { isAuthenticated } from '../lib/auth';
import Navbar from '../components/Navbar';
import PasswordCard from '../components/PasswordCard';
import PasswordModal from '../components/PasswordModal';
import PasswordForm from '../components/PasswordForm';
import DeleteModal from '../components/DeleteModal';

function Dashboard() {
  const navigate = useNavigate();
  const [passwords, setPasswords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPassword, setSelectedPassword] = useState(null);
  const [modalType, setModalType] = useState(null); // 'view', 'create', 'edit', 'delete'

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    loadPasswords();
  }, [navigate]);

  const loadPasswords = async () => {
    try {
      const response = await passwordsAPI.getAll();
      setPasswords(response.data);
    } catch (error) {
      console.error('Error loading passwords:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleNewPassword = () => {
    setSelectedPassword(null);
    setModalType('create');
  };

  const handleView = (password) => {
    setSelectedPassword(password);
    setModalType('view');
  };

  const handleEdit = (password) => {
    setSelectedPassword(password);
    setModalType('edit');
  };

  const handleDelete = (password) => {
    setSelectedPassword(password);
    setModalType('delete');
  };

  const handleSavePassword = async (formData) => {
    try {
      if (modalType === 'create') {
        await passwordsAPI.create(formData);
      } else if (modalType === 'edit') {
        await passwordsAPI.update(selectedPassword.id, formData);
      }
      await loadPasswords();
      setModalType(null);
      setSelectedPassword(null);
    } catch (error) {
      throw error;
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await passwordsAPI.delete(selectedPassword.id);
      await loadPasswords();
      setModalType(null);
      setSelectedPassword(null);
    } catch (error) {
      console.error('Error deleting password:', error);
    }
  };

  const handleCloseModal = () => {
    setModalType(null);
    setSelectedPassword(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-2xl text-gray-600">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar onNewPassword={handleNewPassword} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {passwords.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔒</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Você ainda não tem senhas salvas
            </h2>
            <button
              onClick={handleNewPassword}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-lg text-lg transition duration-200"
            >
              + Adicionar Primeira Senha
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {passwords.map((password) => (
              <PasswordCard
                key={password.id}
                password={password}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </main>

      {/* Modals */}
      {modalType === 'view' && selectedPassword && (
        <PasswordModal password={selectedPassword} onClose={handleCloseModal} />
      )}

      {(modalType === 'create' || modalType === 'edit') && (
        <PasswordForm
          password={selectedPassword}
          onSave={handleSavePassword}
          onClose={handleCloseModal}
        />
      )}

      {modalType === 'delete' && selectedPassword && (
        <DeleteModal
          password={selectedPassword}
          onConfirm={handleConfirmDelete}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}

export default Dashboard;
