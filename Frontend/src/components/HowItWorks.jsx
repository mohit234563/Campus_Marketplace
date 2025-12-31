import React from 'react';

const HowItWorks = () => {
  const steps = [
    { id: 1, title: 'Sign Up', text: 'Create your account with your campus email. Verify your student status in seconds.' },
    { id: 2, title: 'Browse or List', text: 'Search thousands of items or list your own with photos and descriptions in minutes.' },
    { id: 3, title: 'Connect & Exchange', text: 'Message sellers, arrange on-campus meetups, and complete safe transactions.' }
  ];

  return (
    <section className="py-20 bg-gray-50 text-center px-4">
      <h2 className="text-4xl font-bold mb-4">How It Works</h2>
      <p className="text-gray-500 mb-16">Three simple steps to start buying or selling on Campus Marketplace</p>
      <div className="flex flex-col md:flex-row justify-center gap-12 max-w-6xl mx-auto">
        {steps.map(step => (
          <div key={step.id} className="flex-1">
            <div className="w-14 h-14 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl mx-auto mb-6 shadow-lg shadow-blue-200">
              {step.id}
            </div>
            <h3 className="text-xl font-bold mb-4">{step.title}</h3>
            <p className="text-gray-500 text-sm leading-relaxed">{step.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default HowItWorks;