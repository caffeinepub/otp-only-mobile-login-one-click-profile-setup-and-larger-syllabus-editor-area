import { useMemo, memo } from 'react';
import { useGetAllCourses } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Video, Clock, Loader2 } from 'lucide-react';
import type { Course } from '../backend';

type Page = 'home' | 'mock-tests' | 'courses' | 'syllabus' | 'progress' | 'profile' | 'admin' | 'payment-success' | 'payment-failure';

interface CoursesPageProps {
  onNavigate: (page: Page) => void;
}

const CoursesPage = memo(function CoursesPage({ onNavigate }: CoursesPageProps) {
  const { data: courses = [], isLoading } = useGetAllCourses();

  const subjects = useMemo(() => Array.from(new Set(courses.map((course) => course.subject))), [courses]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Video Courses</h1>
        <p className="text-muted-foreground">Learn from comprehensive video lectures by expert teachers</p>
      </div>

      {courses.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Video className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg text-muted-foreground">No courses available yet. Check back soon!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {subjects.map((subject) => (
            <div key={subject}>
              <h2 className="text-2xl font-semibold mb-4">{subject}</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {courses
                  .filter((course) => course.subject === subject)
                  .map((course) => (
                    <CourseCard key={course.id} course={course} />
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

interface CourseCardProps {
  course: Course;
}

const CourseCard = memo(function CourseCard({ course }: CourseCardProps) {
  const totalDuration = useMemo(() => {
    return course.videos.reduce((acc, video) => acc + Number(video.duration), 0);
  }, [course.videos]);

  const hours = Math.floor(totalDuration / 3600);
  const minutes = Math.floor((totalDuration % 3600) / 60);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between mb-2">
          <Badge variant="secondary">{course.subject}</Badge>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            {hours > 0 && `${hours}h `}
            {minutes}m
          </div>
        </div>
        <CardTitle>{course.title}</CardTitle>
        <CardDescription>{course.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="videos">
            <AccordionTrigger>
              <div className="flex items-center gap-2">
                <Video className="h-4 w-4" />
                <span>{course.videos.length} Video Lectures</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                {course.videos.map((video, index) => (
                  <div key={video.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-muted-foreground">#{index + 1}</span>
                      <span className="text-sm">{video.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {Math.floor(Number(video.duration) / 60)}m
                      </span>
                      <video
                        src={video.videoFile.getDirectURL()}
                        controls
                        preload="metadata"
                        className="h-8 w-12 rounded object-cover cursor-pointer"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
});

export default CoursesPage;
