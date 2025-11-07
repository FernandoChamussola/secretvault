import { Navbar } from '../components/layout/Navbar';
import { PasswordList } from '../components/passwords/PasswordList';

export const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">My Passwords</h1>
          <p className="text-gray-600 mt-1">Manage your secure credentials</p>
        </div>

        <PasswordList />
      </main>
    </div>
  );
};
