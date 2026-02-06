import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, GraduationCap, TrendingUp, Video, CheckCircle } from 'lucide-react';
import { useGetSessionState } from '../hooks/useQueries';
import LoginModal from '../components/LoginModal';

type Page = 'home' | 'mock-tests' | 'courses' | 'syllabus' | 'progress' | 'admin' | 'payment-success' | 'payment-failure';

interface HomePageProps {
  onNavigate: (page: Page) => void;
}

export default function HomePage({ onNavigate }: HomePageProps) {
  const { data: sessionState } = useGetSessionState();
  const isAuthenticated = sessionState?.isAuthenticated || false;
  
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  const features = useMemo(() => [
    {
      icon: <BookOpen className="h-8 w-8 text-blue-accent" />,
      title: 'Mock Tests',
      description: 'Subject-wise mock tests with detailed solutions and performance tracking',
      page: 'mock-tests' as Page,
    },
    {
      icon: <Video className="h-8 w-8 text-blue-accent" />,
      title: 'Video Courses',
      description: 'Comprehensive video lectures by expert teachers for all CUET UG subjects',
      page: 'courses' as Page,
    },
    {
      icon: <GraduationCap className="h-8 w-8 text-blue-accent" />,
      title: 'Syllabus',
      description: 'Complete and updated syllabus for all CUET UG subjects',
      page: 'syllabus' as Page,
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-blue-accent" />,
      title: 'Progress Tracker',
      description: 'Track your daily progress, scores, and improvement over time',
      page: 'progress' as Page,
    },
  ], []);

  const benefits = useMemo(() => [
    'Subject-wise organized content',
    'Expert teacher video lectures',
    'Detailed performance analysis',
    'Regular mock tests',
    'Complete syllabus coverage',
    'Mobile-friendly platform',
  ], []);

  const handleLoginSuccess = () => {
    setShowLogin(false);
    setShowSignup(false);
  };

  return (
    <div className="min-h-screen">
      <section className="relative bg-gradient-to-br from-blue-accent/10 via-background to-blue-accent/5 py-24 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center animate-fade-in">
            <div className="flex justify-center mb-8">
              <img 
                src="/assets/IMG_20260121_194813_007.webp" 
                alt="Exam Xpresss Logo" 
                className="h-24 w-24 rounded-full shadow-blue-lg ring-4 ring-blue-accent/20" 
              />
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-blue-accent leading-tight">
              Exam Xpresss CUET UG
            </h1>
            <p className="text-xl md:text-2xl text-blue-accent/80 font-semibold mb-6">
              Your Complete CUET UG Preparation Platform
            </p>
            <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              Excel in your CUET UG exams with our comprehensive mock tests, expert video courses, and detailed progress tracking.
            </p>
            {!isAuthenticated && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  onClick={() => setShowLogin(true)}
                  variant="outline"
                  className="text-lg px-8 py-6 border-2 border-blue-accent text-blue-accent hover:bg-blue-accent/10 font-bold"
                >
                  Login
                </Button>
                <Button 
                  size="lg" 
                  onClick={() => setShowSignup(true)}
                  className="text-lg px-8 py-6 shadow-premium-lg hover:shadow-premium-xl transition-all hover:scale-105 bg-red-primary hover:bg-red-dark font-bold"
                >
                  Sign up
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-blue-accent">Our Features</h2>
          <p className="text-center text-muted-foreground mb-16 max-w-2xl mx-auto text-lg">
            All the essential tools to make your CUET UG preparation successful
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="hover-lift cursor-pointer border-2 hover:border-blue-accent/50 transition-all animate-fade-in" 
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={() => isAuthenticated && onNavigate(feature.page)}
              >
                <CardHeader>
                  <div className="mb-4 p-3 bg-blue-accent/10 rounded-lg w-fit">{feature.icon}</div>
                  <CardTitle className="text-blue-accent">{feature.title}</CardTitle>
                  <CardDescription className="text-muted-foreground">{feature.description}</CardDescription>
                </CardHeader>
                {isAuthenticated && (
                  <CardContent>
                    <Button variant="outline" className="w-full hover:bg-blue-accent hover:text-white transition-all border-blue-accent/30">
                      View
                    </Button>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-muted/30 to-blue-accent/5">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-blue-accent">Why Choose Exam Xpresss?</h2>
            <p className="text-center text-muted-foreground mb-16 text-lg">
              We are committed to your success
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {benefits.map((benefit, index) => (
                <div 
                  key={index} 
                  className="flex items-center gap-3 p-5 bg-background rounded-lg shadow-premium hover-lift animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <CheckCircle className="h-6 w-6 text-red-primary flex-shrink-0" />
                  <span className="text-lg font-medium">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {!isAuthenticated && (
        <section className="py-20 bg-gradient-to-r from-blue-accent via-blue-accent/95 to-blue-accent/90 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
          <div className="container mx-auto px-4 text-center relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Start Your CUET UG Journey?</h2>
            <p className="text-xl mb-10 opacity-90 max-w-2xl mx-auto leading-relaxed">
              Join Exam Xpresss today and take the first step towards success
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={() => setShowLogin(true)}
                variant="outline"
                className="text-lg px-8 py-6 border-2 border-white text-white hover:bg-white/20 font-semibold"
              >
                Login
              </Button>
              <Button 
                size="lg" 
                onClick={() => setShowSignup(true)}
                className="text-lg px-8 py-6 shadow-premium-lg hover:shadow-premium-xl transition-all hover:scale-105 font-semibold bg-red-primary hover:bg-red-dark text-white"
              >
                Sign up Now
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Both Login and Sign up open the same OTP modal */}
      <LoginModal 
        open={showLogin || showSignup} 
        onClose={() => {
          setShowLogin(false);
          setShowSignup(false);
        }}
        onSuccess={handleLoginSuccess}
      />
    </div>
  );
}
