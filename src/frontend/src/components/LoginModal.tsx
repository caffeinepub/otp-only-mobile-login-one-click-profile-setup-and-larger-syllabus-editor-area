import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Smartphone, AlertCircle, RefreshCw } from 'lucide-react';
import { useMobileAuth } from '../hooks/useMobileAuth';
import { toast } from 'sonner';

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function LoginModal({ open, onClose, onSuccess }: LoginModalProps) {
  const { sendOTP, verifyOTP, isLoading, error, otpSent, generatedOtp, isAwaitingII } = useMobileAuth();
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  useEffect(() => {
    if (!open) {
      setMobile('');
      setOtp('');
      setCountdown(0);
    }
  }, [open]);

  const handleSendOTP = async () => {
    if (mobile.length !== 10) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }

    const success = await sendOTP(mobile);
    if (success) {
      setCountdown(90);
      toast.success('OTP sent successfully!');
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    const success = await verifyOTP(mobile, otp);
    if (success) {
      toast.success('Welcome to Exam Xpresss!');
      onSuccess();
    }
  };

  const handleRetry = () => {
    if (!otpSent) {
      // Retry generate OTP
      if (mobile.length === 10) {
        handleSendOTP();
      }
    } else {
      // Retry verify OTP
      if (otp.length === 6) {
        handleVerifyOTP();
      }
    }
  };

  const isServiceError = error?.includes('Service temporarily unavailable') || error?.includes('SERVICE_UNAVAILABLE');

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-blue-accent/10 rounded-full">
              <Smartphone className="h-10 w-10 text-blue-accent" />
            </div>
          </div>
          <DialogTitle className="text-center text-2xl font-bold text-blue-accent">
            Welcome
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            Enter your mobile number to continue
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {error && (
            <div className="p-4 bg-red-primary/10 border border-red-primary/30 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-primary flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-red-primary font-medium">{error}</p>
                  {isServiceError && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Please refresh the page and try again in a moment.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {isAwaitingII && (
            <div className="p-4 bg-blue-accent/10 border border-blue-accent/30 rounded-lg">
              <div className="flex items-center gap-3">
                <Loader2 className="h-5 w-5 text-blue-accent animate-spin" />
                <p className="text-sm text-blue-accent font-medium">
                  Completing authentication...
                </p>
              </div>
            </div>
          )}

          {!otpSent ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="mobile" className="text-base font-semibold text-blue-accent">
                  Mobile Number
                </Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2 text-muted-foreground">
                    <Smartphone className="h-4 w-4" />
                    <span className="text-sm font-medium">+91</span>
                  </div>
                  <Input
                    id="mobile"
                    type="tel"
                    placeholder="9455134315"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    className="pl-20 text-base h-12 border-2 focus:border-blue-accent"
                    disabled={isLoading}
                    maxLength={10}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Enter your 10-digit mobile number
                </p>
              </div>

              <Button
                onClick={handleSendOTP}
                disabled={isLoading || mobile.length !== 10}
                className="w-full h-12 text-base font-bold bg-red-primary hover:bg-red-dark shadow-premium-lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Sending OTP...
                  </>
                ) : (
                  'Continue'
                )}
              </Button>

              {isServiceError && (
                <Button
                  onClick={handleRetry}
                  disabled={isLoading || mobile.length !== 10}
                  variant="outline"
                  className="w-full h-12 text-base font-semibold border-2 border-blue-accent text-blue-accent hover:bg-blue-accent/10"
                >
                  <RefreshCw className="mr-2 h-5 w-5" />
                  Retry
                </Button>
              )}
            </>
          ) : (
            <>
              {generatedOtp && (
                <div className="p-4 bg-blue-accent/10 border-2 border-blue-accent rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2 text-center">Your OTP Code:</p>
                  <p className="text-3xl font-bold text-blue-accent text-center tracking-wider">
                    {generatedOtp}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    {countdown > 0 ? `Valid for ${countdown} seconds` : 'OTP expired'}
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="otp" className="text-base font-semibold text-blue-accent">
                  Enter OTP
                </Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="text-center text-2xl tracking-widest font-bold h-14 border-2 focus:border-blue-accent"
                  disabled={isLoading}
                  maxLength={6}
                />
              </div>

              <Button
                onClick={handleVerifyOTP}
                disabled={isLoading || otp.length !== 6}
                className="w-full h-12 text-base font-bold bg-red-primary hover:bg-red-dark shadow-premium-lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify & Continue'
                )}
              </Button>

              {isServiceError && (
                <Button
                  onClick={handleRetry}
                  disabled={isLoading || otp.length !== 6}
                  variant="outline"
                  className="w-full h-12 text-base font-semibold border-2 border-blue-accent text-blue-accent hover:bg-blue-accent/10"
                >
                  <RefreshCw className="mr-2 h-5 w-5" />
                  Retry
                </Button>
              )}

              <div className="flex items-center justify-between text-sm">
                <button
                  onClick={() => {
                    setOtp('');
                    setMobile('');
                  }}
                  className="text-blue-accent hover:underline font-medium"
                  disabled={isLoading}
                >
                  Change Number
                </button>
                {countdown === 0 && (
                  <button
                    onClick={handleSendOTP}
                    className="text-blue-accent hover:underline font-medium"
                    disabled={isLoading}
                  >
                    Resend OTP
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
