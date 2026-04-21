import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, LogOut, Plus, User } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold text-primary-700">
          <Home className="w-6 h-6" />
          Basera
        </Link>
        <div className="flex items-center gap-4">
          <Link to="/" className="text-gray-600 hover:text-primary-600 font-medium">Browse</Link>
          {user?.role === 'owner' && (
            <Link to="/rooms/new" className="flex items-center gap-1 text-primary-600 hover:text-primary-700 font-medium">
              <Plus className="w-4 h-4" /> List Room
            </Link>
          )}
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600 flex items-center gap-1">
                <User className="w-4 h-4" /> {user.name}
              </span>
              <button onClick={handleLogout} className="flex items-center gap-1 text-red-500 hover:text-red-600 text-sm">
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">Login</Link>
              <Link to="/register" className="bg-primary-600 text-white px-4 py-1.5 rounded-lg hover:bg-primary-700 font-medium">Sign Up</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
