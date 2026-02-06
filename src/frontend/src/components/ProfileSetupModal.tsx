import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Upload, User, Mail, Smartphone, AlertCircle } from 'lucide-react';
import { useUpdateProfile } from '../hooks/useQueries';
import { ExternalBlob } from '../backend';
import { toast } from 'sonner';

export default function ProfileSetupModal() {
  const updateProfile = useUpdateProfile();
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [gmail, setGmail] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState(0);

  // Pre-fill mobile from OTP session if available
  useEffect(() => {
    try {
      const otpSession = localStorage.getItem('otp_session');
      if (otpSession) {
        const session = JSON.parse(otpSession);
        if (session.mobile) {
          setMobile(session.mobile);
        }
      }
    } catch (error) {
      console.error('Failed to load OTP session:', error);
    }
  }, []);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error('Please enter your name');
      return;
    }

    if (!mobile.trim() || mobile.length !== 10) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }

    if (gmail.trim() && !gmail.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    try {
      let photoBlob: ExternalBlob;

      if (photoFile) {
        // Upload user-selected photo
        const arrayBuffer = await photoFile.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        photoBlob = ExternalBlob.fromBytes(uint8Array).withUploadProgress((percentage) => {
          setUploadProgress(percentage);
        });
      } else {
        // Use default avatar
        photoBlob = ExternalBlob.fromURL('/assets/default-avatar.svg');
      }

      await updateProfile.mutateAsync({
        name: name.trim(),
        photo: photoBlob,
        mobile: mobile.trim() || null,
        gmail: gmail.trim() || null,
      });

      toast.success('Profile setup complete!');
    } catch (error: any) {
      console.error('Profile setup error:', error);
      toast.error(error.message || 'Failed to setup profile. Please try again.');
    }
  };

  const isSubmitting = updateProfile.isPending;

  return (
    <Dialog open={true} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-blue-accent/10 rounded-full">
              <User className="h-10 w-10 text-blue-accent" />
            </div>
          </div>
          <DialogTitle className="text-center text-2xl font-bold text-blue-accent">
            Complete Your Profile
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            Please provide your details to continue
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {updateProfile.isError && (
            <div className="p-4 bg-red-primary/10 border border-red-primary/30 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-primary flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-primary font-medium">
                  {updateProfile.error?.message || 'Failed to setup profile'}
                </p>
              </div>
            </div>
          )}

          {/* Profile Photo */}
          <div className="flex flex-col items-center gap-4">
            <Avatar className="h-24 w-24 ring-4 ring-blue-accent/20">
              <AvatarImage src={photoPreview || '/assets/default-avatar.svg'} />
              <AvatarFallback className="bg-blue-accent text-white text-2xl font-bold">
                {name.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <Label htmlFor="photo-upload" className="cursor-pointer">
              <div className="flex items-center gap-2 px-4 py-2 bg-blue-accent/10 hover:bg-blue-accent/20 rounded-lg transition-colors">
                <Upload className="h-4 w-4 text-blue-accent" />
                <span className="text-sm font-medium text-blue-accent">Upload Photo</span>
              </div>
              <Input
                id="photo-upload"
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
                disabled={isSubmitting}
              />
            </Label>
            {uploadProgress > 0 && uploadProgress < 100 && (
              <p className="text-xs text-muted-foreground">Uploading: {uploadProgress}%</p>
            )}
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-base font-semibold text-blue-accent">
              Full Name *
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pl-10 text-base h-12 border-2 focus:border-blue-accent"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Mobile */}
          <div className="space-y-2">
            <Label htmlFor="mobile" className="text-base font-semibold text-blue-accent">
              Mobile Number *
            </Label>
            <div className="relative">
              <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="mobile"
                type="tel"
                placeholder="9455134315"
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                className="pl-10 text-base h-12 border-2 focus:border-blue-accent"
                disabled={isSubmitting}
                maxLength={10}
              />
            </div>
          </div>

          {/* Gmail */}
          <div className="space-y-2">
            <Label htmlFor="gmail" className="text-base font-semibold text-blue-accent">
              Email (Optional)
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="gmail"
                type="email"
                placeholder="your.email@gmail.com"
                value={gmail}
                onChange={(e) => setGmail(e.target.value)}
                className="pl-10 text-base h-12 border-2 focus:border-blue-accent"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !name.trim() || mobile.length !== 10}
            className="w-full h-12 text-base font-bold bg-red-primary hover:bg-red-dark shadow-premium-lg"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Setting up...
              </>
            ) : (
              'Complete Setup'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
