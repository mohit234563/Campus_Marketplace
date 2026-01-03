import React, { useEffect, useState } from 'react';
import { 
  ShoppingBag, Search, Filter, SlidersHorizontal, Tag, Clock, 
  Loader2, ChevronLeft, User, Info, ChevronDown 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// --- Sub-Component: Controls (Search, Category, Sort) ---
const ProductControls = ({ 
  searchQuery, setSearchQuery, 
  selectedCategory, setSelectedCategory, 
  onSort, currentSort 
}) => {
  const [isCatOpen, setIsCatOpen] = useState(false);
  const categories = ["All", "TextBooks", "Electronics", "Clothing", "Accessories", "Sports","Bikes"];

  return (
    <div className="bg-white border-b sticky top-0 z-40 px-4 py-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-4 items-center">
        {/* Search Bar */}
        <div className="relative w-full md:flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input 
            type="text"
            placeholder="Search for Items..."
            className="w-full pl-12 pr-4 py-3 bg-gray-100 border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 w-full md:w-auto relative">
          {/* Category Dropdown */}
          <div className="relative flex-1 md:flex-none">
            <button 
              onClick={() => setIsCatOpen(!isCatOpen)}
              className={`w-full flex items-center justify-center gap-2 px-6 py-3 border rounded-2xl font-semibold transition-all ${
                selectedCategory !== "All" ? "border-blue-500 bg-blue-50 text-blue-600" : "border-gray-200 hover:bg-gray-50 text-gray-700"
              }`}
            >
              <Filter size={18} /> 
              {selectedCategory === "All" ? "Category" : selectedCategory}
              <ChevronDown size={14} className={`transition-transform ${isCatOpen ? 'rotate-180' : ''}`} />
            </button>

            {isCatOpen && (
              <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-xl z-50 py-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setSelectedCategory(cat);
                      setIsCatOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700 transition-colors"
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sort Button */}
          <button 
            onClick={onSort}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-2xl hover:bg-black font-semibold transition-all shadow-lg"
          >
            <SlidersHorizontal size={18} /> 
            {currentSort === 'price' ? 'Price: Low-High' : 'Newest'}
          </button>
        </div> 
      </div>
    </div>
  );
};

// --- Main HomePage Component ---
const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [items, setItems] = useState([]);
  const [filteredItem, setFilteredItem] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("newest"); // 'newest' or 'price'
  const [loading, setLoading] = useState(true);
  
  const navigate = useNavigate();

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/users/productList');
      const data = await response.json();
      const productList = Array.isArray(data.product) ? data.product : [];
      setItems(productList);
      setFilteredItem(productList);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchItems(); }, []);

  // Filtering and Sorting Logic
  useEffect(() => {
  const result = items.filter((item) => {
    // 1. Search Logic
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());

    // 2. Category Logic (The Fix)
    // We convert both to lowercase and trim spaces to ensure "Books" matches "books"
    const itemCategory = item.category ? item.category.toLowerCase().trim() : "";
    const selectedCat = selectedCategory.toLowerCase().trim();

    const matchesCategory = selectedCategory === "All" || itemCategory === selectedCat;

    return matchesSearch && matchesCategory;
  });
    if (sortBy === "price") {
    // Sort by price: Low to High
    result.sort((a, b) => a.price - b.price);
  } else {
    // Sort by Newest: Highest date/ID first
    result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  setFilteredItem(result);
  
}, [searchQuery, selectedCategory, items,sortBy]);

  const toggleSort = () => {
    setSortBy(prev => prev === "newest" ? "price" : "newest");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <ProductControls 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        onSort={toggleSort}
        currentSort={sortBy}
      />

      <div className="max-w-7xl mx-auto px-4 mt-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Recommended for You</h2>
          <p className="text-gray-500 text-sm mt-1">Based on your campus and interests</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {filteredItem.length > 0 ? (
            filteredItem.map((item) => <ProductCard key={item._id} item={item} />)
          ) : (
            <div className="col-span-full text-center p-12 bg-white rounded-3xl border border-dashed text-gray-400 font-medium">
              No items found matching your criteria.
            </div>
          )}
        </div>
      </div>

      <button 
        className="fixed bottom-8 right-8 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-2xl shadow-2xl flex items-center gap-3 transition-all z-50" 
        onClick={() => navigate('/sellItem')}
      >
        <Tag size={20} />
        <span className="font-bold pr-2">Sell an Item</span>
      </button>
    </div>
  );
};

// --- Separate ProductCard Component ---
const ProductCard = ({ item }) => {
  const [flipped, setFlipped] = useState(false);
  const { user } = useAuth();

  const handleBuyNow = async (e, productId) => {
    e.stopPropagation();
    if (!user) return alert("Please login to buy items");
    if (!window.confirm("Do you want to buy this item?")) return;

    try {
      const response = await fetch('http://localhost:5000/api/users/buyItem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ productId })
      });
      const data = await response.json();
      
      if (response.ok) {
        alert("Order placed successfully!");
        window.location.href = '/profile';
      } else {
        alert(data.message || "Failed to purchase item");
      }
    } catch (err) {
      console.error("Purchase error", err);
    }
  };

  return (
    <div className="h-105 w-full group" style={{ perspective: '1000px' }}>
      <div 
        className={`relative w-full h-full transition-transform duration-700 ${flipped ? 'rotate-y-180' : ''}`}
        style={{ transformStyle: 'preserve-3d', transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
      >
        {/* FRONT SIDE */}
        <div className="absolute inset-0 bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm flex flex-col" style={{ backfaceVisibility: 'hidden' }}>
          <div className="relative h-48 overflow-hidden bg-gray-200">
            <img 
              src={item.images && item.images.length > 0 ? item.images[0] : "https://via.placeholder.com/300"}
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
              <div className="text-blue-600 font-black text-2xl">₹{item.price}</div>
            </div>
            
            <div className="flex items-center gap-2 text-gray-500 text-xs mt-4 pt-4 border-t">
              <Clock size={14} />
              {new Date(item.created_at).toLocaleDateString()}
            </div>

            <div className="flex gap-2 mt-4">
              <button onClick={() => setFlipped(true)} className="flex-1 bg-gray-100 text-gray-900 py-3 rounded-xl font-bold text-xs hover:bg-gray-200">
                Details
              </button>
              <button onClick={(e) => handleBuyNow(e, item._id)} className="flex-[1.5] bg-blue-600 text-white py-3 rounded-xl font-bold text-xs hover:bg-blue-700 shadow-lg flex items-center justify-center gap-1">
                <ShoppingBag size={14} /> Buy Now
              </button>
            </div>
          </div>
        </div>

        {/* BACK SIDE */}
        <div 
          className="absolute inset-0 bg-white rounded-3xl border-2 border-blue-500 p-6 flex flex-col shadow-xl"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <div className="flex-1 space-y-4">
            <div className="flex justify-between items-start">
              <h3 className="font-bold text-xl text-gray-900">{item.title}</h3>
              <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-[10px] font-bold uppercase">{item.category}</span>
            </div>
            <div className="text-3xl font-black text-blue-600 mb-4">₹{item.price}</div>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-gray-600">
                <User size={16} className="text-blue-500" />
                <span className="text-sm font-semibold">Seller: <span className="text-gray-900">{item.seller?.name || "Verified User"}</span></span>
              </div>
              <div className="flex flex-col gap-1 pt-2">
                <div className="flex items-center gap-2 text-gray-900 font-bold text-xs uppercase tracking-wider">
                  <Info size={14} className="text-blue-500" /> Description
                </div>
                <p className="text-xs text-gray-500 leading-relaxed line-clamp-4">
                  {item.description || "No description provided."}
                </p>
              </div>
            </div>
          </div>
          <button onClick={() => setFlipped(false)} className="w-full mt-auto flex items-center justify-center gap-2 text-gray-400 font-bold text-sm hover:text-blue-600 transition-colors">
            <ChevronLeft size={16} /> Back to Preview
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;