
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CreditCard, Landmark, IndianRupee } from 'lucide-react';
import { toast } from 'sonner';

interface PaymentFormProps {
  planName: string;
  planPrice: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function PaymentForm({ planName, planPrice, onSuccess, onCancel }: PaymentFormProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      toast.success('Payment successful!');
      if (onSuccess) onSuccess();
    }, 2000);
  };
  
  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>Complete Your Payment</CardTitle>
        <CardDescription>
          You're subscribing to the {planName} plan at {(planPrice / 100).toLocaleString('en-IN')} INR.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="card">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="card">Credit Card</TabsTrigger>
            <TabsTrigger value="bank">Net Banking</TabsTrigger>
            <TabsTrigger value="upi">UPI</TabsTrigger>
          </TabsList>
          
          <TabsContent value="card">
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="cardName">Cardholder Name</Label>
                <Input id="cardName" placeholder="As it appears on the card" required />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cardNumber">Card Number</Label>
                <div className="relative">
                  <Input 
                    id="cardNumber" 
                    placeholder="1234 5678 9012 3456" 
                    required 
                    className="pl-10"
                    pattern="[0-9\s]{13,19}"
                  />
                  <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiry">Expiry Date</Label>
                  <Input id="expiry" placeholder="MM/YY" required pattern="(0[1-9]|1[0-2])\/[0-9]{2}" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvv">CVV</Label>
                  <Input id="cvv" placeholder="123" required pattern="[0-9]{3,4}" type="password" />
                </div>
              </div>
              
              <Button type="submit" className="w-full" disabled={isProcessing}>
                {isProcessing ? 'Processing...' : `Pay ₹${(planPrice / 100).toLocaleString('en-IN')}`}
              </Button>
            </form>
          </TabsContent>
          
          <TabsContent value="bank">
            <div className="mt-4 space-y-4">
              <RadioGroup defaultValue="sbi">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="sbi" id="sbi" />
                  <Label htmlFor="sbi" className="flex items-center">
                    <Landmark className="mr-2 h-4 w-4" />
                    State Bank of India
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="hdfc" id="hdfc" />
                  <Label htmlFor="hdfc" className="flex items-center">
                    <Landmark className="mr-2 h-4 w-4" />
                    HDFC Bank
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="icici" id="icici" />
                  <Label htmlFor="icici" className="flex items-center">
                    <Landmark className="mr-2 h-4 w-4" />
                    ICICI Bank
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="axis" id="axis" />
                  <Label htmlFor="axis" className="flex items-center">
                    <Landmark className="mr-2 h-4 w-4" />
                    Axis Bank
                  </Label>
                </div>
              </RadioGroup>
              
              <Button className="w-full" onClick={handleSubmit} disabled={isProcessing}>
                {isProcessing ? 'Processing...' : 'Continue to Bank'}
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="upi">
            <div className="mt-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="upiId">UPI ID</Label>
                <div className="relative">
                  <Input 
                    id="upiId" 
                    placeholder="yourname@upi" 
                    required 
                    className="pl-10"
                  />
                  <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                </div>
              </div>
              
              <Button className="w-full" onClick={handleSubmit} disabled={isProcessing}>
                {isProcessing ? 'Processing...' : 'Pay with UPI'}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <p className="text-sm text-muted-foreground">Secure payment powered by Brahmin Match</p>
      </CardFooter>
    </Card>
  );
}
