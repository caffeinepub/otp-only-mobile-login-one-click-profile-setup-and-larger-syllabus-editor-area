import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';

type Page = 'home' | 'mock-tests' | 'courses' | 'syllabus' | 'progress' | 'admin' | 'payment-success' | 'payment-failure';

interface PaymentSuccessProps {
  onNavigate: (page: Page) => void;
}

export default function PaymentSuccess({ onNavigate }: PaymentSuccessProps) {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-2xl">Payment Successful!</CardTitle>
            <CardDescription>Your payment has been processed successfully</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-muted-foreground">
              Thank you for your purchase. You can now access your mock tests.
            </p>
            <div className="flex flex-col gap-2">
              <Button onClick={() => onNavigate('mock-tests')} className="w-full">
                Go to Mock Tests
              </Button>
              <Button onClick={() => onNavigate('progress')} variant="outline" className="w-full">
                View Progress
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
