import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin, 
  Mail, 
  Phone 
} from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: 'Quick Links',
    
      links: [{name:"Browse Item",to:'/'},{name:"Sell an Item",to:'/sellItem'},{name:"My Profile",to:'/profile'},{name:"My Listings",to:'/'}]
    },
    {
      title: 'Categories',
      links: [{name:"Textbooks",to:'#'},{name:"Electronics",to:'#'},{name:"Accessories",to:'#'}]
    },
    {
      title: 'Support',
      links: [{name:"Safety Guidelines",to:'#'},{name:"Terms of Service",to:'#'},{name:"Privacy Policy",to:'#'}]
  
    }
  ];
  return (
    <footer className="bg-white border-t border-gray-100 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
          
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 p-1.5 rounded-md">
                <span className="text-white font-bold text-sm">CM</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Campus Marketplace</span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
              Your trusted platform for buying and selling campus essentials. 
              Connect with students, discover great deals, and make campus life easier.
            </p>
            <div className="flex space-x-5 text-gray-400">
              <Facebook className="h-5 w-5 cursor-pointer hover:text-blue-600 transition-colors" />
              <Twitter className="h-5 w-5 cursor-pointer hover:text-blue-400 transition-colors" />
              <Instagram className="h-5 w-5 cursor-pointer hover:text-pink-600 transition-colors" />
              <Linkedin className="h-5 w-5 cursor-pointer hover:text-blue-700 transition-colors" />
            </div>
          </div>

          {/* Links Columns */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-bold text-gray-900 mb-6 uppercase tracking-wider">
                {section.title}
              </h3>
              <ul className="space-y-4">
                {section.links.map((link) => (
                  <li key={link.name}>
                     <Link to={link.to} className="text-gray-500 hover:text-blue-600 text-sm transition-colors" >
            {link.name}
          </Link>
                  </li>
                ))}
              </ul>
              
              {/* Special Handling for Support Column Contact Info */}
              {section.title === 'Support' && (
                <div className="mt-6 space-y-3">
                  <div className="flex items-center gap-3 text-gray-500 text-sm">
                    <Mail className="h-4 w-4" />
                    <span>support@campusmarket.edu</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-500 text-sm">
                    <Phone className="h-4 w-4" />
                    <span>+1 (555) 123-4567</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-sm">
            © {currentYear} Campus Marketplace. All rights reserved.
          </p>
          <div className="flex space-x-6 text-sm text-gray-400">
            <a href="#" className="hover:text-gray-600 transition-colors">Accessibility</a>
            <a href="#" className="hover:text-gray-600 transition-colors">Sitemap</a>
            <a href="#" className="hover:text-gray-600 transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;