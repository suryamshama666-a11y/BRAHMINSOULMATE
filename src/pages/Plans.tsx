import React from 'react';
import Footer from '@/components/Footer';
import { SubscriptionCard } from '@/components/premium/SubscriptionCard';
import { PremiumFeatures } from '@/components/premium/PremiumFeatures';
import { useSubscription } from '@/hooks/useSubscription';
import SEO from '@/components/SEO';

const Plans = () => {
  const { subscriptionPlans, currentSubscription, subscribeToPlan } = useSubscription();

  const handleSelectPlan = async (planId: string) => {
    if (planId === 'free') {
      return;
    }
    
    await subscribeToPlan(planId);
  };

  return (
    <div className="min-h-screen flex flex-col bg-orange-50/30">
      <SEO 
        title="Matrimony Plans & Pricing"
        description="Explore our affordable Brahmin matrimony plans. From free basic access to premium features like video calls and advanced matching. Choose the best path for your soulmate search."
        keywords="matrimony plans, Brahmin marriage pricing, premium matrimonial services"
      />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 
            className="text-4xl font-serif font-bold mb-2"
            style={{ color: '#E30613' }}
          >
            Choose Your Plan
          </h1>
          <p className="text-gray-600 text-lg">Find the perfect plan for your matrimonial journey</p>
        </div>

        {/* Subscription Plans */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {subscriptionPlans.map((plan) => (
            <SubscriptionCard
              key={plan.id}
              plan={plan}
              currentPlan={currentSubscription?.subscription_type}
              onSelect={handleSelectPlan}
            />
          ))}
        </div>

        {/* Premium Features */}
        <PremiumFeatures />

        {/* FAQ Section */}
        <div className="mt-16 bg-white rounded-lg shadow-sm border border-red-100 p-8">
          <h3 
            className="text-2xl font-bold text-center mb-8"
            style={{ color: '#E30613' }}
          >
            Frequently Asked Questions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 
                className="font-semibold text-lg mb-2"
                style={{ color: '#E30613' }}
              >
                Can I upgrade my plan anytime?
              </h4>
              <p className="text-gray-600">Yes, you can upgrade your plan at any time. The new plan will take effect immediately.</p>
            </div>
            <div>
              <h4 
                className="font-semibold text-lg mb-2"
                style={{ color: '#E30613' }}
              >
                Is there a money-back guarantee?
              </h4>
              <p className="text-gray-600">We offer a 7-day money-back guarantee for all premium plans if you're not satisfied.</p>
            </div>
            <div>
              <h4 
                className="font-semibold text-lg mb-2"
                style={{ color: '#E30613' }}
              >
                What happens when my plan expires?
              </h4>
              <p className="text-gray-600">Your account will revert to the free plan. You can renew or upgrade at any time.</p>
            </div>
            <div>
              <h4 
                className="font-semibold text-lg mb-2"
                style={{ color: '#E30613' }}
              >
                Are there any hidden fees?
              </h4>
              <p className="text-gray-600">No hidden fees. The price you see is what you pay, including all taxes.</p>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Plans;
