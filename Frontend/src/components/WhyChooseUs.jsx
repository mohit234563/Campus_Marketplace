import React from 'react';
import { ShoppingBag, DollarSign, Shield, Users } from 'lucide-react';

const WhyChooseUs = () => {
  const features = [
    { icon: <ShoppingBag className="text-blue-600"/>, title: 'Campus-Only', bg: 'bg-blue-50', text: 'Buy and sell exclusively with verified students from your campus. Meet on-campus for safe exchanges.' },
    { icon: <DollarSign className="text-green-600"/>, title: 'Save Money', bg: 'bg-green-50', text: 'Get textbooks, furniture, and electronics at student-friendly prices. No seller fees, more savings.' },
    { icon: <Shield className="text-purple-600"/>, title: 'Safe & Secure', bg: 'bg-purple-50', text: 'Verified student profiles, secure messaging, and on-campus meetups ensure peace of mind.' },
    { icon: <Users className="text-orange-600"/>, title: 'Community', bg: 'bg-orange-50', text: 'Connect with fellow students, build your network, and help each other save money.' }
  ];

  return (
    <section className="py-24 bg-white text-center px-4">
      <h2 className="text-4xl font-bold mb-4">Why Choose Campus Marketplace?</h2>
      <p className="text-gray-500 mb-16">Built specifically for students, by students. Safe, convenient, and sustainable.</p>
      <div className="grid md:grid-cols-4 gap-8 max-w-7xl mx-auto">
        {features.map((f, i) => (
          <div key={i} className="p-8 border border-gray-100 rounded-3xl text-left hover:shadow-xl transition-all">
            <div className={`${f.bg} w-12 h-12 rounded-xl flex items-center justify-center mb-6`}>{f.icon}</div>
            <h3 className="text-xl font-bold mb-3">{f.title}</h3>
            <p className="text-gray-500 text-sm leading-relaxed">{f.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default WhyChooseUs;