import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Star, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { PaymentService, PAYMENT_PLANS, PaymentPlan } from '@/services/paymentService';
import { useNavigate } from 'react-router-dom';

interface PaymentPlansProps {
  category?: 'all' | 'consultations' | 'matching' | 'charts';
}

export default function PaymentPlans({ category = 'all' }: PaymentPlansProps) {
  const { user, isAuthenticated } = useAuth();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const navigate = useNavigate();
  
  const handleSubscribe = async (plan: PaymentPlan) => {
    if (!isAuthenticated || !user) {
      toast.error("Please login to subscribe to a plan");
      navigate('/login');
      return;
    }
    
    setLoadingPlan(plan.id);
    try {
      // 1. Create order on backend
      const orderData = await PaymentService.createOrder(plan.id, user.id);
      
      // 2. Open Razorpay checkout
      await PaymentService.openCheckout(
        orderData,
        async (response) => {
          // Success Handler
          const verified = await PaymentService.verifyPayment(
            response.razorpay_order_id,
            response.razorpay_payment_id,
            response.razorpay_signature
          );
          
          if (verified) {
            toast.success(`Welcome to ${plan.name}! Your subscription is now active.`);
            navigate('/dashboard');
          } else {
            toast.error("Payment verification failed. Please contact support.");
          }
          setLoadingPlan(null);
        },
        (error) => {
          // Error Handler
          console.error('Payment error:', error);
          toast.error(error.message || "Payment failed or cancelled");
          setLoadingPlan(null);
        }
      );
    } catch (error: any) {
      console.error('Subscription error:', error);
      toast.error(error.message || "Failed to initiate payment");
      setLoadingPlan(null);
    }
  };

  const formatPrice = (priceInPaise: number) => {
    return `₹${(priceInPaise / 100).toLocaleString('en-IN')}`;
  };

  // Filter plans based on category if needed
  // For now, all plans are shown as they all include features from all categories
  const displayedPlans = PAYMENT_PLANS;

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {displayedPlans.map((plan) => (
          <Card 
            key={plan.id} 
            className={`flex flex-col transition-all duration-300 hover:shadow-xl ${
              plan.popular 
                ? 'border-brahmin-primary ring-2 ring-brahmin-primary ring-opacity-20 scale-105 z-10' 
                : 'hover:border-brahmin-primary/50'
            }`}
          >
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl mb-1 font-bold text-brahmin-dark">{plan.name}</CardTitle>
                  <CardDescription className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {plan.duration === 30 ? 'Monthly' : plan.duration === 90 ? 'Quarterly' : 'Yearly'}
                  </CardDescription>
                </div>
                {plan.popular && (
                  <div className="inline-flex bg-brahmin-primary text-white text-[10px] font-bold px-2 py-1 rounded-full items-center uppercase tracking-tighter">
                    <Star className="w-3 h-3 mr-1 fill-current" />
                    Best Value
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="pb-0 flex-grow">
              <div className="mb-6 mt-2">
                <span className="text-4xl font-black text-brahmin-dark">{formatPrice(plan.price)}</span>
                <span className="text-sm text-muted-foreground ml-1">
                  /{plan.duration === 365 ? 'yr' : 'mo'}
                </span>
              </div>
              
              <div className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-start group">
                    <div className="rounded-full p-0.5 mr-2 mt-0.5 bg-green-100 text-green-600 transition-colors group-hover:bg-green-600 group-hover:text-white">
                      <Check className="h-3 w-3" />
                    </div>
                    <span className="text-sm text-gray-700 leading-tight">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="pt-4 mt-auto">
              <Button 
                className={`w-full font-bold h-12 transition-all ${
                  plan.popular 
                    ? 'bg-brahmin-primary hover:bg-brahmin-dark text-white shadow-lg hover:shadow-brahmin-primary/30' 
                    : 'bg-white border-2 border-brahmin-primary text-brahmin-primary hover:bg-brahmin-primary hover:text-white'
                }`}
                onClick={() => handleSubscribe(plan)}
                disabled={loadingPlan !== null}
              >
                {loadingPlan === plan.id ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Choose Plan'
                )}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
