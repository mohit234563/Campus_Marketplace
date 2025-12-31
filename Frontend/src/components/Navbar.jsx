import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, 
  ShoppingCart, 
  PlusSquare, 
  UserCircle, 
  Headphones, 
  LogIn,
  Menu,
  X 
} from 'lucide-react';
import { Link } from 'react-router-dom';
const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate=useNavigate(); 
  const handleSignIn=(e)=>{
    e.preventDefault();
    navigate('/login');
  }
  const navLinks = [
    // { name: 'Buy Items', icon: <ShoppingCart size={18} />, href: '#' },
    { name: 'Sell Item', icon: <PlusSquare size={18} />, to: '/sellItem' },
    { name: 'Profile', icon: <UserCircle size={18} />, to: '/profile' },
    { name: 'Support', icon: <Headphones size={18} />, to: 'support' },
  ];

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo Section */}
          <div className="flex items-center gap-2 cursor-pointer">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2 rounded-lg shadow-md">
              <ShoppingBag className="text-white h-6 w-6" />
            </div>
            <span className="text-xl font-bold text-gray-900 tracking-tight">
              Campus Marketplace
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
              key={link.name}
              to={link.to} // Use 'to' instead of 'href'
              className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors duration-200"
              >
              {link.icon}
              {link.name}
              </Link>
            ))}
            
            {/* Sign In Button */}
            <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-bold text-sm transition-all transform active:scale-95 shadow-md shadow-blue-200" onClick={handleSignIn}>
              <LogIn size={18} />
              Sign In
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
                to={link.to}
                className="flex items-center gap-4 px-3 py-3 text-base font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all"
              >
                {link.icon}
                {link.name}
              </Link>
            ))}
            <div className="pt-4 px-3">
              <button className="w-full flex justify-center items-center gap-2 bg-blue-600 text-white py-3 rounded-xl font-bold shadow-lg">
                <LogIn size={20} />
                Sign In
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;