import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// --- Sub-component for the counting effect ---
const AnimatedNumber = ({ value, duration = 2000 }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = parseInt(value);
    if (isNaN(end) || end === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDisplayValue(0);
      return;
    }

    // Determine the step size to keep the animation smooth within the duration
    const totalFrames = duration / 20; 
    const increment = end / totalFrames;
    
    let timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setDisplayValue(end);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(start));
      }
    }, 20);

    return () => clearInterval(timer);
  }, [value, duration]);

  return <span>{displayValue.toLocaleString()}</span>;
};

export default function Hero() {
  const [stats, setStats] = useState({ users: 0, active: 0, sold: 0 });
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleButton = (e) => {
    e.preventDefault();
    user ? navigate('/home') : navigate('/login');
  };

  const handleSell = (e) => {
    e.preventDefault();
    user ? navigate('/sellItem') : navigate('/login');
  };

  useEffect(() => {
    const fetchAllStats = async () => {
      try {
        const [userRes, productRes] = await Promise.all([
          fetch('http://localhost:5000/api/users/totalUsers'),
          fetch('http://localhost:5000/api/users/ProductStates')
        ]);

        const userData = await userRes.json();
        const productData = await productRes.json();

        setStats({
          users: userData.totalUsers || 0,
          active: productData.totalActive || 0,
          sold: productData.totalSold || 0
        });
      } catch (err) {
        console.error("Stats fetch failed", err);
      }
    };
    fetchAllStats();
  }, []);

  return (
    <section className="bg-[#0B0F19] text-white py-24 px-4 text-center relative overflow-hidden">
      {/* Grid Pattern Background */}
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      
      <div className="relative z-10 max-w-4xl mx-auto">
        <div className="inline-block bg-gray-800/50 border border-gray-700 px-4 py-1 rounded-full text-sm mb-8">
          <span className="text-green-400 mr-2">●</span> Trusted by campus students
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight">
          Turn Your Unused Stuff Into <span className="text-blue-500">Cash</span>
        </h1>
        
        <p className="text-gray-400 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
          Campus Marketplace connects students to buy and sell textbooks, electronics, furniture, and more.
        </p>
        
        <div className="flex justify-center gap-4 mb-20">
          <button className="bg-white text-black px-8 py-4 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-100 transition-all" onClick={handleButton}>
            Start Shopping <ArrowRight size={20}/>
          </button>
          <button className="bg-transparent border border-gray-700 px-8 py-4 rounded-xl font-bold hover:bg-white/5 transition-all" onClick={handleSell}>
            Sell Your Items
          </button>
        </div>

        {/* Statistics Grid with Animated Numbers */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-12 border-t border-gray-800">
          <div>
            <h3 className="text-3xl font-bold">
                <AnimatedNumber value={stats.users} />
            </h3>
            <p className="text-gray-500 text-sm">Active Users</p>
          </div>
          <div>
            <h3 className="text-3xl font-bold">
                <AnimatedNumber value={stats.sold} />
            </h3>
            <p className="text-gray-500 text-sm">Items Sold</p>
          </div>
          <div>
            <h3 className="text-3xl font-bold">
                <AnimatedNumber value={stats.active} />
            </h3>
            <p className="text-gray-500 text-sm">Active Products</p>
          </div>
          <div>
            <h3 className="text-3xl font-bold">4.9★</h3>
            <p className="text-gray-500 text-sm">Average Rating</p>
          </div>
        </div>
      </div>
    </section>
  );
}