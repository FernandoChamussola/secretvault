import { useNavigate } from 'react-router-dom';
import { getUser, logout } from '../lib/auth';

function Navbar({ onNewPassword }) {
  const navigate = useNavigate();
  const user = getUser();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-800">🔐 CofreKeys</h1>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-gray-700 hidden sm:block">
              Olá, <span className="font-bold">{user?.name}</span>
            </span>

            <button
              onClick={onNewPassword}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
            >
              + Nova Senha
            </button>

            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
            >
              Sair
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
