import { useState } from 'react';

function DeleteModal({ password, onConfirm, onClose }) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
    } catch (err) {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Confirmar Exclusão
          </h2>
          <p className="text-gray-600">
            Tem certeza que deseja deletar esta senha?
          </p>
        </div>

        <div className="bg-gray-100 rounded-lg p-4 mb-6">
          <p className="font-bold text-gray-800">{password.title}</p>
          {password.description && (
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
              {password.description}
            </p>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 rounded-lg transition duration-200 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-lg transition duration-200 disabled:opacity-50"
          >
            {loading ? 'Deletando...' : 'Sim, Deletar'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteModal;
