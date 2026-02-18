import { useState, useMemo, memo, useCallback } from 'react';
import { useGetAllMockTests, useCreateCheckoutSession } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Clock, IndianRupee, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { MockTest, ShoppingItem } from '../backend';
import { getSubjectAccent, getBrandClasses, getTabTriggerClasses, getCardClasses, getBadgeClasses, getButtonClasses } from '../utils/accents';

type Page = 'home' | 'mock-tests' | 'courses' | 'syllabus' | 'progress' | 'profile' | 'admin' | 'payment-success' | 'payment-failure';

interface MockTestsPageProps {
  onNavigate: (page: Page) => void;
}

const MockTestsPage = memo(function MockTestsPage({ onNavigate }: MockTestsPageProps) {
  const { data: mockTests = [], isLoading } = useGetAllMockTests();
  const createCheckout = useCreateCheckoutSession();
  const [purchasingTestId, setPurchasingTestId] = useState<string | null>(null);

  const subjects = useMemo(() => Array.from(new Set(mockTests.map((test) => test.subject))), [mockTests]);

  const handlePurchase = useCallback(async (test: MockTest) => {
    setPurchasingTestId(test.id);
    try {
      const shoppingItem: ShoppingItem = {
        productName: `${test.subject} Mock Test`,
        productDescription: `Mock test for ${test.subject} with ${test.questions.length} questions`,
        priceInCents: test.price,
        currency: 'INR',
        quantity: BigInt(1),
      };

      const session = await createCheckout.mutateAsync([shoppingItem]);

      if (!session?.url) {
        throw new Error('Stripe session missing url');
      }

      window.location.href = session.url;
    } catch (error) {
      console.error('Purchase error:', error);
      toast.error('Failed to initiate purchase. Please try again.');
    } finally {
      setPurchasingTestId(null);
    }
  }, [createCheckout]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-brand-red" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-brand-red">Mock Tests</h1>
        <p className="text-muted-foreground">Practice with subject-wise mock tests and track your performance</p>
      </div>

      {mockTests.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg text-muted-foreground">No mock tests available yet. Check back soon!</p>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-6 flex-wrap h-auto">
            <TabsTrigger value="all" className="data-[state=active]:bg-brand-red/10 data-[state=active]:text-brand-red">
              All Tests
            </TabsTrigger>
            {subjects.map((subject) => {
              const color = getSubjectAccent(subject);
              return (
                <TabsTrigger 
                  key={subject} 
                  value={subject}
                  className={getTabTriggerClasses(color)}
                >
                  {subject}
                </TabsTrigger>
              );
            })}
          </TabsList>

          <TabsContent value="all">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockTests.map((test) => (
                <MockTestCard
                  key={test.id}
                  test={test}
                  onPurchase={handlePurchase}
                  isPurchasing={purchasingTestId === test.id}
                />
              ))}
            </div>
          </TabsContent>

          {subjects.map((subject) => (
            <TabsContent key={subject} value={subject}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockTests
                  .filter((test) => test.subject === subject)
                  .map((test) => (
                    <MockTestCard
                      key={test.id}
                      test={test}
                      onPurchase={handlePurchase}
                      isPurchasing={purchasingTestId === test.id}
                    />
                  ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
});

interface MockTestCardProps {
  test: MockTest;
  onPurchase: (test: MockTest) => void;
  isPurchasing: boolean;
}

const MockTestCard = memo(function MockTestCard({ test, onPurchase, isPurchasing }: MockTestCardProps) {
  const color = getSubjectAccent(test.subject);
  const classes = getBrandClasses(color);
  const cardClasses = getCardClasses(color);
  const badgeClasses = getBadgeClasses(color);
  const buttonClasses = getButtonClasses(color);
  
  return (
    <Card className={cardClasses}>
      <CardHeader>
        <div className="flex items-start justify-between mb-2">
          <Badge className={badgeClasses}>{test.subject}</Badge>
          <div className={`flex items-center gap-1 ${classes.text} font-semibold`}>
            <IndianRupee className="h-4 w-4" />
            {Number(test.price) / 100}
          </div>
        </div>
        <CardTitle className={`text-xl ${classes.text}`}>{test.subject} Mock Test</CardTitle>
        <CardDescription>Complete practice test with detailed solutions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className={`flex items-center gap-2 text-sm ${classes.text}`}>
            <BookOpen className="h-4 w-4" />
            <span>{test.questions.length} Questions</span>
          </div>
          <div className={`flex items-center gap-2 text-sm ${classes.text}`}>
            <Clock className="h-4 w-4" />
            <span>Estimated time: {test.questions.length * 2} minutes</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          className={`w-full ${buttonClasses}`}
          onClick={() => onPurchase(test)} 
          disabled={isPurchasing}
        >
          {isPurchasing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            'Buy and Start Test'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
});

export default MockTestsPage;
