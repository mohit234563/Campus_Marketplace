import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Save, X, Lock, User, MapPin, Phone, School, Camera, Loader2 } from 'lucide-react';

const EditProfilePage = ({ initialData, onCancel, onUpdateSuccess }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    phone: initialData?.phone || '',
    address: initialData?.address || '',
    college: initialData?.college || '',
    avatar: initialData?.avatar || '',
    newPassword: '',
    currentPassword: '' 
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/users/profileEdit', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();
      if (response.ok) {
        alert("Profile Updated Successfully!");
        onUpdateSuccess(); 
      } else {
        alert(result.message || "Update failed");
      }
    } catch (err) {
      console.error("Update failed", err);
      alert("An error occurred during update.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-3xl p-8 shadow-lg border border-gray-100 animate-in fade-in zoom-in duration-300">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Edit Profile</h2>
        <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors">
          <X size={24} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
            <Camera size={16}/> Avatar URL
          </label>
          <input 
            name="avatar" value={formData.avatar} onChange={handleChange}
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            placeholder="https://image-link.com/avatar.jpg"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 flex items-center gap-2"><User size={16}/> Name</label>
            <input name="name" value={formData.name} onChange={handleChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" required />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 flex items-center gap-2"><Phone size={16}/> Phone</label>
            <input name="phone" value={formData.phone} onChange={handleChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 flex items-center gap-2"><MapPin size={16}/> Address</label>
            <input name="address" value={formData.address} onChange={handleChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 flex items-center gap-2"><School size={16}/> College</label>
            <input name="college" value={formData.college} onChange={handleChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
        </div>

        <hr className="my-4 border-gray-100" />

        <div className="bg-blue-50 p-6 rounded-2xl space-y-4 border border-blue-100">
          <h3 className="text-blue-800 font-bold flex items-center gap-2"><Lock size={18}/> Security Confirmation</h3>
          
          <div className="space-y-2">
            <label className="text-xs font-bold text-blue-700 uppercase">New Password (Leave blank to keep current)</label>
            <input type="password" name="newPassword" onChange={handleChange} className="w-full p-3 bg-white border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-red-600 uppercase italic">Confirm with Current Password *</label>
            <input type="password" name="currentPassword" onChange={handleChange} required className="w-full p-3 bg-white border border-red-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <button type="submit" disabled={loading} className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 disabled:bg-blue-300 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-200">
            {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />} Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProfilePage;