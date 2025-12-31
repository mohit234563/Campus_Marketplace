import React from 'react';

const Testimonials = () => {
  const reviews = [
    { name: 'Sarah Johnson', role: 'Computer Science, Junior', color: 'bg-blue-600', text: 'I saved over $800 on textbooks this semester! The platform is super easy to use and everyone I met was friendly.' },
    { name: 'Michael Chen', role: 'Business, Sophomore', color: 'bg-indigo-600', text: 'Sold my old mini-fridge and desk in less than a week. Way better than trying to haul everything home!' },
    { name: 'Emma Davis', role: 'Biology, Senior', color: 'bg-purple-600', text: 'Perfect for sustainable living on campus. I love giving my stuff a second life instead of throwing it away.' }
  ];

  return (
    <section className="py-24 bg-gray-50 text-center px-4">
      <h2 className="text-4xl font-bold mb-4">What Students Say</h2>
      <p className="text-gray-500 mb-16">Join thousands of happy students already using Campus Marketplace</p>
      <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {reviews.map((r, i) => (
          <div key={i} className="bg-white p-8 rounded-2xl border border-gray-100 text-left shadow-sm">
            <div className="flex text-yellow-400 mb-6 font-bold">★★★★★</div>
            <p className="text-gray-600 text-sm leading-relaxed mb-8 italic">"{r.text}"</p>
            <div className="flex items-center gap-4">
              <div className={`${r.color} w-10 h-10 rounded-full flex items-center justify-center text-white font-bold`}>
                {r.name[0]}
              </div>
              <div>
                <h4 className="font-bold text-sm text-gray-900">{r.name}</h4>
                <p className="text-xs text-gray-400">{r.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Testimonials;