import { memo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Video, TrendingUp, Award, CheckCircle, ArrowRight } from 'lucide-react';
import { getBrandClasses, getBrandByIndex } from '../utils/accents';

type Page = 'home' | 'mock-tests' | 'courses' | 'syllabus' | 'progress' | 'profile' | 'admin' | 'payment-success' | 'payment-failure';

interface HomePageProps {
  onNavigate: (page: Page) => void;
  onLoginClick: () => void;
  isAuthenticated: boolean;
}

const HomePage = memo(function HomePage({ onNavigate, onLoginClick, isAuthenticated }: HomePageProps) {
  const redClasses = getBrandClasses('red');
  const blueClasses = getBrandClasses('blue');

  const features = [
    {
      icon: BookOpen,
      title: 'Mock Tests',
      description: 'Practice with comprehensive mock tests designed for CUET UG preparation',
      page: 'mock-tests' as Page,
      color: 'red' as const,
    },
    {
      icon: Video,
      title: 'Video Courses',
      description: 'Learn from expert teachers with detailed video lectures',
      page: 'courses' as Page,
      color: 'blue' as const,
    },
    {
      icon: TrendingUp,
      title: 'Track Progress',
      description: 'Monitor your performance and identify areas for improvement',
      page: 'progress' as Page,
      color: 'red' as const,
    },
    {
      icon: Award,
      title: 'Complete Syllabus',
      description: 'Access the complete and updated CUET UG syllabus',
      page: 'syllabus' as Page,
      color: 'blue' as const,
    },
  ];

  const benefits = [
    'Comprehensive mock tests for all subjects',
    'Expert video lectures and study materials',
    'Detailed performance analytics',
    'Updated syllabus and exam patterns',
    'Affordable pricing for all students',
    'Mobile-friendly platform',
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="section-bg-gradient-1 py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-brand-red/10 text-brand-red border border-brand-red/30">
              CUET UG Preparation Platform
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-brand-red to-brand-blue bg-clip-text text-transparent">
              Master CUET UG with Exam Xpresss
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Your complete preparation partner for CUET UG with mock tests, video courses, and comprehensive study materials
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthenticated ? (
                <>
                  <Button
                    size="lg"
                    onClick={() => onNavigate('mock-tests')}
                    className="bg-brand-red hover:bg-brand-red/90 text-white text-lg px-8"
                  >
                    Start Mock Test
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => onNavigate('courses')}
                    className="border-2 border-brand-blue text-brand-blue hover:bg-brand-blue/10 text-lg px-8"
                  >
                    Browse Courses
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    size="lg"
                    onClick={onLoginClick}
                    className="bg-brand-red hover:bg-brand-red/90 text-white text-lg px-8"
                  >
                    Get Started
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => onNavigate('syllabus')}
                    className="border-2 border-brand-blue text-brand-blue hover:bg-brand-blue/10 text-lg px-8"
                  >
                    View Syllabus
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section-bg-gradient-2 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-brand-red">
              Everything You Need to Succeed
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Comprehensive tools and resources designed to help you excel in CUET UG
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const classes = getBrandClasses(feature.color);
              const Icon = feature.icon;

              return (
                <Card
                  key={index}
                  className={`border-l-4 ${
                    feature.color === 'red' ? 'border-brand-red hover:bg-brand-red/5' : 'border-brand-blue hover:bg-brand-blue/5'
                  } transition-all hover:shadow-lg cursor-pointer`}
                  onClick={() => onNavigate(feature.page)}
                >
                  <CardHeader>
                    <div className={`h-12 w-12 rounded-lg ${
                      feature.color === 'red' ? 'bg-brand-red/10' : 'bg-brand-blue/10'
                    } flex items-center justify-center mb-4`}>
                      <Icon className={`h-6 w-6 ${
                        feature.color === 'red' ? 'text-brand-red' : 'text-brand-blue'
                      }`} />
                    </div>
                    <CardTitle className={feature.color === 'red' ? 'text-brand-red' : 'text-brand-blue'}>
                      {feature.title}
                    </CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      variant="ghost" 
                      className={`w-full ${
                        feature.color === 'red' 
                          ? 'text-brand-red hover:bg-brand-red/10' 
                          : 'text-brand-blue hover:bg-brand-blue/10'
                      }`}
                    >
                      Explore
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="section-bg-gradient-3 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-brand-blue">
                Why Choose Exam Xpresss?
              </h2>
              <p className="text-lg text-muted-foreground">
                Join thousands of students preparing for CUET UG with our platform
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {benefits.map((benefit, index) => {
                const color = getBrandByIndex(index);
                const isRed = color === 'red';

                return (
                  <div
                    key={index}
                    className={`flex items-start gap-3 p-4 rounded-lg ${
                      isRed ? 'bg-brand-red/5 border border-brand-red/30' : 'bg-brand-blue/5 border border-brand-blue/30'
                    }`}
                  >
                    <CheckCircle className={`h-6 w-6 ${
                      isRed ? 'text-brand-red' : 'text-brand-blue'
                    } flex-shrink-0 mt-0.5`} />
                    <span className="text-foreground">{benefit}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-bg-gradient-4 py-20">
        <div className="container mx-auto px-4">
          <Card className="max-w-4xl mx-auto border-2 border-brand-red bg-brand-red/5">
            <CardContent className="p-12 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-brand-red">
                Ready to Start Your CUET UG Journey?
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Join Exam Xpresss today and get access to comprehensive study materials, mock tests, and expert guidance
              </p>
              {isAuthenticated ? (
                <Button
                  size="lg"
                  onClick={() => onNavigate('mock-tests')}
                  className="bg-brand-red hover:bg-brand-red/90 text-white text-lg px-8"
                >
                  Start Practicing Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              ) : (
                <Button
                  size="lg"
                  onClick={onLoginClick}
                  className="bg-brand-red hover:bg-brand-red/90 text-white text-lg px-8"
                >
                  Get Started for Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
});

export default HomePage;
