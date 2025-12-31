import React, { useState } from 'react';
import { Search, Filter, SlidersHorizontal, MapPin, Tag, Clock } from 'lucide-react';

const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState("");

  // Sample data for the marketplace items
  const items = [
    { id: 1, title: "Engineering Physics Textbook", price: "₹450", category: "Books", location: "Library Block", time: "2h ago", img: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=200" },
    { id: 2, title: "Scientific Calculator FX-991ES", price: "₹800", category: "Electronics", location: "Hostel A", time: "5h ago", img: "https://images.unsplash.com/photo-1574607383476-f517f260d30b?auto=format&fit=crop&q=80&w=200" },
    { id: 3, title: "Study Table & Chair Set", price: "₹1,200", category: "Furniture", location: "Hostel C", time: "1d ago", img: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&q=80&w=200" },
    { id: 4, title: "Laptop Cooling Pad", price: "₹300", category: "Electronics", location: "Campus Cafe", time: "30m ago", img: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&q=80&w=200" },
  ];

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      {/* 1. Search & Filter Header Section */}
      <div className="bg-white border-b sticky top-16 z-40 px-4 py-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-4 items-center">
          
          {/* Search Bar */}
          <div className="relative w-full md:flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input 
              type="text"
              placeholder="Search for textbooks, electronics, or room decor..."
              className="w-full pl-12 pr-4 py-3 bg-gray-100 border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Filter Action Buttons */}
          <div className="flex gap-2 w-full md:w-auto">
            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 border border-gray-200 rounded-2xl hover:bg-gray-50 font-semibold text-gray-700 transition-all">
              <Filter size={18} /> Category
            </button>
            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-2xl hover:bg-black font-semibold transition-all shadow-lg shadow-gray-200">
              <SlidersHorizontal size={18} /> Filters
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main Content Grid */}
      <div className="max-w-7xl mx-auto px-4 mt-8">
        
        {/* Section Title */}
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Recommended for You</h2>
            <p className="text-gray-500 text-sm mt-1">Based on your campus and interests</p>
          </div>
          <button className="text-blue-600 font-bold text-sm hover:underline">View All</button>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded-3xl border border-gray-100 overflow-hidden hover:shadow-2xl hover:shadow-blue-100 transition-all group cursor-pointer">
              
              {/* Image Container */}
              <div className="relative aspect-square overflow-hidden bg-gray-200">
                <img 
                  src={item.img} 
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                />
                <div className="absolute top-3 right-3">
                  <span className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-gray-800 shadow-sm">
                    {item.category}
                  </span>
                </div>
              </div>

              {/* Details Container */}
              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-gray-900 leading-tight group-hover:text-blue-600 transition-colors">
                    {item.title}
                  </h3>
                </div>
                
                <div className="flex items-center gap-1 text-blue-600 font-black text-xl mb-4">
                  {item.price}
                </div>

                <div className="space-y-2 border-t pt-4">
                  <div className="flex items-center gap-2 text-gray-500 text-xs font-medium">
                    <MapPin size={14} className="text-gray-400" />
                    {item.location}
                  </div>
                  <div className="flex items-center gap-2 text-gray-500 text-xs font-medium">
                    <Clock size={14} className="text-gray-400" />
                    {item.time}
                  </div>
                </div>

                <button className="w-full mt-4 bg-gray-50 hover:bg-blue-600 hover:text-white text-gray-900 py-3 rounded-xl font-bold text-sm transition-all">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Floating Action Button for Selling (MERN Trigger) */}
      <button className="fixed bottom-8 right-8 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-2xl shadow-2xl shadow-blue-400 flex items-center gap-3 transition-all transform hover:-translate-y-1 active:scale-95 z-50">
        <div className="bg-white/20 p-1 rounded-lg">
          <Tag size={20} />
        </div>
        <span className="font-bold pr-2">Sell an Item</span>
      </button>
    </div>
  );
};

export default HomePage;