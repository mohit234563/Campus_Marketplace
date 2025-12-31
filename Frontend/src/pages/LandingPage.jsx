import React from 'react';
import Hero from '../components/Hero';
import WhyChooseUs from '../components/WhyChooseUs';
import HowItWorks from '../components/HowItWorks';
import PopularCategories from '../components/PopularCategories';
import Testimonials from '../components/Testimonials';
import { ArrowRight, Check } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="animate-in fade-in duration-700">
      {/* 1. Hero Section (Image reference: image_b294e5.jpg) */}
      <Hero />

      {/* 2. Value Proposition (Image reference: image_b29524.png) */}
      <WhyChooseUs />

      {/* 3. Process Steps (Image reference: image_b29560.png) */}
      <HowItWorks />

      {/* 4. Category Grid (Image reference: image_b295a1.png) */}
      <PopularCategories />

      {/* 5. Social Proof (Image reference: image_bc9249.png) */}
      <Testimonials />

      {/* 6. Final Call to Action (Image reference: image_b295db.png) */}
      <section className="py-24 bg-blue-600 text-center text-white px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-blue-100 text-lg md:text-xl mb-10 leading-relaxed">
            Join your campus community today. Buy what you need, sell what you don't, 
            and save money while helping the environment.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-10">
            <button className="bg-white text-blue-600 px-10 py-4 rounded-xl font-bold shadow-xl hover:scale-105 transition-transform flex items-center justify-center gap-2">
              Create Free Account <ArrowRight size={20}/>
            </button>
            <button className="border border-blue-400 text-white px-10 py-4 rounded-xl font-bold hover:bg-white/10 transition-all">
              Browse Items
            </button>
          </div>

          <div className="flex flex-wrap justify-center gap-8 text-blue-100 text-sm opacity-90">
            <div className="flex items-center gap-2"><Check size={18} className="text-white"/> No listing fees</div>
            <div className="flex items-center gap-2"><Check size={18} className="text-white"/> Campus verified</div>
            <div className="flex items-center gap-2"><Check size={18} className="text-white"/> Safe & secure</div>
            <div className="flex items-center gap-2"><Check size={18} className="text-white"/> Free to use</div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;