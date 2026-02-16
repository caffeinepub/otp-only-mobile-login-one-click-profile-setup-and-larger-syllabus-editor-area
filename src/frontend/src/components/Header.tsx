import { memo } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { User, LogOut, Settings } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import { useQueryClient } from '@tanstack/react-query';

type Page = 'home' | 'mock-tests' | 'courses' | 'syllabus' | 'progress' | 'profile' | 'admin' | 'payment-success' | 'payment-failure';

interface HeaderProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  onLoginClick: () => void;
  isAdmin: boolean;
}

const Header = memo(function Header({ currentPage, onNavigate, onLoginClick, isAdmin }: HeaderProps) {
  const { identity, clear } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const queryClient = useQueryClient();

  const isAuthenticated = !!identity;

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
    onNavigate('home');
  };

  const navItems: { page: Page; label: string }[] = [
    { page: 'home', label: 'Home' },
    { page: 'mock-tests', label: 'Mock Tests' },
    { page: 'courses', label: 'Courses' },
    { page: 'syllabus', label: 'Syllabus' },
    { page: 'progress', label: 'Progress' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <button
              onClick={() => onNavigate('home')}
              className="flex items-center gap-3 group"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-red to-brand-blue rounded-full blur-sm opacity-75 group-hover:opacity-100 transition-opacity" />
                <div className="relative h-10 w-10 rounded-full bg-gradient-to-br from-brand-red to-brand-blue flex items-center justify-center ring-2 ring-background overflow-hidden">
                  <img 
                    src="/assets/generated/exam-xpresss-logo-clean.dim_512x512.png" 
                    alt="Exam Xpresss Logo" 
                    className="h-full w-full object-contain p-1"
                  />
                </div>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-brand-red to-brand-blue bg-clip-text text-transparent">
                Exam Xpresss
              </span>
            </button>

            <nav className="hidden md:flex items-center gap-1">
              {navItems.map(({ page, label }) => {
                const isActive = currentPage === page;
                const color = page === 'home' || page === 'mock-tests' || page === 'progress' ? 'red' : 'blue';
                
                return (
                  <Button
                    key={page}
                    variant="ghost"
                    onClick={() => onNavigate(page)}
                    className={`relative ${
                      isActive
                        ? color === 'red'
                          ? 'text-brand-red bg-brand-red/10'
                          : 'text-brand-blue bg-brand-blue/10'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {label}
                    {isActive && (
                      <span className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-0.5 ${
                        color === 'red' ? 'bg-brand-red' : 'bg-brand-blue'
                      } rounded-full`} />
                    )}
                  </Button>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
                    <Avatar className="h-10 w-10 ring-2 ring-brand-red">
                      {userProfile?.photo ? (
                        <AvatarImage src={userProfile.photo.getDirectURL()} alt={userProfile.name} />
                      ) : null}
                      <AvatarFallback className="bg-brand-red text-white font-bold">
                        {userProfile?.name?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="flex items-center gap-2 p-2">
                    <Avatar className="h-8 w-8">
                      {userProfile?.photo ? (
                        <AvatarImage src={userProfile.photo.getDirectURL()} alt={userProfile.name} />
                      ) : null}
                      <AvatarFallback className="bg-brand-red text-white text-xs">
                        {userProfile?.name?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{userProfile?.name || 'User'}</span>
                      <span className="text-xs text-muted-foreground">
                        {userProfile?.mobile || 'No mobile'}
                      </span>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onNavigate('profile')} className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem onClick={() => onNavigate('admin')} className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      Admin Panel
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-brand-red">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button onClick={onLoginClick} className="bg-brand-red hover:bg-brand-red/90 text-white">
                Login
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
});

export default Header;
