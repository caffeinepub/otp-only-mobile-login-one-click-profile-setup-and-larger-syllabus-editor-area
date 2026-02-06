import { useState, useCallback, useEffect, useMemo } from 'react';
import { useGetCallerUserProfile, useSaveCallerUserProfile } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { Loader2, Upload, Save, User } from 'lucide-react';
import { ExternalBlob } from '../backend';

export default function ProfilePage() {
  const { data: userProfile, isLoading } = useGetCallerUserProfile();
  const saveProfile = useSaveCallerUserProfile();

  const [name, setName] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [mobile, setMobile] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    if (userProfile) {
      setName(userProfile.name);
      setPhotoPreview(userProfile.photo.getDirectURL());
      setMobile(userProfile.mobile || '');
      setPhotoFile(null);
    }
  }, [userProfile]);

  const hasChanges = useMemo(() => {
    if (!userProfile) return false;
    return (
      name !== userProfile.name ||
      mobile !== (userProfile.mobile || '') ||
      photoFile !== null
    );
  }, [name, mobile, photoFile, userProfile]);

  const handlePhotoChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Photo size must be less than 5MB');
        return;
      }
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const validateMobile = useCallback((value: string): boolean => {
    if (!value) return true;
    const mobileRegex = /^[6-9]\d{9}$/;
    return mobileRegex.test(value);
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Please enter your name');
      return;
    }

    if (mobile && !validateMobile(mobile)) {
      toast.error('Please enter a valid mobile number (10 digits)');
      return;
    }

    try {
      let photoBlob: ExternalBlob;

      if (photoFile) {
        const photoBytes = await photoFile.arrayBuffer();
        photoBlob = ExternalBlob.fromBytes(new Uint8Array(photoBytes)).withUploadProgress((percentage) => {
          setUploadProgress(percentage);
        });
      } else if (userProfile) {
        photoBlob = userProfile.photo;
      } else {
        toast.error('Photo is required');
        return;
      }

      await saveProfile.mutateAsync({
        name: name.trim(),
        photo: photoBlob,
        mobile: mobile.trim() || undefined,
        gmail: userProfile?.gmail,
        signupTimestamp: userProfile?.signupTimestamp,
        profileComplete: true,
      });

      toast.success('Profile updated successfully!');
      setUploadProgress(0);
      setPhotoFile(null);
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('Failed to update profile. Please try again.');
      setUploadProgress(0);
    }
  }, [name, mobile, photoFile, userProfile, validateMobile, saveProfile]);

  const handleReset = useCallback(() => {
    if (userProfile) {
      setName(userProfile.name);
      setPhotoPreview(userProfile.photo.getDirectURL());
      setMobile(userProfile.mobile || '');
      setPhotoFile(null);
      setUploadProgress(0);
    }
  }, [userProfile]);

  const mobileError = useMemo(() => Boolean(mobile && !validateMobile(mobile)), [mobile, validateMobile]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-red-primary" />
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">Profile not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-5xl font-bold mb-4 flex items-center gap-4 text-red-primary drop-shadow-md">
          <User className="h-12 w-12" />
          Edit Profile
        </h1>
        <p className="text-xl text-muted-foreground font-medium">Update your personal information</p>
      </div>

      <Card className="border-4 border-red-primary/30 shadow-premium-xl">
        <CardHeader className="bg-gradient-to-br from-red-50 to-red-100/30 border-b-2 border-red-primary/20">
          <CardTitle className="text-3xl text-red-primary font-bold">Personal Information</CardTitle>
          <CardDescription className="text-lg font-medium">Update your name, photo, and mobile number</CardDescription>
        </CardHeader>
        <CardContent className="pt-10">
          <form onSubmit={handleSubmit} className="space-y-10">
            <div className="flex flex-col items-center gap-7 p-8 bg-gradient-to-br from-red-50 to-red-100/50 rounded-2xl border-3 border-red-primary/30 shadow-premium-lg">
              <Avatar className="h-44 w-44 ring-4 ring-red-primary shadow-premium-xl">
                {photoPreview ? (
                  <AvatarImage src={photoPreview} alt="Profile" />
                ) : (
                  <AvatarFallback className="text-6xl bg-red-100 text-red-primary font-bold">{name.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                )}
              </Avatar>
              <Label htmlFor="photo" className="cursor-pointer">
                <div className="flex items-center gap-3 px-8 py-4 bg-red-primary text-white rounded-xl hover:bg-red-dark transition-all shadow-premium-lg hover:shadow-premium-xl hover:scale-105 font-bold text-lg">
                  <Upload className="h-6 w-6" />
                  Upload New Photo
                </div>
                <Input
                  id="photo"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                  disabled={saveProfile.isPending}
                />
              </Label>
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="w-full">
                  <div className="flex items-center justify-between text-base text-muted-foreground mb-3">
                    <span className="font-bold">Uploading...</span>
                    <span className="font-bold text-red-primary text-lg">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-red-100 rounded-full h-4 overflow-hidden shadow-inner">
                    <div 
                      className="bg-gradient-to-r from-red-primary to-red-light h-4 rounded-full transition-all duration-300 shadow-md"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <Label htmlFor="name" className="text-xl font-bold text-red-primary">Full Name *</Label>
              <Input
                id="name"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={saveProfile.isPending}
                className="h-14 text-lg border-3 border-red-primary/30 focus:border-red-primary transition-all shadow-md focus:shadow-premium-lg"
              />
            </div>

            <div className="space-y-4">
              <Label htmlFor="mobile" className="text-xl font-bold text-red-primary">Mobile Number (Optional)</Label>
              <Input
                id="mobile"
                type="tel"
                placeholder="10-digit mobile number"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                disabled={saveProfile.isPending}
                maxLength={10}
                className="h-14 text-lg border-3 border-red-primary/30 focus:border-red-primary transition-all shadow-md focus:shadow-premium-lg"
              />
              {mobileError && (
                <p className="text-base text-red-primary font-bold">Please enter a valid 10-digit mobile number</p>
              )}
            </div>

            <div className="flex gap-5 pt-6">
              <Button 
                type="submit" 
                className="flex-1 h-16 text-xl font-bold shadow-premium-xl hover:shadow-premium-xl transition-all hover:scale-105 bg-red-primary hover:bg-red-dark" 
                disabled={saveProfile.isPending || !hasChanges || mobileError}
              >
                {saveProfile.isPending ? (
                  <>
                    <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-3 h-6 w-6" />
                    Save Changes
                  </>
                )}
              </Button>
              <Button 
                type="button" 
                variant="outline"
                onClick={handleReset}
                disabled={saveProfile.isPending || !hasChanges}
                className="h-16 px-10 text-xl font-bold border-3 border-red-primary/30 hover:bg-red-50 transition-all hover:scale-105"
              >
                Reset
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
