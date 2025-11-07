import { LogOut, KeyRound } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <KeyRound className="text-primary-600" size={32} />
            <span className="text-2xl font-bold text-gray-900">CofreKeys</span>
          </div>

          {/* User menu */}
          <div className="flex items-center gap-4">
            {user && (
              <span className="text-gray-700">
                Welcome, <span className="font-medium">{user.name || user.email}</span>
              </span>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <LogOut size={18} />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};
