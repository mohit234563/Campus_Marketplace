import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Tag, LayoutList, FileText, 
  DollarSign, Image as ImageIcon, Upload, X, Loader2 
} from 'lucide-react';

const SellItemPage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Form States
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    price: '',
  });
  
  const [images, setImages] = useState([]); // Real file objects
  const [previews, setPreviews] = useState([]); // Browser preview URLs
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const categories = ['Textbooks', 'Electronics', 'Clothing', 'Accessories', 'Sports', 'Bikes'];

  // Handle Text Changes
  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  // Handle Image Selection
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 3) {
      alert("Maximum 3 photos allowed");
      return;
    }

    setImages(prev => [...prev, ...files]);

    // Generate local previews
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviews(prev => [...prev, ...newPreviews]);
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleBackButton = () => navigate('/home');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (images.length === 0) return setError("Please upload at least one photo.");
    
    setIsSubmitting(true);
    setError('');

    const token = localStorage.getItem('token');

    try {
      // Logic Note: Since we have files, a real app would use FormData 
      // or upload to Cloudinary first. Here, we send the text data.
      const response = await fetch('http://localhost:5000/api/users/sellItem', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          ...formData,
          // Sending placeholder URLs because we aren't using a cloud storage service yet
          images: ["https://via.placeholder.com/300"] 
        }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || 'Listing failed');

      alert("Success! Your item is listed.");
      navigate('/home');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        
        <button onClick={handleBackButton} className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-blue-600 mb-6">
          <ArrowLeft size={16} /> Back to Home
        </button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">List Your Item</h1>
          <p className="text-gray-500 mt-2">Fill in the details below to list your item on Campus Marketplace</p>
        </div>

        {error && <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100">{error}</div>}

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 space-y-8">
          
          {/* Title */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
              <Tag size={16} className="text-gray-400" /> Item Title *
            </label>
            <input 
              id="title" required value={formData.title} onChange={handleChange}
              type="text" placeholder="e.g., MacBook Pro 2019"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
              <LayoutList size={16} className="text-gray-400" /> Category *
            </label>
            <select 
              id="category" required value={formData.category} onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none bg-white"
            >
              <option value="">Select a category</option>
              {categories.map(cat => <option key={cat} value={cat.toLowerCase()}>{cat}</option>)}
            </select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
              <FileText size={16} className="text-gray-400" /> Description *
            </label>
            <textarea 
              id="description" required value={formData.description} onChange={handleChange}
              rows="4" placeholder="Condition, features, and details..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          {/* Price */}
          <div className="space-y-2 max-w-[200px]">
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
              <DollarSign size={16} className="text-gray-400" /> Price *
            </label>
            <input 
              id="price" required value={formData.price} onChange={handleChange}
              type="number" placeholder="0.00"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none"
            />
          </div>

          {/* Photos */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                <ImageIcon size={16} className="text-gray-400" /> Photos *
              </label>
              <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-md">{images.length}/3</span>
            </div>
            
            <div className="flex gap-4 flex-wrap">
              {previews.map((src, i) => (
                <div key={i} className="relative w-24 h-24 group">
                  <img src={src} className="w-full h-full object-cover rounded-2xl border" alt="preview" />
                  <button 
                    type="button" onClick={() => removeImage(i)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}

              {images.length < 3 && (
                <div 
                  onClick={() => fileInputRef.current.click()}
                  className="w-24 h-24 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50 hover:border-blue-200 transition-all"
                >
                  <Upload size={24} className="text-gray-300" />
                  <input type="file" hidden ref={fileInputRef} onChange={handleImageChange} accept="image/*" multiple />
                </div>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col md:flex-row gap-4 pt-4">
            <button type="button" onClick={handleBackButton} className="flex-1 px-6 py-4 rounded-xl border border-gray-200 font-bold text-gray-700">
              Cancel
            </button>
            <button 
              type="submit" disabled={isSubmitting}
              className="flex-[2] px-6 py-4 rounded-xl bg-blue-600 text-white font-bold shadow-lg flex justify-center items-center gap-2"
            >
              {isSubmitting ? <Loader2 className="animate-spin" /> : 'List Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SellItemPage;