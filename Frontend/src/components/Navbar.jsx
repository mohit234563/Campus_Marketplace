import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  ShoppingBag, 
  PlusSquare, 
  UserCircle, 
  Headphones, 
  LogIn,
  LogOut, // Added LogOut icon
  Menu,
  X 
} from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth(); // Get user and logout from context

  // Navigation links - we can conditionally add/remove these if needed
  const navLinks = [
    { name: 'Sell Item', icon: <PlusSquare size={18} />, to: '/sellItem' },
    { name: 'Profile', icon: <UserCircle size={18} />, to: '/profile' },
  ];

  // Combined handler for the Auth button
  const handleAuthAction = () => {
    if (user) {
      logout(); // If user exists, log them out
    } else {
      navigate('/login'); // If no user, send to login page
    }
    setIsOpen(false); // Close mobile menu if open
  };
  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo Section */}
          <Link to="/" className="flex items-center gap-2 cursor-pointer">
            <div className="bg-linear-to-br from-blue-500 to-indigo-600 p-2 rounded-lg shadow-md">
              <ShoppingBag className="text-white h-6 w-6" />
            </div>
            <span className="text-xl font-bold text-gray-900 tracking-tight">
              Campus Marketplace
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={user?link.to:'/login'}
                className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors duration-200"
              >
                {link.icon}
                {link.name}
              </Link>
            ))}
            
            {/* Dynamic Auth Button */}
            <button 
              className={`flex items-center gap-2 px-5 py-2 rounded-lg font-bold text-sm transition-all transform active:scale-95 shadow-md ${
                user 
                ? 'bg-red-50 text-red-600 hover:bg-red-100 shadow-red-50' // Style for Logout
                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200' // Style for Login
              }`} 
              onClick={handleAuthAction}
            >
              {user ? <LogOut size={18} /> : <LogIn size={18} />}
              {user ? 'Sign Out' : 'Sign In'}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-600 hover:text-blue-600 focus:outline-none"
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 animate-in slide-in-from-top duration-300">
          <div className="px-4 pt-2 pb-6 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={user?link.to:'/login'}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-4 px-3 py-3 text-base font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all"
              >
                {link.icon}
                {link.name}
              </Link>
            ))}
            
            <div className="pt-4 px-3">
              <button 
                onClick={handleAuthAction}
                className={`w-full flex justify-center items-center gap-2 py-3 rounded-xl font-bold shadow-lg transition-all ${
                  user 
                  ? 'bg-red-50 text-red-600' 
                  : 'bg-blue-600 text-white'
                }`}
              >
                {user ? <LogOut size={20} /> : <LogIn size={20} />}
                {user ? 'Sign Out' : 'Sign In'}
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;