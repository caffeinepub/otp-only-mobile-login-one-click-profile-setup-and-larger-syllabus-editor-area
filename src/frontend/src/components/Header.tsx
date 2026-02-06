import { memo, useState, useMemo, useCallback } from 'react';
import { useGetCallerUserProfile, useGetSessionState } from '../hooks/useQueries';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Menu, X, LogOut, User, LayoutDashboard, Settings } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import LoginModal from './LoginModal';

type Page = 'home' | 'mock-tests' | 'courses' | 'syllabus' | 'progress' | 'profile' | 'admin' | 'payment-success' | 'payment-failure';

interface HeaderProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

const Header = memo(function Header({ currentPage, onNavigate }: HeaderProps) {
  const { clear } = useInternetIdentity();
  
  const { data: sessionState } = useGetSessionState();
  const isAuthenticated = sessionState?.isAuthenticated || false;
  const isAdmin = sessionState?.role === 'admin';
  
  const { data: userProfile } = useGetCallerUserProfile();
  const queryClient = useQueryClient();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  const handleLogout = useCallback(async () => {
    await clear();
    queryClient.clear();
    localStorage.removeItem('verified_mobile');
    localStorage.removeItem('otp_session');
    localStorage.removeItem('otp_code_dev');
    onNavigate('home');
  }, [clear, queryClient, onNavigate]);

  const handleLogin = useCallback(() => {
    setShowLogin(true);
    setShowSignup(false);
  }, []);

  const handleSignup = useCallback(() => {
    setShowSignup(true);
    setShowLogin(false);
  }, []);

  const handleLoginSuccess = useCallback(() => {
    setShowLogin(false);
    setShowSignup(false);
    queryClient.invalidateQueries({ queryKey: ['sessionState'] });
    queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
  }, [queryClient]);

  const navItems = useMemo(() => [
    { label: 'Home', page: 'home' as Page },
    { label: 'Mock Tests', page: 'mock-tests' as Page },
    { label: 'Courses', page: 'courses' as Page },
    { label: 'Syllabus', page: 'syllabus' as Page },
    { label: 'Progress', page: 'progress' as Page },
  ], []);

  const handleNavigate = useCallback((page: Page) => {
    onNavigate(page);
    setMobileMenuOpen(false);
  }, [onNavigate]);

  const userDisplayName = useMemo(() => userProfile?.name || '', [userProfile?.name]);
  const userAvatarUrl = useMemo(() => userProfile?.photo.getDirectURL() || '', [userProfile?.photo]);
  const userInitial = useMemo(() => userDisplayName.charAt(0).toUpperCase() || 'U', [userDisplayName]);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b-2 border-blue-accent/20 bg-gradient-to-r from-blue-accent to-blue-light backdrop-blur supports-[backdrop-filter]:bg-blue-accent/95 shadow-blue-lg">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3 cursor-pointer hover:opacity-90 transition-opacity" onClick={() => onNavigate('home')}>
            <img 
              src="/assets/IMG_20260121_194813_007.webp" 
              alt="Exam Xpresss Logo" 
              className="h-10 w-10 rounded-full shadow-lg ring-2 ring-white/30" 
              loading="eager"
            />
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-white drop-shadow-md">Exam Xpresss</h1>
              <p className="text-xs text-white/90 font-semibold">CUET UG Preparation</p>
            </div>
          </div>

          {isAuthenticated && (
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Button
                  key={item.page}
                  variant={currentPage === item.page ? 'secondary' : 'ghost'}
                  onClick={() => onNavigate(item.page)}
                  className={`text-sm font-semibold transition-all hover:scale-105 ${
                    currentPage === item.page 
                      ? 'bg-white text-blue-accent shadow-md' 
                      : 'text-white hover:bg-white/20'
                  }`}
                >
                  {item.label}
                </Button>
              ))}
              {isAdmin && (
                <Button
                  variant={currentPage === 'admin' ? 'secondary' : 'ghost'}
                  onClick={() => onNavigate('admin')}
                  className={`text-sm font-semibold transition-all hover:scale-105 ${
                    currentPage === 'admin' 
                      ? 'bg-white text-blue-accent shadow-md' 
                      : 'text-white hover:bg-white/20'
                  }`}
                >
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Admin
                </Button>
              )}
            </nav>
          )}

          <div className="flex items-center gap-3">
            {isAuthenticated && userProfile ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 gap-2 px-2 hover:bg-white/20 transition-all text-white">
                    <Avatar className="h-8 w-8 ring-2 ring-white/50 shadow-md">
                      <AvatarImage src={userAvatarUrl} alt={userDisplayName} loading="lazy" />
                      <AvatarFallback className="bg-white text-blue-accent font-bold">{userInitial}</AvatarFallback>
                    </Avatar>
                    <div className="hidden sm:flex flex-col items-start text-left">
                      <span className="text-sm font-semibold">{userDisplayName}</span>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="flex items-center gap-2 p-2">
                    <Avatar className="h-10 w-10 ring-2 ring-blue-accent/30 shadow-md">
                      <AvatarImage src={userAvatarUrl} alt={userDisplayName} loading="lazy" />
                      <AvatarFallback className="bg-blue-accent text-white font-bold">{userInitial}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold">{userDisplayName}</span>
                      {userProfile.mobile && (
                        <span className="text-xs text-muted-foreground">{userProfile.mobile}</span>
                      )}
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onNavigate('profile')} className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    Edit Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onNavigate('progress')} className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    My Progress
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem onClick={() => onNavigate('admin')} className="cursor-pointer">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Admin Panel
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-primary font-semibold">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Button 
                  onClick={handleLogin}
                  variant="ghost"
                  className="text-white hover:bg-white/20 font-semibold"
                >
                  Login
                </Button>
                <Button 
                  onClick={handleSignup}
                  className="bg-red-primary hover:bg-red-dark text-white shadow-premium-lg transition-all hover:shadow-premium-xl hover:scale-105 font-bold"
                >
                  Sign up
                </Button>
              </div>
            )}

            {isAuthenticated && (
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-white hover:bg-white/20"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            )}
          </div>
        </div>

        {isAuthenticated && mobileMenuOpen && (
          <div className="md:hidden border-t border-white/20 bg-blue-accent/95 animate-slide-in">
            <nav className="container mx-auto flex flex-col p-4 gap-2">
              {navItems.map((item) => (
                <Button
                  key={item.page}
                  variant={currentPage === item.page ? 'secondary' : 'ghost'}
                  onClick={() => handleNavigate(item.page)}
                  className={`justify-start font-semibold ${
                    currentPage === item.page 
                      ? 'bg-white text-blue-accent' 
                      : 'text-white hover:bg-white/20'
                  }`}
                >
                  {item.label}
                </Button>
              ))}
              <Button
                variant={currentPage === 'profile' ? 'secondary' : 'ghost'}
                onClick={() => handleNavigate('profile')}
                className={`justify-start font-semibold ${
                  currentPage === 'profile' 
                    ? 'bg-white text-blue-accent' 
                    : 'text-white hover:bg-white/20'
                }`}
              >
                <Settings className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
              {isAdmin && (
                <Button
                  variant={currentPage === 'admin' ? 'secondary' : 'ghost'}
                  onClick={() => handleNavigate('admin')}
                  className={`justify-start font-semibold ${
                    currentPage === 'admin' 
                      ? 'bg-white text-blue-accent' 
                      : 'text-white hover:bg-white/20'
                  }`}
                >
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Admin Panel
                </Button>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* Both Login and Sign up open the same OTP modal */}
      <LoginModal 
        open={showLogin || showSignup} 
        onClose={() => {
          setShowLogin(false);
          setShowSignup(false);
        }}
        onSuccess={handleLoginSuccess}
      />
    </>
  );
});

export default Header;
