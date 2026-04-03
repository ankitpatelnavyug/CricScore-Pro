import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { auth } from '../lib/firebase';
import { Trophy, Users, User, LayoutDashboard, LogOut, PlayCircle, Search } from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Trophy className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900 tracking-tight">CricScore Pro</span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 transition-colors">
              <LayoutDashboard className="h-4 w-4" />
              <span className="text-sm font-medium">Dashboard</span>
            </Link>
            <Link to="/matches" className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 transition-colors">
              <PlayCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Matches</span>
            </Link>
            <Link to="/teams" className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 transition-colors">
              <Users className="h-4 w-4" />
              <span className="text-sm font-medium">Teams</span>
            </Link>
            <Link to="/players" className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 transition-colors">
              <User className="h-4 w-4" />
              <span className="text-sm font-medium">Players</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="pl-10 pr-4 py-1.5 bg-gray-100 border-none rounded-full text-sm focus:ring-2 focus:ring-blue-500 w-48 transition-all"
              />
            </div>
            
            <Link to="/profile" className="flex items-center space-x-2 group">
              <img 
                src={profile?.photoURL || `https://ui-avatars.com/api/?name=${profile?.displayName || 'User'}`} 
                alt="Profile" 
                className="h-8 w-8 rounded-full border-2 border-transparent group-hover:border-blue-500 transition-all"
              />
            </Link>

            <button 
              onClick={handleLogout}
              className="p-2 text-gray-500 hover:text-red-600 transition-colors"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
