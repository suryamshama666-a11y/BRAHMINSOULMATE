import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CreditCard, Landmark, IndianRupee, Smartphone, ShieldCheck, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { backendCall } from '@/services/api/base';

interface PaymentFormProps {
  planName: string;
  planPrice: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const PAYMENT_GATEWAYS = [
  { id: 'razorpay', name: 'Razorpay', icon: '💳', description: 'Cards, UPI, Net Banking, Wallets', popular: true },
  { id: 'payu', name: 'PayU', icon: '🏦', description: 'All payment methods' },
  { id: 'cashfree', name: 'Cashfree', icon: '⚡', description: 'Fast settlements, UPI' },
  { id: 'paytm', name: 'Paytm', icon: '📱', description: 'Paytm Wallet, UPI, Cards' },
];

const INDIAN_BANKS = [
  { value: 'sbi', label: 'State Bank of India' },
  { value: 'hdfc', label: 'HDFC Bank' },
  { value: 'icici', label: 'ICICI Bank' },
  { value: 'axis', label: 'Axis Bank' },
  { value: 'kotak', label: 'Kotak Mahindra Bank' },
  { value: 'pnb', label: 'Punjab National Bank' },
  { value: 'bob', label: 'Bank of Baroda' },
  { value: 'canara', label: 'Canara Bank' },
];

const UPI_APPS = [
  { value: 'gpay', label: 'Google Pay', icon: '🔵' },
  { value: 'phonepe', label: 'PhonePe', icon: '🟣' },
  { value: 'paytm', label: 'Paytm', icon: '🔷' },
  { value: 'bhim', label: 'BHIM UPI', icon: '🟠' },
  { value: 'amazonpay', label: 'Amazon Pay', icon: '🟡' },
  { value: 'other', label: 'Other UPI App', icon: '📱' },
];

const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function PaymentForm({ planName, planPrice, onSuccess, onCancel }: PaymentFormProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedGateway, setSelectedGateway] = useState('razorpay');
  const [selectedBank, setSelectedBank] = useState('sbi');
  const [selectedUpiApp, setSelectedUpiApp] = useState('gpay');
  const [upiId, setUpiId] = useState('');
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  useEffect(() => {
    loadRazorpayScript()
      .then(setRazorpayLoaded)
      .catch((error) => {
        console.error('Failed to load Razorpay:', error);
        setRazorpayLoaded(false);
      });
  }, []);

  const formatPrice = (price: number) => {
    return (price).toLocaleString('en-IN');
  };

  const initializeRazorpay = async () => {
    if (!razorpayLoaded) {
      toast.error('Payment gateway is loading. Please try again.');
      return;
    }

    setIsProcessing(true);

    try {
      // Create order on backend using centralized helper
      const response = await backendCall<{ id: string; amount: number; currency: string }>('payments/create-order', {
        method: 'POST',
        body: JSON.stringify({
          plan_id: planName.toLowerCase().replace(' ', '_'),
          amount: planPrice,
          currency: 'INR'
        })
      });

      if (response.error) throw new Error(response.error.message);
      const orderData = response.data;
      if (!orderData?.id) throw new Error('Order creation failed');

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Brahmin Soulmate Connect',
        description: `${planName} Subscription`,
        order_id: orderData.id,
        handler: async function (handlerResponse: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) {
          try {
            // Verify payment on backend using centralized helper
            const verifyResponse = await backendCall<{ success: boolean }>('payments/verify', {
              method: 'POST',
              body: JSON.stringify({
                razorpay_order_id: handlerResponse.razorpay_order_id,
                razorpay_payment_id: handlerResponse.razorpay_payment_id,
                razorpay_signature: handlerResponse.razorpay_signature
              })
            });

            if (verifyResponse.data?.success) {
              toast.success('Payment verified and subscription activated!');
              if (onSuccess) onSuccess();
            } else {
              throw new Error(verifyResponse.error?.message || 'Verification failed');
            }
          } catch (error: any) {
            toast.error(`Verification error: ${error.message}`);
          } finally {
            setIsProcessing(false);
          }
        },
        prefill: {
          name: '',
          email: '',
          contact: '',
        },
        theme: {
          color: '#FF4500',
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
          },
        },
      };

      const rzp = new window.Razorpay!(options);
      rzp.on('payment.failed', function (response: { error: { description: string } }) {
        toast.error(`Payment failed: ${response.error.description}`);
        setIsProcessing(false);
      });
      rzp.open();
    } catch (error: any) {
      toast.error(`Failed to initialize payment: ${error.message}`);
      setIsProcessing(false);
    }
  };

  const handlePayUPayment = () => {
    setIsProcessing(true);
    toast.info('Redirecting to PayU...');
    setTimeout(() => {
      setIsProcessing(false);
      toast.success('Payment successful!');
      if (onSuccess) onSuccess();
    }, 2000);
  };

  const handleCashfreePayment = () => {
    setIsProcessing(true);
    toast.info('Redirecting to Cashfree...');
    setTimeout(() => {
      setIsProcessing(false);
      toast.success('Payment successful!');
      if (onSuccess) onSuccess();
    }, 2000);
  };

  const handlePaytmPayment = () => {
    setIsProcessing(true);
    toast.info('Redirecting to Paytm...');
    setTimeout(() => {
      setIsProcessing(false);
      toast.success('Payment successful!');
      if (onSuccess) onSuccess();
    }, 2000);
  };

  const handlePayment = () => {
    switch (selectedGateway) {
      case 'razorpay':
        initializeRazorpay();
        break;
      case 'payu':
        handlePayUPayment();
        break;
      case 'cashfree':
        handleCashfreePayment();
        break;
      case 'paytm':
        handlePaytmPayment();
        break;
      default:
        initializeRazorpay();
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 border-b">
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-green-600" />
          Secure Payment
        </CardTitle>
        <CardDescription>
          Subscribe to <span className="font-semibold text-orange-600">{planName}</span> plan at{' '}
          <span className="font-bold text-lg text-gray-900">₹{formatPrice(planPrice)}</span>
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-6">
        <div className="mb-6">
          <Label className="text-base font-medium mb-3 block">Select Payment Gateway</Label>
          <RadioGroup
            value={selectedGateway}
            onValueChange={setSelectedGateway}
            className="grid grid-cols-2 gap-3"
          >
            {PAYMENT_GATEWAYS.map((gateway) => (
              <div key={gateway.id} className="relative">
                <RadioGroupItem value={gateway.id} id={gateway.id} className="peer sr-only" />
                <Label
                  htmlFor={gateway.id}
                  className="flex flex-col p-4 border-2 rounded-lg cursor-pointer transition-all peer-checked:border-orange-500 peer-checked:bg-orange-50 hover:bg-gray-50"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{gateway.icon}</span>
                    <span className="font-medium">{gateway.name}</span>
                    {gateway.popular && (
                      <span className="text-xs bg-orange-500 text-white px-2 py-0.5 rounded-full">Popular</span>
                    )}
                  </div>
                  <span className="text-xs text-gray-500 mt-1">{gateway.description}</span>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <Tabs defaultValue="upi" className="mt-6">
          <TabsList className="grid w-full grid-cols-4 bg-orange-50">
            <TabsTrigger value="upi" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
              <Smartphone className="h-4 w-4 mr-1" />
              UPI
            </TabsTrigger>
            <TabsTrigger value="card" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
              <CreditCard className="h-4 w-4 mr-1" />
              Card
            </TabsTrigger>
            <TabsTrigger value="netbanking" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
              <Landmark className="h-4 w-4 mr-1" />
              Bank
            </TabsTrigger>
            <TabsTrigger value="wallet" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
              <Zap className="h-4 w-4 mr-1" />
              Wallet
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upi" className="mt-4 space-y-4">
            <div className="space-y-3">
              <Label className="font-medium">Choose UPI App</Label>
              <RadioGroup
                value={selectedUpiApp}
                onValueChange={setSelectedUpiApp}
                className="grid grid-cols-3 gap-2"
              >
                {UPI_APPS.map((app) => (
                  <div key={app.value} className="relative">
                    <RadioGroupItem value={app.value} id={`upi-${app.value}`} className="peer sr-only" />
                    <Label
                      htmlFor={`upi-${app.value}`}
                      className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-all peer-checked:border-orange-500 peer-checked:bg-orange-50 hover:bg-gray-50"
                    >
                      <span>{app.icon}</span>
                      <span className="text-sm">{app.label}</span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="upiId">Or Enter UPI ID</Label>
              <div className="relative">
                <Input
                  id="upiId"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="yourname@upi or mobile@paytm"
                  className="pl-10"
                />
                <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              </div>
              <p className="text-xs text-gray-500">Supports: Google Pay, PhonePe, Paytm, BHIM UPI, Amazon Pay</p>
            </div>
          </TabsContent>

          <TabsContent value="card" className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cardName">Cardholder Name</Label>
              <Input id="cardName" placeholder="Name as on card" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cardNumber">Card Number</Label>
              <div className="relative">
                <Input
                  id="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  className="pl-10"
                  maxLength={19}
                />
                <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              </div>
              <p className="text-xs text-gray-500">Accepts: Visa, Mastercard, RuPay, American Express</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiry">Expiry Date</Label>
                <Input id="expiry" placeholder="MM/YY" maxLength={5} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cvv">CVV</Label>
                <Input id="cvv" placeholder="123" type="password" maxLength={4} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="netbanking" className="mt-4">
            <div className="space-y-3">
              <Label className="font-medium">Select Your Bank</Label>
              <RadioGroup
                value={selectedBank}
                onValueChange={setSelectedBank}
                className="grid grid-cols-2 gap-2"
              >
                {INDIAN_BANKS.map((bank) => (
                  <div key={bank.value} className="relative">
                    <RadioGroupItem value={bank.value} id={`bank-${bank.value}`} className="peer sr-only" />
                    <Label
                      htmlFor={`bank-${bank.value}`}
                      className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-all peer-checked:border-orange-500 peer-checked:bg-orange-50 hover:bg-gray-50"
                    >
                      <Landmark className="h-4 w-4 text-gray-600" />
                      <span className="text-sm">{bank.label}</span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
              <p className="text-xs text-gray-500 mt-2">You will be redirected to your bank's secure page</p>
            </div>
          </TabsContent>

          <TabsContent value="wallet" className="mt-4">
            <div className="space-y-3">
              <Label className="font-medium">Select Wallet</Label>
              <RadioGroup defaultValue="paytm" className="grid grid-cols-2 gap-2">
                {[
                  { value: 'paytm', label: 'Paytm Wallet', icon: '🔷' },
                  { value: 'phonepe', label: 'PhonePe Wallet', icon: '🟣' },
                  { value: 'amazonpay', label: 'Amazon Pay Balance', icon: '🟡' },
                  { value: 'mobikwik', label: 'MobiKwik', icon: '🔵' },
                  { value: 'freecharge', label: 'Freecharge', icon: '🟢' },
                  { value: 'airtel', label: 'Airtel Money', icon: '🔴' },
                ].map((wallet) => (
                  <div key={wallet.value} className="relative">
                    <RadioGroupItem value={wallet.value} id={`wallet-${wallet.value}`} className="peer sr-only" />
                    <Label
                      htmlFor={`wallet-${wallet.value}`}
                      className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-all peer-checked:border-orange-500 peer-checked:bg-orange-50 hover:bg-gray-50"
                    >
                      <span>{wallet.icon}</span>
                      <span className="text-sm">{wallet.label}</span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span>₹{formatPrice(planPrice)}</span>
          </div>
          <div className="flex justify-between items-center text-sm mt-1">
            <span className="text-gray-600">GST (18%)</span>
            <span>₹{formatPrice(Math.round(planPrice * 0.18))}</span>
          </div>
          <div className="flex justify-between items-center font-bold text-lg mt-2 pt-2 border-t">
            <span>Total</span>
            <span className="text-orange-600">₹{formatPrice(Math.round(planPrice * 1.18))}</span>
          </div>
        </div>

        <Button
          onClick={handlePayment}
          className="w-full mt-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white py-6 text-lg"
          disabled={isProcessing}
        >
          {isProcessing ? (
            <>
              <span className="animate-spin mr-2">⏳</span>
              Processing...
            </>
          ) : (
            <>Pay ₹{formatPrice(Math.round(planPrice * 1.18))}</>
          )}
        </Button>
      </CardContent>

      <CardFooter className="flex flex-col space-y-3 bg-gray-50 border-t">
        <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <ShieldCheck className="h-4 w-4 text-green-600" />
            256-bit SSL Encrypted
          </span>
          <span>|</span>
          <span>PCI DSS Compliant</span>
          <span>|</span>
          <span>RBI Approved</span>
        </div>
        <div className="flex items-center justify-center gap-2">
          <img src="https://cdn.razorpay.com/static/assets/logo/upi.svg" alt="UPI" className="h-6" />
          <img src="https://cdn.razorpay.com/static/assets/logo/visa.svg" alt="Visa" className="h-4" />
          <img src="https://cdn.razorpay.com/static/assets/logo/mastercard.svg" alt="Mastercard" className="h-6" />
          <img src="https://cdn.razorpay.com/static/assets/logo/rupay.svg" alt="RuPay" className="h-6" />
        </div>
        <Button variant="ghost" onClick={onCancel} className="text-gray-500">
          Cancel Payment
        </Button>
      </CardFooter>
    </Card>
  );
}