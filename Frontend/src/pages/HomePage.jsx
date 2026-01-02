import React, { useEffect, useState } from 'react';
import {ShoppingBag,  Search, Filter, SlidersHorizontal, MapPin, Tag, Clock, Loader2, ChevronLeft, User, Info } from 'lucide-react';
import{useAuth} from '../context/AuthContext';
import {useNavigate} from 'react-router-dom'
const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate=useNavigate();
  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/users/productList', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      console.log(data);
      // Using data.product as per your log check
      setItems(Array.isArray(data.product) ? data.product : []);
    } catch (err) {
      console.error("something went wrong", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchItems();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }
  
  const handleSell=(e)=>{
    e.preventDefault();
    navigate('/sellItem');
  }
  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      {/* 1. Header Section */}
      <div className="bg-white border-b sticky top-0 z-40 px-4 py-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-4 items-center">
          <div className="relative w-full md:flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input 
              type="text"
              placeholder="Search for textbooks, electronics..."
              className="w-full pl-12 pr-4 py-3 bg-gray-100 border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 border border-gray-200 rounded-2xl hover:bg-gray-50 font-semibold transition-all">
              <Filter size={18} /> Category
            </button>
            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-2xl hover:bg-black font-semibold transition-all shadow-lg shadow-gray-200">
              <SlidersHorizontal size={18} /> Filters
            </button>
          </div>
        </div>
      </div>

      {/* 2. Content Grid */}
      <div className="max-w-7xl mx-auto px-4 mt-8">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Recommended for You</h2>
            <p className="text-gray-500 text-sm mt-1">Based on your campus and interests</p>
          </div>
          
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {items.length > 0 ? (
            items.map((item) => <ProductCard key={item._id} item={item} />)
          ) : (
            <div className="col-span-full text-center p-12 bg-white rounded-3xl border border-dashed text-gray-400 font-medium">
              No Item Listed yet.
            </div>
          )}
        </div>
      </div>

      {/* 3. Floating Button */}
      <button className="fixed bottom-8 right-8 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-2xl shadow-2xl flex items-center gap-3 transition-all transform hover:-translate-y-1 active:scale-95 z-50" onClick={handleSell}>
        <Tag size={20} />
        <span className="font-bold pr-2">Sell an Item</span>
      </button>
    </div>
  );
};

// --- Separate ProductCard Component to handle the Flip ---
const ProductCard = ({ item }) => {
  const [flipped, setFlipped] = useState(false);
  const {user}=useAuth();
  const handleBuyNow=async(e,productId)=>{
    e.stopPropagation();
    if (!window.confirm("Do you want to buy this item?")) return;
    try{
      const response =await fetch('http://localhost:5000/api/users/buyItem',{
      method:'POST',
      headers:{'Content-Type':'application/json',
        'Authorization':`Bearer ${user.token}`
      },
      body:JSON.stringify({productId})
      })
      const data=await response.json()
      if (response.ok) {
      alert("Order placed successfully!");
      // Optional: Redirect to profile or refresh items
      window.location.href = '/profile';
    } else {
      alert(data.message || "Failed to purchase item");
    }
    
    }catch(err){
      console.log("something went wrong",err);
    }
  }
  return (
    <div className="perspective-1000 h-105 w-full group">
      <div className={`relative w-full h-full transition-transform duration-700 preserve-3d ${flipped ? 'rotate-y-180' : ''}`}>
        
        {/* FRONT SIDE */}
        <div className="absolute inset-0 backface-hidden bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm flex flex-col">
          <div className="relative h-48 overflow-hidden bg-gray-200">
            <img 
              src={item.img || "https://via.placeholder.com/300"} 
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
            />
            <div className="absolute top-3 right-3">
              <span className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase text-gray-800 shadow-sm">
                {item.category}
              </span>
            </div>
          </div>

          <div className="p-5 flex-1 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-gray-900 leading-tight mb-2 truncate">{item.title}</h3>
              <div className="text-blue-600 font-black text-2xl">${item.price}</div>
            </div>
            
            <div className="flex items-center gap-2 text-gray-500 text-xs mt-4 pt-4 border-t">
              <Clock size={14} />
              {new Date(item.created_at).toLocaleDateString()}
            </div>

            <div className="flex gap-2 mt-4">
              <button 
                onClick={() => setFlipped(true)}
                className="flex-1 bg-gray-100 text-gray-900 py-3 rounded-xl font-bold text-xs hover:bg-gray-200 transition-all"
              >
                Details
              </button>
              <button 
                onClick={(e) => handleBuyNow(e, item._id)}
                className="flex-[1.5] bg-blue-600 text-white py-3 rounded-xl font-bold text-xs hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-1"
                
              >
                <ShoppingBag size={14} /> Buy Now
              </button>
            </div>
          </div>
        </div>

        {/* BACK SIDE (No Image) */}
        <div className="absolute inset-0 backface-hidden rotate-y-180 bg-white rounded-3xl border-2 border-blue-500 p-6 flex flex-col shadow-xl shadow-blue-50">
          <div className="flex-1 space-y-4">
            <div className="flex justify-between items-start">
              <h3 className="font-bold text-xl text-gray-900">{item.title}</h3>
              <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-[10px] font-bold uppercase">{item.category}</span>
            </div>

            <div className="text-3xl font-black text-blue-600 mb-6">${item.price}</div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-gray-600">
                <User size={16} className="text-blue-500" />
                <span className="text-sm font-semibold">Seller: <span className="text-gray-900">{item.sellerName || "Verified User"}</span></span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Clock size={16} className="text-blue-500" />
                <span className="text-sm">Posted on {new Date(item.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex flex-col gap-1 pt-2">
                <div className="flex items-center gap-2 text-gray-900 font-bold text-xs uppercase tracking-wider">
                  <Info size={14} className="text-blue-500" /> Description
                </div>
                <p className="text-xs text-gray-500 leading-relaxed line-clamp-4">
                  {item.description || "No description provided for this item. Contact the seller for more details."}
                </p>
              </div>
            </div>
          </div>

          <button 
            onClick={() => setFlipped(false)}
            className="w-full mt-auto flex items-center justify-center gap-2 text-gray-400 font-bold text-sm hover:text-blue-600 transition-colors"
          >
            <ChevronLeft size={16} /> Back to Preview
          </button>
        </div>

      </div>
    </div>
  );
};

export default HomePage;