import { useMemo, memo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Loader2, TrendingUp, Award, Target, Calendar } from 'lucide-react';
import { useGetTestResults, useGetUserProgress } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

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

  const performanceMetrics = useMemo(() => {
    if (!testResults || testResults.length === 0) {
      return {
        totalTests: 0,
        averageScore: 0,
        highestScore: 0,
        lowestScore: 0,
        improvementRate: 0,
      };
    }

    const scores = testResults.map(r => Number(r.score));
    const totalTests = testResults.length;
    const averageScore = scores.reduce((a, b) => a + b, 0) / totalTests;
    const highestScore = Math.max(...scores);
    const lowestScore = Math.min(...scores);
    
    let improvementRate = 0;
    if (totalTests >= 2) {
      const firstHalf = scores.slice(0, Math.floor(totalTests / 2));
      const secondHalf = scores.slice(Math.floor(totalTests / 2));
      const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
      improvementRate = ((secondAvg - firstAvg) / firstAvg) * 100;
    }

    return {
      totalTests,
      averageScore: Math.round(averageScore),
      highestScore,
      lowestScore,
      improvementRate: Math.round(improvementRate),
    };
  }, [testResults]);

  if (resultsLoading || progressLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-blue-accent" />
      </div>
    );
  }

  if (!userPrincipal) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please log in to view your progress</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-blue-accent">Your Progress</h1>
        <p className="text-muted-foreground">Track your performance and improvement over time</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tests</CardTitle>
            <Target className="h-4 w-4 text-blue-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-accent">{performanceMetrics.totalTests}</div>
            <p className="text-xs text-muted-foreground mt-1">Tests completed</p>
          </CardContent>
        </Card>

        <Card className="hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <Award className="h-4 w-4 text-blue-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-accent">{performanceMetrics.averageScore}%</div>
            <Progress value={performanceMetrics.averageScore} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Highest Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{performanceMetrics.highestScore}%</div>
            <p className="text-xs text-muted-foreground mt-1">Best performance</p>
          </CardContent>
        </Card>

        <Card className="hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Improvement</CardTitle>
            <Calendar className="h-4 w-4 text-blue-accent" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${performanceMetrics.improvementRate >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {performanceMetrics.improvementRate > 0 ? '+' : ''}{performanceMetrics.improvementRate}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">Over time</p>
          </CardContent>
        </Card>
      </div>

      {chartData.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Score Trend</CardTitle>
              <CardDescription>Your performance over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="score" stroke="hsl(var(--blue-accent))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Test Scores</CardTitle>
              <CardDescription>Individual test performance</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="score" fill="hsl(var(--blue-accent))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>No Test Results Yet</CardTitle>
            <CardDescription>Start taking mock tests to track your progress</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              You haven't completed any tests yet. Take your first mock test to start tracking your progress!
            </p>
          </CardContent>
        </Card>
      )}

      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Test Results</CardTitle>
            <CardDescription>Your latest test performances</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {testResults.slice(-5).reverse().map((result, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">Test ID: {result.testId}</p>
                    <p className="text-sm text-muted-foreground">Attempts: {Number(result.attempts)}</p>
                  </div>
                  <Badge 
                    variant={Number(result.score) >= 70 ? 'default' : Number(result.score) >= 50 ? 'secondary' : 'destructive'}
                    className="text-lg px-4 py-2"
                  >
                    {Number(result.score)}%
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
});

export default ProgressPage;
