import React, { useState } from 'react';
import { 
  User, Mail, MapPin, Phone, Calendar, Edit3, 
  Package, DollarSign, ShoppingBag, Trash2, ExternalLink,
  CheckCircle2, Clock
} from 'lucide-react';

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState('listings');

  // Sample User Data
  const user = {
    name: "Alex Johnson",
    role: "Engineering student looking to declutter and find great deals on campus essentials!",
    email: "alex.johnson@university.edu",
    phone: "+1 (555) 123-4567",
    college: "Stanford University",
    joined: "Joined January 2024",
    stats: { listed: 3, sold: 1, purchases: 2 }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-10 px-4">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* 1. Profile Header Card (Image reference: image_5533a8.png) */}
        <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="relative">
              <div className="w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center overflow-hidden border-4 border-white shadow-md">
                <img 
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex" 
                  alt="Profile" 
                  className="w-full h-full"
                />
              </div>
              <button className="absolute bottom-1 right-1 bg-blue-600 p-2 rounded-full text-white border-2 border-white shadow-sm hover:bg-blue-700 transition-colors">
                <ShoppingBag size={14} />
              </button>
            </div>

            <div className="flex-1 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
                  <p className="text-gray-500 mt-1 font-medium">{user.role}</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 border rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all">
                  <Edit3 size={16} /> Edit Profile
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 text-sm text-gray-500 font-medium">
                <div className="flex items-center gap-2"><Mail size={16} className="text-gray-400"/> {user.email}</div>
                <div className="flex items-center gap-2"><Phone size={16} className="text-gray-400"/> {user.phone}</div>
                <div className="flex items-center gap-2"><MapPin size={16} className="text-gray-400"/> {user.college}</div>
                <div className="flex items-center gap-2"><Calendar size={16} className="text-gray-400"/> {user.joined}</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-10 pt-8 border-t border-gray-50 text-center">
            <div><h4 className="text-2xl font-black text-blue-600">{user.stats.listed}</h4><p className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-1">Listed Items</p></div>
            <div><h4 className="text-2xl font-black text-blue-600">{user.stats.sold}</h4><p className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-1">Items Sold</p></div>
            <div><h4 className="text-2xl font-black text-blue-600">{user.stats.purchases}</h4><p className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-1">Purchases</p></div>
          </div>
        </div>

        {/* 2. Tab Navigation */}
        <div className="flex gap-2 bg-gray-200/50 p-1 rounded-2xl w-fit">
          <button 
            onClick={() => setActiveTab('listings')}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'listings' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <Package size={18} /> My Listings
          </button>
          <button 
            onClick={() => setActiveTab('transactions')}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'transactions' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <Clock size={18} /> Transactions
          </button>
        </div>

        {/* 3. Tab Content */}
        <div className="space-y-4">
          {activeTab === 'listings' ? (
            <div className="space-y-4">
               {/* My Listings Content (Image reference: image_5533a8.png) */}
              <ListingCard title="Calculus Textbook 11th Edition" price="$45" status="active" />
              <ListingCard title="MacBook Pro 2019" price="$850" status="sold" />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Transactions Content (Image reference: image_553441.png) */}
              <TransactionItem type="sold" title="MacBook Pro 2019" amount="+$850" date="2024-02-18" party="Sarah M." />
              <TransactionItem type="purchased" title="Gaming Chair" amount="-$120" date="2024-02-10" party="Mike T." />
              <TransactionItem type="sold" title="Python Programming Book" amount="+$25" date="2024-01-28" party="Emily R." />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Sub-component for Listings
const ListingCard = ({ title, price, status }) => (
  <div className="bg-white p-6 rounded-3xl border border-gray-100 flex gap-6 items-center hover:shadow-md transition-shadow">
    <div className="w-24 h-24 bg-gray-100 rounded-2xl overflow-hidden shrink-0">
      <img src="https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=150" alt="product" className="w-full h-full object-cover" />
    </div>
    <div className="flex-1">
      <div className="flex justify-between items-start">
        <h3 className="font-bold text-lg text-gray-900">{title}</h3>
        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${status === 'active' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
          {status}
        </span>
      </div>
      <p className="text-blue-600 font-black text-xl mt-1">{price}</p>
      <div className="flex gap-4 mt-4">
        <button className="text-xs font-bold text-gray-500 bg-gray-50 px-4 py-2 rounded-lg hover:bg-gray-100 flex items-center gap-1"><Edit3 size={14}/> Edit</button>
        <button className="text-xs font-bold text-red-500 bg-red-50 px-4 py-2 rounded-lg hover:bg-red-100 flex items-center gap-1"><Trash2 size={14}/> Delete</button>
      </div>
    </div>
  </div>
);

// Sub-component for Transactions
const TransactionItem = ({ type, title, amount, date, party }) => (
  <div className="bg-white p-5 rounded-2xl border border-gray-100 flex justify-between items-center group hover:border-blue-200 transition-all">
    <div className="flex items-center gap-4">
      <div className={`p-3 rounded-xl ${type === 'sold' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
        <ShoppingBag size={20} />
      </div>
      <div>
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${type === 'sold' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'}`}>{type}</span>
          <h4 className="font-bold text-gray-900">{title}</h4>
        </div>
        <p className="text-xs text-gray-400 mt-1">{type === 'sold' ? 'Buyer' : 'Seller'}: {party} • {date}</p>
      </div>
    </div>
    <div className="text-right">
      <p className={`font-black text-lg ${amount.startsWith('+') ? 'text-blue-600' : 'text-gray-900'}`}>{amount}</p>
      <span className="text-[10px] font-bold text-gray-400 border px-2 py-0.5 rounded-md flex items-center gap-1 mt-1">
        <CheckCircle2 size={10} className="text-green-500"/> completed
      </span>
    </div>
  </div>
);

export default ProfilePage;