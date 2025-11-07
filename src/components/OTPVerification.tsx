
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Check, Smartphone } from 'lucide-react';
import { toast } from 'sonner';

interface OTPVerificationProps {
  phoneNumber: string;
  countryCode: string;
  onVerificationComplete: () => void;
  onCancel?: () => void;
}

export default function OTPVerification({ 
  phoneNumber, 
  countryCode, 
  onVerificationComplete,
  onCancel 
}: OTPVerificationProps) {
  const [verificationCode, setVerificationCode] = useState('');
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const handleVerify = () => {
    if (verificationCode.length === 6) {
      // In a real app, this would verify the OTP with a backend
      setShowSuccessDialog(true);
    } else {
      toast.error("Please enter the complete verification code");
    }
  };

  const handleComplete = () => {
    setShowSuccessDialog(false);
    onVerificationComplete();
  };

  return (
    <div className="space-y-8 py-6">
      <div className="flex justify-center">
        <Smartphone className="w-24 h-24 text-brahmin-primary" />
      </div>
      
      <div className="text-center space-y-2">
        <h2 className="text-xl font-medium">An SMS with the verification code has been sent to</h2>
        <p className="font-semibold">{countryCode} {phoneNumber}</p>
      </div>
      
      <div className="flex justify-center">
        <InputOTP
          maxLength={6}
          value={verificationCode}
          onChange={(value) => setVerificationCode(value)}
          className="justify-center"
        >
          <InputOTPGroup>
            {Array.from({ length: 6 }).map((_, index) => (
              <InputOTPSlot key={index} index={index} className="rounded-md border-2 focus:border-brahmin-primary h-14 w-14 text-xl" />
            ))}
          </InputOTPGroup>
        </InputOTP>
      </div>
      
      <Button 
        onClick={handleVerify}
        className="w-full bg-brahmin-primary hover:bg-brahmin-dark text-white py-6 text-lg"
      >
        Verify
      </Button>
      
      <div className="text-center space-y-4">
        <p className="text-gray-500">Didn't receive an OTP?</p>
        
        <div className="flex justify-center space-x-2">
          <Button variant="link" className="text-brahmin-primary">
            Resend OTP
          </Button>
          <span className="text-gray-500">|</span>
          <Button variant="link" className="text-brahmin-primary">
            Verify with Missed Call
          </Button>
        </div>
        
        {onCancel && (
          <Button variant="link" onClick={onCancel} className="text-gray-500">
            I'll do this later
          </Button>
        )}
      </div>
      
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex justify-center mb-2">
              <div className="bg-green-100 p-3 rounded-full">
                <Check className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <DialogTitle className="text-center text-xl">Congratulations!</DialogTitle>
          </DialogHeader>
          
          <div className="text-center space-y-4 py-4">
            <p>You have successfully verified your mobile number</p>
            
            <p>You can continue using your Brahmin Matrimony account now.</p>
          </div>
          
          <div className="flex justify-center mt-4">
            <Button className="bg-brahmin-primary hover:bg-brahmin-dark text-white px-8" onClick={handleComplete}>
              Continue
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
