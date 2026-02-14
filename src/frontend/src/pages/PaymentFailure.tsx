import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle } from 'lucide-react';
import { getBrandClasses } from '../utils/accents';

type Page = 'home' | 'mock-tests' | 'courses' | 'syllabus' | 'progress' | 'profile' | 'admin' | 'payment-success' | 'payment-failure';

interface PaymentFailureProps {
  onNavigate: (page: Page) => void;
}

export default function PaymentFailure({ onNavigate }: PaymentFailureProps) {
  const classes = getBrandClasses('red');

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto">
        <Card className={`border-2 ${classes.border} ${classes.bgSubtle}`}>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className={`p-4 ${classes.bg} rounded-full`}>
                <XCircle className="h-16 w-16 text-white" />
              </div>
            </div>
            <CardTitle className={`text-3xl ${classes.text}`}>Payment Failed</CardTitle>
            <CardDescription className="text-lg">
              Your payment could not be processed
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-2">
              <p className="text-muted-foreground">
                We encountered an issue while processing your payment. Please try again.
              </p>
              <p className="text-sm text-muted-foreground">
                If the problem persists, please contact our support team.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => onNavigate('mock-tests')}
                className={`${classes.bg} hover:${classes.bg}/90 text-white`}
              >
                Try Again
              </Button>
              <Button 
                onClick={() => onNavigate('home')}
                variant="outline"
                className={`border-2 ${classes.border} ${classes.text} hover:${classes.bgSubtle}`}
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
