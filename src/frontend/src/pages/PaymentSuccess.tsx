import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { getBrandClasses } from '../utils/accents';

type Page = 'home' | 'mock-tests' | 'courses' | 'syllabus' | 'progress' | 'profile' | 'admin' | 'payment-success' | 'payment-failure';

interface PaymentSuccessProps {
  onNavigate: (page: Page) => void;
}

export default function PaymentSuccess({ onNavigate }: PaymentSuccessProps) {
  const classes = getBrandClasses('blue');

  useEffect(() => {
    // Optional: Add confetti or celebration animation
  }, []);

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto">
        <Card className={`border-2 ${classes.border} ${classes.bgSubtle}`}>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className={`p-4 ${classes.bg} rounded-full`}>
                <CheckCircle className="h-16 w-16 text-white" />
              </div>
            </div>
            <CardTitle className={`text-3xl ${classes.text}`}>Payment Successful!</CardTitle>
            <CardDescription className="text-lg">
              Your purchase has been completed successfully
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-2">
              <p className="text-muted-foreground">
                Thank you for your purchase. You now have access to your selected content.
              </p>
              <p className="text-sm text-muted-foreground">
                You can start using your purchased items immediately.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => onNavigate('mock-tests')}
                className={`${classes.bg} hover:${classes.bg}/90 text-white`}
              >
                View Mock Tests
              </Button>
              <Button 
                onClick={() => onNavigate('courses')}
                variant="outline"
                className={`border-2 ${classes.border} ${classes.text} hover:${classes.bgSubtle}`}
              >
                View Courses
              </Button>
              <Button 
                onClick={() => onNavigate('home')}
                variant="ghost"
              >
                Go to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
