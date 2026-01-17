import React, { useState } from 'react';

const PricingPlans = () => {
  const [isAnnual, setIsAnnual] = useState(false);
  const [openFAQ, setOpenFAQ] = useState(null);

  const plans = [
    {
      id: 'starter',
      name: "Starter",
      subtitle: "Perfect for individuals and small teams",
      monthlyPrice: 29,
      annualPrice: 22,
      features: [
        { text: "Up to 1,000 leads per month", available: true },
        { text: "Basic file processing", available: true },
        { text: "5GB cloud backup", available: true },
        { text: "Email support", available: true },
        { text: "Basic analytics", available: true },
        { text: "GLYTCH AI assistant", available: false },
        { text: "Advanced integrations", available: false },
        { text: "Priority support", available: false }
      ],
      featured: false,
      buttonStyle: "secondary"
    },
    {
      id: 'professional',
      name: "Professional",
      subtitle: "Ideal for growing businesses",
      monthlyPrice: 79,
      annualPrice: 59,
      features: [
        { text: "Up to 10,000 leads per month", available: true },
        { text: "Advanced file processing", available: true },
        { text: "50GB cloud backup", available: true },
        { text: "Priority email & chat support", available: true },
        { text: "Advanced analytics", available: true },
        { text: "GLYTCH AI assistant", available: true },
        { text: "Basic integrations", available: true },
        { text: "Team collaboration", available: true }
      ],
      featured: true,
      buttonStyle: "primary"
    },
    {
      id: 'business',
      name: "Business",
      subtitle: "For established companies",
      monthlyPrice: 149,
      annualPrice: 112,
      features: [
        { text: "Up to 50,000 leads per month", available: true },
        { text: "Premium file processing", available: true },
        { text: "500GB cloud backup", available: true },
        { text: "Phone & priority support", available: true },
        { text: "Custom analytics dashboard", available: true },
        { text: "Advanced GLYTCH AI", available: true },
        { text: "Advanced integrations", available: true },
        { text: "White-label options", available: true }
      ],
      featured: false,
      buttonStyle: "secondary"
    }
  ];

  const enterpriseFeatures = [
    {
      icon: "🔧",
      title: "Custom Integrations",
      description: "Seamless integration with your existing systems"
    },
    {
      icon: "🛡️",
      title: "Advanced Security",
      description: "Enterprise-grade security and compliance"
    },
    {
      icon: "👥",
      title: "Dedicated Support",
      description: "24/7 priority support with dedicated team"
    },
    {
      icon: "📊",
      title: "Custom Analytics",
      description: "Advanced reporting and business intelligence"
    }
  ];

  const faqs = [
    {
      question: "Can I upgrade or downgrade my plan at any time?",
      answer: "Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any billing adjustments."
    },
    {
      question: "Is there a free trial available?",
      answer: "We offer a 14-day free trial for all paid plans. No credit card required to start your trial."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards, PayPal, and bank transfers. Enterprise customers can also pay via invoice."
    },
    {
      question: "Do you offer refunds?",
      answer: "Yes, we offer a 30-day money-back guarantee for all paid plans. Contact support if you're not satisfied."
    }
  ];

  const selectPlan = (plan) => {
    const price = isAnnual ? plan.annualPrice : plan.monthlyPrice;
    const billing = isAnnual ? 'annual' : 'monthly';

    // Send to GHL for lead capture
    if (window.parent !== window) {
      window.parent.postMessage({
        type: 'ghl-plan-selection',
        plan: plan.name,
        price: price,
        billing: billing,
        timestamp: new Date().toISOString()
      }, '*');
    }

    alert(`Selected ${plan.name} plan at $${price}/${billing}. Redirecting to checkout...`);
  };

  const contactSales = () => {
    // Send to GHL for enterprise lead
    if (window.parent !== window) {
      window.parent.postMessage({
        type: 'ghl-enterprise-inquiry',
        timestamp: new Date().toISOString()
      }, '*');
    }

    alert('Connecting you with our sales team...');
  };

  const toggleFAQ = (index) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 text-white">
      <div className="max-w-7xl mx-auto px-5 py-8">
        
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-3xl flex items-center justify-center text-3xl animate-bounce">
              💰
            </div>
            <h1 className="text-4xl font-bold">Cloud Connect Pricing</h1>
          </div>
          <p className="text-xl opacity-90">Choose the Perfect Plan for Your Business Needs</p>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center items-center gap-6 mb-10">
          <span className="text-lg font-medium">Monthly</span>
          <div 
            onClick={() => setIsAnnual(!isAnnual)}
            className={`relative w-20 h-10 rounded-full cursor-pointer transition-all duration-300 ${
              isAnnual ? 'bg-gradient-to-r from-yellow-400 to-orange-500' : 'bg-white/20'
            }`}
          >
            <div 
              className={`absolute top-1 w-8 h-8 bg-white rounded-full shadow-lg transition-all duration-300 ${
                isAnnual ? 'left-11' : 'left-1'
              }`}
            />
          </div>
          <span className="text-lg font-medium">Annual</span>
          {isAnnual && (
            <span className="bg-gradient-to-r from-red-500 to-pink-500 px-4 py-2 rounded-full text-sm font-semibold">
              Save 25%
            </span>
          )}
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {plans.map((plan) => {
            const price = isAnnual ? plan.annualPrice : plan.monthlyPrice;
            const oldPrice = isAnnual ? plan.monthlyPrice : null;
            
            return (
              <div 
                key={plan.id}
                className={`relative bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 text-center transition-all duration-300 hover:transform hover:-translate-y-3 hover:shadow-2xl ${
                  plan.featured ? 'border-2 border-yellow-400 bg-yellow-400/10 scale-105' : ''
                }`}
              >
                {plan.featured && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-6 py-2 rounded-full text-sm font-semibold">
                    Most Popular
                  </div>
                )}
                
                <h3 className="text-2xl font-bold mb-2 text-yellow-400">{plan.name}</h3>
                <p className="text-sm opacity-80 mb-6">{plan.subtitle}</p>
                
                <div className="mb-6">
                  <div className="relative">
                    <span className="text-5xl font-bold">${price}</span>
                    {oldPrice && (
                      <span className="absolute -top-2 -right-4 text-lg opacity-60 line-through">
                        ${oldPrice}
                      </span>
                    )}
                  </div>
                  <p className="text-sm opacity-80 mt-2">
                    per {isAnnual ? 'month, billed annually' : 'month'}
                  </p>
                </div>

                <ul className="space-y-4 mb-8 text-left">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <div 
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                          feature.available 
                            ? 'bg-green-500 text-white' 
                            : 'bg-gray-500/50 text-gray-400'
                        }`}
                      >
                        {feature.available ? '✓' : '✗'}
                      </div>
                      <span className="text-sm">{feature.text}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => selectPlan(plan)}
                  className={`w-full py-4 rounded-full font-semibold transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-lg ${
                    plan.buttonStyle === 'primary'
                      ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black'
                      : 'bg-white/20 border border-white/30 hover:bg-white/30'
                  }`}
                >
                  {plan.featured ? 'Start Free Trial' : 'Get Started'}
                </button>
              </div>
            );
          })}
        </div>

        {/* Enterprise Section */}
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-10 mb-16 border border-white/20 text-center">
          <h2 className="text-3xl font-bold mb-4 text-yellow-400">🏢 Enterprise Solutions</h2>
          <p className="text-lg opacity-90 mb-8">Tailored solutions for large organizations with custom requirements</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {enterpriseFeatures.map((feature, index) => (
              <div key={index} className="bg-white/10 p-6 rounded-2xl">
                <div className="text-3xl mb-3">{feature.icon}</div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm opacity-80">{feature.description}</p>
              </div>
            ))}
          </div>
          
          <button
            onClick={contactSales}
            className="px-10 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full font-semibold transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-lg"
          >
            Contact Sales Team
          </button>
        </div>

        {/* FAQ Section */}
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-10 border border-white/20">
          <h2 className="text-3xl font-bold text-center mb-8 text-yellow-400">❓ Frequently Asked Questions</h2>
          
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="border-b border-white/20 pb-4">
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full text-left flex justify-between items-center py-2 font-semibold hover:text-yellow-400 transition-colors"
                >
                  <span>{faq.question}</span>
                  <span className={`transform transition-transform duration-300 ${
                    openFAQ === index ? 'rotate-180' : ''
                  }`}>
                    ▼
                  </span>
                </button>
                {openFAQ === index && (
                  <div className="mt-3 text-sm opacity-90 leading-relaxed">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPlans;