import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { XCircle } from 'lucide-react';

type Page = 'home' | 'mock-tests' | 'courses' | 'syllabus' | 'progress' | 'admin' | 'payment-success' | 'payment-failure';

interface PaymentFailureProps {
  onNavigate: (page: Page) => void;
}

export default function PaymentFailure({ onNavigate }: PaymentFailureProps) {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <XCircle className="h-16 w-16 text-destructive" />
            </div>
            <CardTitle className="text-2xl">Payment Failed</CardTitle>
            <CardDescription>Your payment could not be processed</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-muted-foreground">
              There was a problem processing your payment. Please try again.
            </p>
            <div className="flex flex-col gap-2">
              <Button onClick={() => onNavigate('mock-tests')} className="w-full">
                Try Again
              </Button>
              <Button onClick={() => onNavigate('home')} variant="outline" className="w-full">
                Go to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
