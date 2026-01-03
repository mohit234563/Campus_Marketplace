import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {useAuth} from '../context/AuthContext';

export default function Hero () {
  const{user}=useAuth();
  const navigate=useNavigate();
  const handleButton=(e)=>{
    e.preventDefault();
    if(user){
      navigate('/home');
    }else{
      navigate('/login');
    }
  }
  const handleSell=(e)=>{
    e.preventDefault();
    if(user){
      navigate('/sellItem');
    }else{
      navigate('/login');
    }
  }
  return (
    <section className="bg-[#0B0F19] text-white py-24 px-4 text-center relative overflow-hidden">
      {/* Grid Pattern Background */}
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      
      <div className="relative z-10 max-w-4xl mx-auto">
        <div className="inline-block bg-gray-800/50 border border-gray-700 px-4 py-1 rounded-full text-sm mb-8">
          <span className="text-green-400 mr-2">●</span> Trusted by 10,000+ students across campus
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight">Turn Your Unused Stuff Into Cash</h1>
        <p className="text-gray-400 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
          Campus Marketplace connects students to buy and sell textbooks, electronics, furniture, and more. Find great deals from fellow students or declutter your dorm room today.
        </p>
        <div className="flex justify-center gap-4 mb-20">
          <button className="bg-white text-black px-8 py-4 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-100 transition-all" onClick={handleButton}>Start Shopping <ArrowRight size={20}/></button>
          <button className="bg-transparent border border-gray-700 px-8 py-4 rounded-xl font-bold hover:bg-white/5 transition-all" onClick={handleSell}>Sell Your Items</button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-12 border-t border-gray-800">
          <div><h3 className="text-3xl font-bold">10K+</h3><p className="text-gray-500 text-sm">Active Users</p></div>
          <div><h3 className="text-3xl font-bold">50K+</h3><p className="text-gray-500 text-sm">Items Sold</p></div>
          <div><h3 className="text-3xl font-bold">$2M+</h3><p className="text-gray-500 text-sm">Exchanged</p></div>
          <div><h3 className="text-3xl font-bold">4.9★</h3><p className="text-gray-500 text-sm">Average Rating</p></div>
        </div>
      </div>
    </section>
  );
};

