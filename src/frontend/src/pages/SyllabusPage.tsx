import { useGetAllSyllabi } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { BookOpen, CheckCircle, Loader2 } from 'lucide-react';
import { memo } from 'react';

type Page = 'home' | 'mock-tests' | 'courses' | 'syllabus' | 'progress' | 'profile' | 'admin' | 'payment-success' | 'payment-failure';

interface SyllabusPageProps {
  onNavigate: (page: Page) => void;
}

export default memo(function SyllabusPage({ onNavigate }: SyllabusPageProps) {
  const { data: syllabi = [], isLoading } = useGetAllSyllabi();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-blue-accent" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-blue-accent">CUET UG Syllabus</h1>
        <p className="text-muted-foreground">Complete and updated syllabus for all subjects</p>
      </div>

      {syllabi.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg text-muted-foreground">Syllabus content coming soon!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {syllabi.map((syllabus) => (
            <Card key={syllabus.subject} className="border-2 hover:border-blue-accent/30 transition-all">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-accent">
                  <BookOpen className="h-5 w-5" />
                  {syllabus.subject}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="topics">
                    <AccordionTrigger>
                      <span className="text-blue-accent/80">{syllabus.topics.length} Topics</span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul className="space-y-2">
                        {syllabus.topics.map((topic, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-red-primary mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{topic}</span>
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
});
