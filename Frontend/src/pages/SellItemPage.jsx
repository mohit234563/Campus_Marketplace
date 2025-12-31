import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Tag, 
  LayoutList, 
  FileText, 
  DollarSign, 
  ShieldCheck, 
  Image as ImageIcon,
  Upload,
  X 
} from 'lucide-react';

const sellItemPage = () => {
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    price: '',
    condition: ''
  });

  const categories = ['Textbooks', 'Electronics', 'Clothing', 'Accessories', 'Sports', 'Bikes'];
  const conditions = ['New', 'Like New', 'Excellent', 'Good', 'Fair'];
  const navigate=useNavigate(); 
    const handleBackButton=(e)=>{
      e.preventDefault();
      navigate('/home');
    }
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        
        {/* Top Navigation */}
        <button className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors mb-6" onClick={handleBackButton}>
          <ArrowLeft size={16} />
          Back to Home
        </button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">List Your Item</h1>
          <p className="text-gray-500 mt-2">Fill in the details below to list your item on Campus Marketplace</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 space-y-8">
          
          {/* Item Title */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
              <Tag size={16} className="text-gray-400" />
              Item Title <span className="text-red-500">*</span>
            </label>
            <input 
              type="text" 
              placeholder="e.g., MacBook Pro 2019 - 16GB RAM"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all"
            />
            <p className="text-xs text-gray-400">Be specific and descriptive</p>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
              <LayoutList size={16} className="text-gray-400" />
              Category <span className="text-red-500">*</span>
            </label>
            <select className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none transition-all bg-white appearance-none">
              <option value="">Select a category</option>
              {categories.map(cat => <option key={cat} value={cat.toLowerCase()}>{cat}</option>)}
            </select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
              <FileText size={16} className="text-gray-400" />
              Description <span className="text-red-500">*</span>
            </label>
            <textarea 
              rows="4"
              placeholder="Describe your item's condition, features, and any important details..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none transition-all resize-none"
            />
            <p className="text-xs text-gray-400">Include details about condition, usage, and reason for selling</p>
          </div>

          {/* Price and Condition Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                <DollarSign size={16} className="text-gray-400" />
                Price <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input 
                  type="number" 
                  placeholder="0.00"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none transition-all"
                />
              </div>
              <p className="text-xs text-gray-400">Set a fair price in USD</p>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                <ShieldCheck size={16} className="text-gray-400" />
                Condition <span className="text-red-500">*</span>
              </label>
              <select className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none transition-all bg-white appearance-none">
                <option value="">Select condition</option>
                {conditions.map(cond => <option key={cond} value={cond.toLowerCase()}>{cond}</option>)}
              </select>
            </div>
          </div>

          {/* Photos Upload */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                <ImageIcon size={16} className="text-gray-400" />
                Photos <span className="text-red-500">*</span>
              </label>
              <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-md">0/3</span>
            </div>
            
            <p className="text-xs text-gray-400">Upload up to 3 high-quality photos of your item</p>
            
            <div className="w-48 aspect-square rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50 hover:border-blue-200 transition-all group">
              <Upload size={32} className="text-gray-300 group-hover:text-blue-400 mb-2" />
              <span className="text-sm font-medium text-gray-400 group-hover:text-blue-500">Upload Photos</span>
            </div>
            
            <p className="text-xs text-red-500 font-medium">At least one photo is required to list your item</p>
          </div>

          {/* Guidelines Box */}
          <div className="bg-blue-50/50 rounded-2xl border border-blue-100 p-6 space-y-4">
            <h4 className="font-bold text-gray-900 text-sm">Before you submit:</h4>
            <ul className="space-y-2">
              {['Make sure all photos are clear and well-lit', 
                'Double-check your price and description for accuracy', 
                'Be honest about the item\'s condition', 
                'Respond quickly to buyer inquiries'
              ].map((note, i) => (
                <li key={i} className="flex items-start gap-3 text-xs text-gray-600">
                  <span className="mt-1 w-1 h-1 rounded-full bg-gray-400 shrink-0" />
                  {note}
                </li>
              ))}
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col md:flex-row gap-4 pt-4">
            <button className="flex-1 px-6 py-4 rounded-xl border border-gray-200 font-bold text-gray-700 hover:bg-gray-50 transition-all">
              Cancel
            </button>
            <button className="flex-[2] px-6 py-4 rounded-xl bg-blue-600 text-white font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-[0.98]">
              List Item
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default sellItemPage;