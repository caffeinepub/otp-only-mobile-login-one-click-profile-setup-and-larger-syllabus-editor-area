import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogOverlay } from '@/components/ui/dialog';
import { AlertCircle } from 'lucide-react';

interface SignupModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onSwitchToLogin: () => void;
}

export default function SignupModal({ open, onClose }: SignupModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogOverlay className="bg-black/60 backdrop-blur-sm" />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">Notice</DialogTitle>
          <DialogDescription className="text-center">
            This signup flow has been deprecated. Please use the mobile OTP login instead.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-3 p-4 bg-yellow-50 border-2 border-yellow-500/30 rounded-lg">
          <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
          <p className="text-sm text-yellow-800">
            This component is no longer used. All authentication now happens through the mobile OTP login modal.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
