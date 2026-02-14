import { useMemo, memo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Loader2, TrendingUp, Award, Target, Calendar } from 'lucide-react';
import { useGetTestResults, useGetUserProgress } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { getMetricCardClasses, getChartColor, getBrandByIndex, getBrandClasses } from '../utils/accents';

type Page = 'home' | 'mock-tests' | 'courses' | 'syllabus' | 'progress' | 'profile' | 'admin' | 'payment-success' | 'payment-failure';

interface ProgressPageProps {
  onNavigate: (page: Page) => void;
}

const ProgressPage = memo(function ProgressPage({ onNavigate }: ProgressPageProps) {
  const { identity } = useInternetIdentity();
  const userPrincipal = identity?.getPrincipal();

  const { data: testResults = [], isLoading: resultsLoading } = useGetTestResults(userPrincipal!);
  const { data: userProgress, isLoading: progressLoading } = useGetUserProgress(userPrincipal!);

  const chartData = useMemo(() => {
    if (!testResults || testResults.length === 0) return [];
    
    return testResults.map((result, index) => ({
      name: `Test ${index + 1}`,
      score: Number(result.score),
      attempts: Number(result.attempts),
    }));
  }, [testResults]);

  const metrics = useMemo(() => {
    if (!userProgress) return [];
    
    return [
      {
        title: 'Total Tests',
        value: Number(userProgress.totalTests),
        icon: Target,
        description: 'Tests completed',
      },
      {
        title: 'Average Score',
        value: `${Number(userProgress.averageScore)}%`,
        icon: Award,
        description: 'Overall performance',
      },
      {
        title: 'Best Score',
        value: testResults.length > 0 ? `${Math.max(...testResults.map(r => Number(r.score)))}%` : '0%',
        icon: TrendingUp,
        description: 'Highest achievement',
      },
      {
        title: 'Recent Activity',
        value: testResults.length > 0 ? 'Active' : 'No tests',
        icon: Calendar,
        description: 'Last 7 days',
      },
    ];
  }, [userProgress, testResults]);

  if (resultsLoading || progressLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-brand-blue" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-brand-blue">Your Progress</h1>
        <p className="text-muted-foreground">Track your performance and improvement over time</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          const cardClasses = getMetricCardClasses(index);
          const color = getBrandByIndex(index);
          const classes = getBrandClasses(color);

          return (
            <Card key={index} className={cardClasses}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {metric.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${classes.text}`} />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${classes.text}`}>{metric.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{metric.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      {chartData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-brand-red">Score Trend</CardTitle>
              <CardDescription>Your performance over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke={getChartColor(0)} 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-brand-blue">Test Attempts</CardTitle>
              <CardDescription>Number of attempts per test</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="attempts" fill={getChartColor(1)} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Results */}
      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-brand-red">Recent Test Results</CardTitle>
            <CardDescription>Your latest test performances</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {testResults.slice(0, 5).map((result, index) => {
                const color = getBrandByIndex(index);
                const classes = getBrandClasses(color);
                
                return (
                  <div key={index} className={`flex items-center justify-between p-4 rounded-lg border-l-4 ${classes.border} ${classes.bgSubtle}`}>
                    <div className="flex items-center gap-4">
                      <Badge className={`${classes.bgSubtle} ${classes.text} border ${classes.border}/30`}>
                        Test #{index + 1}
                      </Badge>
                      <div>
                        <p className="font-medium">Score: {Number(result.score)}%</p>
                        <p className="text-sm text-muted-foreground">Attempts: {Number(result.attempts)}</p>
                      </div>
                    </div>
                    <Progress value={Number(result.score)} className="w-32" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {testResults.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg text-muted-foreground mb-4">No test results yet</p>
            <p className="text-sm text-muted-foreground">Start taking mock tests to track your progress</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
});

export default ProgressPage;
