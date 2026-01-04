import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import EditProfilePage from './EditProfilePage'; 

import { 
  User, Mail, MapPin, Phone, Calendar, Edit3, 
  Package, ShoppingBag, Trash2, CheckCircle2, 
  Clock, Loader2, Save, X
} from 'lucide-react';


const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState('listings');
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [myProducts, setMyProducts] = useState([]);
  const [transaction, setTransaction] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  
  // New state for inline product editing
  const [editingProduct, setEditingProduct] = useState(null); 

  // Updated handleEdit to receive the item object
  const handleEdit = (item) => {
    setEditingProduct(item);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (e, id) => {
    e.preventDefault();
    if (!window.confirm("Are you sure?")) return;

    try {
      const response = await fetch(`http://localhost:5000/api/users/deleteItem/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        alert('Item deleted successfully');
        fetchAllData(); 
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error("server error", err);
    }
  };

  const fetchAllData = async () => {
    if (!user?.token) return;
    try {
      setLoading(true);
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user.token}`
      };

      const [profileRes, productsRes, transRes] = await Promise.all([
        fetch('http://localhost:5000/api/users/profile', { headers }),
        fetch('http://localhost:5000/api/users/myproducts', { headers }),
        fetch('http://localhost:5000/api/users/orderHistory', { headers })
      ]);

      const profileData = await profileRes.json();
      const productsData = await productsRes.json();
      const transData = await transRes.json();

      setProfile(profileData);
      setMyProducts(Array.isArray(productsData) ? productsData : []);
      setTransaction(Array.isArray(transData.orders) ? transData.orders : (Array.isArray(transData) ? transData : []));

    } catch (err) {
      console.error("Critical fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  if (!profile) return <div className="text-center py-20 font-bold text-gray-500">Profile not found.</div>;
  
  return (
    <div className="bg-gray-50 min-h-screen py-10 px-4">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* VIEW LOGIC: Profile Edit vs Product Edit vs Header */}
        {isEditing ? (
          <EditProfilePage 
            initialData={profile} 
            onCancel={() => setIsEditing(false)} 
            onUpdateSuccess={() => {
              setIsEditing(false);
              fetchAllData(); 
            }} 
          />
        ) : editingProduct ? (
          <EditItemInline 
            item={editingProduct} 
            token={user.token}
            onCancel={() => setEditingProduct(null)} 
            onUpdateSuccess={() => {
              setEditingProduct(null);
              fetchAllData();
            }}
          />
        ) : (
          <>
            {/* Profile Header Card */}
            <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="relative">
                  <div className="w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center overflow-hidden border-4 border-white shadow-md">
                    <img 
                      src={profile.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.name}`} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                <div className="flex-1 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900">{profile.name}</h1>
                      <p className="text-blue-600 mt-1 font-bold uppercase text-xs tracking-widest italic">{profile.role}</p>
                    </div>
                    <button 
                      className="flex items-center gap-2 px-4 py-2 border rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all" 
                      onClick={() => setIsEditing(true)}
                    >
                      <Edit3 size={16} /> Edit Profile
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 text-sm text-gray-500 font-medium">
                    <div className="flex items-center gap-2"><Mail size={16} className="text-gray-400"/> {profile.email}</div>
                    <div className="flex items-center gap-2"><Phone size={16} className="text-gray-400"/> {profile.phone || "No phone added"}</div>
                    <div className="flex items-center gap-2"><MapPin size={16} className="text-gray-400"/> {profile.address || "No address added"}</div>
                    <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-gray-400"/> 
                        Joined {new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-10 pt-8 border-t border-gray-50 text-center">
                <div><h4 className="text-2xl font-black text-blue-600">{myProducts.length}</h4><p className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-1">Listed Items</p></div>
                <div><h4 className="text-2xl font-black text-blue-600">{myProducts.filter(p => p.isSold).length}</h4><p className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-1">Items Sold</p></div>
                <div><h4 className="text-2xl font-black text-blue-600">{transaction.length}</h4><p className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-1">Purchases</p></div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 bg-gray-200/50 p-1 rounded-2xl w-fit">
              <button onClick={() => setActiveTab('listings')} className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'listings' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}><Package size={18} /> My Listings</button>
              <button onClick={() => setActiveTab('transactions')} className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'transactions' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}><Clock size={18} /> Transactions</button>
            </div>

            {/* Content Area */}
            <div className="space-y-4">
              {activeTab === 'listings' ? (
                <div className="space-y-4">
                  {myProducts.length > 0 ? (
                    myProducts.map(p => (
                      <ListingCard 
                        key={p._id} 
                        title={p.title} 
                        price={p.price} 
                        status={p.isSold ? 'sold' : 'active'} 
                        image={p.images?.[0]} 
                        id={p._id} 
                        onDelete={handleDelete} 
                        onEdit={() => handleEdit(p)} // Pass whole object
                      />
                    ))
                  ) : (
                    <div className="text-center p-12 bg-white rounded-3xl border border-dashed text-gray-400 font-medium">You haven't listed anything yet.</div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {transaction.length > 0 ? (
                    transaction.map((t, i) => <TransactionItem key={t._id || i} type="purchased" title={t.product?.title || "Deleted Product"} amount={`$${t.product?.price || 0}`} date={ new Date(t.created_at).toLocaleDateString()} party={t.seller?.name || "N/A"} />)
                  ) : (
                    <div className="text-center p-12 bg-white rounded-3xl border border-dashed text-gray-400 font-medium">No transactions found.</div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// --- SUB-COMPONENTS ---

const EditItemInline = ({ item, token, onCancel, onUpdateSuccess }) => {
  const [formData, setFormData] = useState({
    title: item.title,
    price: item.price,
    description: item.description || ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`http://localhost:5000/api/users/ItemEdit/${item._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok) {
        alert("Product updated!");
        onUpdateSuccess();
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Error updating product");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border-2 border-blue-100 p-8 shadow-xl animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-black text-gray-900">Edit Listing</h2>
          <p className="text-gray-400 text-sm font-medium mt-1">Update your product information</p>
        </div>
        <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <X size={24} className="text-gray-400" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Title</label>
            <input 
              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Price (₹)</label>
            <input 
              type="number"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold"
              value={formData.price}
              onChange={(e) => setFormData({...formData, price: e.target.value})}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Description</label>
          <textarea 
            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
            rows="4"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
          />
        </div>

        <div className="flex gap-4 pt-4">
          <button 
            type="submit" 
            disabled={submitting}
            className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-black hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-100 disabled:opacity-50"
          >
            {submitting ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
            Save Product Changes
          </button>
          <button 
            type="button" 
            onClick={onCancel}
            className="px-8 py-4 border-2 border-gray-100 rounded-2xl font-black text-gray-500 hover:bg-gray-50 transition-all"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

const ListingCard = ({ title, price, status, image, id, onDelete, onEdit }) => (
  <div className="bg-white p-6 rounded-3xl border border-gray-100 flex gap-6 items-center hover:shadow-md transition-shadow">
    <div className="w-24 h-24 bg-gray-100 rounded-2xl overflow-hidden shrink-0">
      <img 
        src={image || "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=150"} 
        alt={title} 
        className="w-full h-full object-cover" 
      />
    </div>
    <div className="flex-1">
      <div className="flex justify-between items-start">
        <h3 className="font-bold text-lg text-gray-900">{title}</h3>
        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${status === 'active' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
          {status}
        </span>
      </div>
      <p className="text-blue-600 font-black text-xl mt-1">₹{price}</p>
      {status === 'active' && (
        <div className="flex gap-4 mt-4">
          <button className="text-xs font-bold text-gray-500 bg-gray-50 px-4 py-2 rounded-lg hover:bg-gray-100 flex items-center gap-1" onClick={onEdit}><Edit3 size={14}/> Edit</button>
          <button className="text-xs font-bold text-red-500 bg-red-50 px-4 py-2 rounded-lg hover:bg-red-100 flex items-center gap-1" onClick={(e) => onDelete(e, id)}><Trash2 size={14}/> Delete</button>
        </div>
      )}
    </div>
  </div>
);

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
      <p className="font-black text-lg text-gray-900">{amount}</p>
      <span className="text-[10px] font-bold text-gray-400 border px-2 py-0.5 rounded-md flex items-center gap-1 mt-1">
        <CheckCircle2 size={10} className="text-green-500"/> completed
      </span>
    </div>
  </div>
);

export default ProfilePage;