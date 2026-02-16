import { memo } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Copy, Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useMobileAuth } from '../hooks/useMobileAuth';
import { toast } from 'sonner';

interface MobileLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileLoginModal = memo(function MobileLoginModal({ isOpen, onClose }: MobileLoginModalProps) {
  const [mobile, setMobile] = useState('');
  const [step, setStep] = useState<'mobile' | 'otp'>('mobile');
  const [otpInput, setOtpInput] = useState('');
  const [countdown, setCountdown] = useState(90);
  const [copied, setCopied] = useState(false);

  const {
    sendOTP,
    verifyOTP,
    generatedOtp,
    isLoading,
    error,
  } = useMobileAuth();

  useEffect(() => {
    if (step === 'otp' && countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [step, countdown]);

  useEffect(() => {
    if (!isOpen) {
      setStep('mobile');
      setMobile('');
      setOtpInput('');
      setCountdown(90);
      setCopied(false);
    }
  }, [isOpen]);

  const handleGenerateOtp = async () => {
    if (!mobile || mobile.length < 10) {
      toast.error('Please enter a valid mobile number');
      return;
    }

    const success = await sendOTP(mobile);
    if (success) {
      setStep('otp');
      setCountdown(90);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpInput || otpInput.length !== 6) {
      toast.error('Please enter the 6-digit OTP');
      return;
    }

    const success = await verifyOTP(mobile, otpInput);
    if (success) {
      toast.success('Login successful!');
      onClose();
    }
  };

  const handleCopyOtp = () => {
    if (generatedOtp) {
      navigator.clipboard.writeText(generatedOtp);
      setCopied(true);
      toast.success('OTP copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-brand-red to-brand-blue bg-clip-text text-transparent">
            {step === 'mobile' ? 'Login with Mobile' : 'Verify OTP'}
          </DialogTitle>
          <DialogDescription>
            {step === 'mobile'
              ? 'Enter your mobile number to receive an OTP'
              : 'Enter the OTP sent to your mobile number'}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="p-3 rounded-lg bg-red-primary/10 border border-red-primary/30 text-red-primary text-sm">
            {error}
          </div>
        )}

        {step === 'mobile' ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="mobile">Mobile Number</Label>
              <Input
                id="mobile"
                type="tel"
                placeholder="Enter 10-digit mobile number"
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                disabled={isLoading}
                className="border-brand-red/30 focus:border-brand-red"
              />
            </div>
            <Button
              onClick={handleGenerateOtp}
              disabled={isLoading || mobile.length < 10}
              className="w-full bg-brand-red hover:bg-brand-red/90"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating OTP...
                </>
              ) : (
                'Generate OTP'
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {generatedOtp && (
              <div className="p-4 rounded-lg bg-gradient-to-br from-brand-red/10 to-brand-blue/10 border-2 border-brand-red/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-muted-foreground">Your OTP:</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyOtp}
                    className="h-8 px-2 text-brand-red hover:text-brand-red/80"
                  >
                    {copied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <div className="text-3xl font-bold text-center tracking-widest bg-gradient-to-r from-brand-red to-brand-blue bg-clip-text text-transparent">
                  {generatedOtp}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="otp">Enter OTP</Label>
              <Input
                id="otp"
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
                disabled={isLoading}
                className="border-brand-blue/30 focus:border-brand-blue text-center text-2xl tracking-widest"
                maxLength={6}
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Time remaining: <span className="font-bold text-brand-red">{countdown}s</span>
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setStep('mobile');
                  setOtpInput('');
                }}
                className="text-brand-blue hover:text-brand-blue/80"
              >
                Change Number
              </Button>
            </div>

            <Button
              onClick={handleVerifyOtp}
              disabled={isLoading || otpInput.length !== 6 || countdown === 0}
              className="w-full bg-brand-blue hover:bg-brand-blue/90"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify & Login'
              )}
            </Button>

            {countdown === 0 && (
              <Button
                variant="outline"
                onClick={() => {
                  setStep('mobile');
                  setOtpInput('');
                }}
                className="w-full border-brand-red text-brand-red hover:bg-brand-red/10"
              >
                Resend OTP
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
});

export default MobileLoginModal;
