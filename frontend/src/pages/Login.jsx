import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { KeyRound } from 'lucide-react';
import { LoginForm } from '../components/auth/LoginForm';
import { Card } from '../components/ui/Card';
import { useAuth } from '../contexts/AuthContext';

export const Login = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-primary-600 p-3 rounded-full">
              <KeyRound className="text-white" size={40} />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">CofreKeys</h1>
          <p className="text-gray-600">Secure Password Manager</p>
        </div>

        {/* Login form */}
        <Card>
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Login</h2>
          <LoginForm />
        </Card>
      </div>
    </div>
  );
};
