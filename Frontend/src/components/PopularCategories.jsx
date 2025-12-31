import React from 'react';

const PopularCategories = () => {
  const categories = [
    { name: 'Textbooks', items: '5,234 items', emoji: '📚' },
    { name: 'Electronics', items: '3,892 items', emoji: '💻' },
    { name: 'Bikes', items: '892 items', emoji: '🚲' },
    { name: 'Accessories', items: '3,245 items', emoji: '🎒' }
  ];

  return (
    <section className="py-24 bg-white text-center px-4">
      <h2 className="text-4xl font-bold mb-4">Popular Categories</h2>
      <p className="text-gray-500 mb-16">Find exactly what you need from these popular student categories</p>
      <div className="grid grid-cols-2 md:grid-cols-6 gap-6 max-w-7xl mx-auto">
        {categories.map((cat, i) => (
          <div key={i} className="p-8 border border-gray-100 rounded-2xl hover:border-blue-500 hover:shadow-md transition-all cursor-pointer group">
            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{cat.emoji}</div>
            <h4 className="font-bold text-gray-900 mb-1">{cat.name}</h4>
            <p className="text-gray-400 text-xs">{cat.items}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default PopularCategories;