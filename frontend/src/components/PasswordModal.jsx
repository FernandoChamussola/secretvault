import { useState } from 'react';

function PasswordModal({ password, onClose }) {
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(password.password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">{password.title}</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Senha
            </label>
            <div className="flex gap-2">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password.password}
                readOnly
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="px-4 py-3 bg-gray-200 hover:bg-gray-300 rounded-lg transition"
                title={showPassword ? 'Esconder' : 'Mostrar'}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <button
            onClick={handleCopy}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-lg transition duration-200"
          >
            {copied ? '✓ Copiado!' : '📋 Copiar Senha'}
          </button>

          {password.description && (
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Descrição
              </label>
              <p className="px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 whitespace-pre-wrap">
                {password.description}
              </p>
            </div>
          )}

          <div className="text-sm text-gray-600">
            <p>Criado em: {formatDate(password.created_at)}</p>
            {password.updated_at !== password.created_at && (
              <p>Atualizado em: {formatDate(password.updated_at)}</p>
            )}
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-6 bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 rounded-lg transition duration-200"
        >
          Fechar
        </button>
      </div>
    </div>
  );
}

export default PasswordModal;
