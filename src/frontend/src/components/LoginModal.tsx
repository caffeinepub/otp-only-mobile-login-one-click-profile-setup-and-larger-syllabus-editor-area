import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Smartphone, AlertCircle, RefreshCw, Wifi } from 'lucide-react';
import { useMobileAuth } from '../hooks/useMobileAuth';
import { toast } from 'sonner';

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function LoginModal({ open, onClose, onSuccess }: LoginModalProps) {
  const { sendOTP, verifyOTP, isLoading, error, otpSent, generatedOtp, connectionStatus } = useMobileAuth();
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
      if (mobile.length === 10) {
        handleSendOTP();
      }
    } else {
      if (otp.length === 6) {
        handleVerifyOTP();
      }
    }
  };

  // Determine if we're in a connecting/authenticating state
  const isConnecting = connectionStatus === 'connecting' || connectionStatus === 'authenticating' || connectionStatus === 'initializing';
  
  // Only show service error for real connection failures
  const isServiceError = connectionStatus === 'error' || error?.includes('timed out') || error?.includes('Connection failed');

  // Get appropriate status message
  const getStatusMessage = () => {
    switch (connectionStatus) {
      case 'initializing':
        return 'Initializing...';
      case 'authenticating':
        return 'Completing authentication...';
      case 'connecting':
        return 'Connecting to service...';
      default:
        return null;
    }
  };

  const statusMessage = getStatusMessage();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-gradient-to-br from-accent-violet/20 to-accent-pink/20 rounded-full">
              <Smartphone className="h-10 w-10 text-accent-violet" />
            </div>
          </div>
          <DialogTitle className="text-center text-2xl font-bold bg-gradient-to-r from-accent-violet to-accent-pink bg-clip-text text-transparent">
            Welcome
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            Enter your mobile number to continue
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Connection status indicator */}
          {statusMessage && (
            <div className="p-4 bg-accent-violet/10 border border-accent-violet/30 rounded-lg">
              <div className="flex items-center gap-3">
                <Loader2 className="h-5 w-5 text-accent-violet animate-spin flex-shrink-0" />
                <p className="text-sm text-accent-violet font-medium">
                  {statusMessage}
                </p>
              </div>
            </div>
          )}

          {/* Error banner - only for real errors */}
          {error && !isConnecting && (
            <div className="p-4 bg-accent-red/10 border border-accent-red/30 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-accent-red flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-accent-red font-medium">{error}</p>
                  {isServiceError && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Please check your connection and try again.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {!otpSent ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="mobile" className="text-base font-semibold text-accent-violet">
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
                    className="pl-20 text-base h-12 border-2 focus:border-accent-violet"
                    disabled={isLoading || isConnecting}
                    maxLength={10}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Enter your 10-digit mobile number
                </p>
              </div>

              <Button
                onClick={handleSendOTP}
                disabled={isLoading || isConnecting || mobile.length !== 10}
                className="w-full h-12 text-base font-bold bg-gradient-to-r from-accent-violet to-accent-pink hover:from-accent-violet/90 hover:to-accent-pink/90 text-white shadow-accent-violet"
              >
                {isLoading || isConnecting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    {statusMessage || 'Processing...'}
                  </>
                ) : (
                  'Continue'
                )}
              </Button>

              {isServiceError && !isConnecting && (
                <Button
                  onClick={handleRetry}
                  disabled={isLoading || isConnecting || mobile.length !== 10}
                  variant="outline"
                  className="w-full h-12 text-base font-semibold border-2 border-accent-violet text-accent-violet hover:bg-accent-violet/10"
                >
                  <RefreshCw className="mr-2 h-5 w-5" />
                  Retry
                </Button>
              )}
            </>
          ) : (
            <>
              {generatedOtp && (
                <div className="p-4 bg-gradient-to-br from-accent-violet/10 to-accent-pink/10 border-2 border-accent-violet rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2 text-center">Your OTP Code:</p>
                  <p className="text-3xl font-bold text-accent-violet text-center tracking-wider">
                    {generatedOtp}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    {countdown > 0 ? `Valid for ${countdown} seconds` : 'OTP expired'}
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="otp" className="text-base font-semibold text-accent-violet">
                  Enter OTP
                </Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="text-center text-2xl tracking-widest h-14 border-2 focus:border-accent-violet font-bold"
                  disabled={isLoading || isConnecting}
                  maxLength={6}
                />
                <p className="text-xs text-muted-foreground text-center">
                  Enter the 6-digit OTP shown above
                </p>
              </div>

              <Button
                onClick={handleVerifyOTP}
                disabled={isLoading || isConnecting || otp.length !== 6 || countdown === 0}
                className="w-full h-12 text-base font-bold bg-gradient-to-r from-accent-violet to-accent-pink hover:from-accent-violet/90 hover:to-accent-pink/90 text-white shadow-accent-violet"
              >
                {isLoading || isConnecting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    {statusMessage || 'Verifying...'}
                  </>
                ) : (
                  'Verify OTP'
                )}
              </Button>

              {isServiceError && !isConnecting && (
                <Button
                  onClick={handleRetry}
                  disabled={isLoading || isConnecting || otp.length !== 6}
                  variant="outline"
                  className="w-full h-12 text-base font-semibold border-2 border-accent-violet text-accent-violet hover:bg-accent-violet/10"
                >
                  <RefreshCw className="mr-2 h-5 w-5" />
                  Retry
                </Button>
              )}

              <Button
                onClick={() => {
                  setOtp('');
                  setMobile('');
                  setCountdown(0);
                }}
                variant="ghost"
                className="w-full text-sm text-muted-foreground hover:text-accent-violet"
                disabled={isLoading || isConnecting}
              >
                Change mobile number
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
