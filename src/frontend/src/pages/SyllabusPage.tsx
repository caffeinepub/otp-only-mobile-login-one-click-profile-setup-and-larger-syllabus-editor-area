import { useGetAllSyllabi } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { BookOpen, CheckCircle, Loader2 } from 'lucide-react';
import { memo } from 'react';
import { getSubjectAccent, getBrandClasses, getNumberedItemClasses, getCardClasses, getAccordionTriggerClasses } from '../utils/accents';

type Page = 'home' | 'mock-tests' | 'courses' | 'syllabus' | 'progress' | 'profile' | 'admin' | 'payment-success' | 'payment-failure';

interface SyllabusPageProps {
  onNavigate: (page: Page) => void;
}

export default memo(function SyllabusPage({ onNavigate }: SyllabusPageProps) {
  const { data: syllabi = [], isLoading } = useGetAllSyllabi();

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
        <h1 className="text-3xl font-bold mb-2 text-brand-red">CUET UG Syllabus</h1>
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
          {syllabi.map((syllabus) => {
            const color = getSubjectAccent(syllabus.subject);
            const classes = getBrandClasses(color);
            const cardClasses = getCardClasses(color);
            const accordionClasses = getAccordionTriggerClasses(color);
            
            return (
              <Card key={syllabus.subject} className={cardClasses}>
                <CardHeader>
                  <CardTitle className={`flex items-center gap-2 ${classes.text}`}>
                    <BookOpen className="h-5 w-5" />
                    {syllabus.subject}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="topics">
                      <AccordionTrigger className={`${classes.text} ${accordionClasses}`}>
                        <span>{syllabus.topics.length} Topics</span>
                      </AccordionTrigger>
                      <AccordionContent>
                        <ul className="space-y-2">
                          {syllabus.topics.map((topic, index) => {
                            const itemClasses = getNumberedItemClasses(index);
                            
                            return (
                              <li 
                                key={index} 
                                className={`flex items-start gap-2 p-2 rounded ${itemClasses.borderLeft}`}
                              >
                                <CheckCircle className={`h-4 w-4 mt-0.5 flex-shrink-0 ${itemClasses.numberText}`} />
                                <span className="text-sm">{topic}</span>
                              </li>
                            );
                          })}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
});
