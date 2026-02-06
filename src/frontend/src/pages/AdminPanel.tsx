import { useState, useMemo, memo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { Loader2, Plus, BookOpen, Video, FileText, DollarSign, Users, Trash2, AlertCircle, X } from 'lucide-react';
import { 
  useAddMockTest, 
  useAddCourse, 
  useAddSyllabus, 
  useGetAllMockTests, 
  useUpdateMockTestPrice, 
  useIsStripeConfigured, 
  useSetStripeConfiguration,
  useGetAllUserProfiles,
  useGetUserPurchases,
  useGetUserTestResults,
  useDeleteMockTest,
  useDeleteCourse,
  useDeleteSyllabus,
  useGetAllCourses,
  useGetAllSyllabi,
  useGetSessionState,
  useUpdateSyllabus
} from '../hooks/useQueries';
import { ExternalBlob } from '../backend';
import type { Principal } from '@icp-sdk/core/principal';

type Page = 'home' | 'mock-tests' | 'courses' | 'syllabus' | 'progress' | 'profile' | 'admin' | 'payment-success' | 'payment-failure';

interface AdminPanelProps {
  onNavigate: (page: Page) => void;
}

export default function AdminPanel({ onNavigate }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState('users');
  const { data: sessionState, isLoading: sessionLoading } = useGetSessionState();
  
  const isAdmin = sessionState?.role === 'admin';

  if (sessionLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You do not have access to the admin panel. Only authorized administrators can access this area.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Panel</h1>
        <p className="text-muted-foreground">Manage all platform content, users, and settings</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="users">
            <Users className="h-4 w-4 mr-2" />
            Users
          </TabsTrigger>
          <TabsTrigger value="mock-tests">
            <BookOpen className="h-4 w-4 mr-2" />
            Mock Tests
          </TabsTrigger>
          <TabsTrigger value="courses">
            <Video className="h-4 w-4 mr-2" />
            Courses
          </TabsTrigger>
          <TabsTrigger value="syllabus">
            <FileText className="h-4 w-4 mr-2" />
            Syllabus
          </TabsTrigger>
          <TabsTrigger value="stripe">
            <DollarSign className="h-4 w-4 mr-2" />
            Stripe
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <UsersAdmin />
        </TabsContent>

        <TabsContent value="mock-tests">
          <MockTestsAdmin />
        </TabsContent>

        <TabsContent value="courses">
          <CoursesAdmin />
        </TabsContent>

        <TabsContent value="syllabus">
          <SyllabusAdmin />
        </TabsContent>

        <TabsContent value="stripe">
          <StripeAdmin />
        </TabsContent>
      </Tabs>
    </div>
  );
}

const UsersAdmin = memo(function UsersAdmin() {
  const { data: userProfiles = [], isLoading, error } = useGetAllUserProfiles();
  const [selectedUser, setSelectedUser] = useState<Principal | null>(null);

  const selectedUserData = useMemo(() => {
    return userProfiles.find(([principal]) => principal.toString() === selectedUser?.toString());
  }, [userProfiles, selectedUser]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load user data. Please try again.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>All Users ({userProfiles.length})</CardTitle>
          <CardDescription>Click on a user to view details</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-2">
              {userProfiles.map(([principal, profile]) => {
                const isAdminUser = profile.gmail === 'sir94295@gmail.com' || profile.gmail === 'examxpress1105@gmail.com' || profile.mobile === '9455134315';
                return (
                  <div
                    key={principal.toString()}
                    onClick={() => setSelectedUser(principal)}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedUser?.toString() === principal.toString()
                        ? 'bg-primary/10 border-2 border-primary'
                        : 'bg-muted/50 hover:bg-muted'
                    }`}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={profile.photo.getDirectURL()} alt={profile.name} loading="lazy" />
                      <AvatarFallback>{profile.name.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{profile.name}</p>
                      {profile.mobile && (
                        <p className="text-xs text-muted-foreground truncate">{profile.mobile}</p>
                      )}
                    </div>
                    {isAdminUser && (
                      <Badge variant="destructive" className="text-xs">Admin</Badge>
                    )}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>User Details</CardTitle>
          <CardDescription>
            {selectedUserData ? 'Viewing user information' : 'Select a user to view details'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {selectedUserData ? (
            <UserDetails userPrincipal={selectedUserData[0]} userProfile={selectedUserData[1]} />
          ) : (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              Select a user from the list to view their details
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
});

const UserDetails = memo(function UserDetails({ userPrincipal, userProfile }: { userPrincipal: Principal; userProfile: any }) {
  const { data: purchases = [] } = useGetUserPurchases(userPrincipal);
  const { data: testResults = [] } = useGetUserTestResults(userPrincipal);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Avatar className="h-20 w-20">
          <AvatarImage src={userProfile.photo.getDirectURL()} alt={userProfile.name} />
          <AvatarFallback className="text-2xl">{userProfile.name.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div>
          <h3 className="text-2xl font-bold">{userProfile.name}</h3>
          {userProfile.mobile && <p className="text-muted-foreground">Mobile: {userProfile.mobile}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Purchases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{purchases.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Tests Taken</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{testResults.length}</div>
          </CardContent>
        </Card>
      </div>

      {purchases.length > 0 && (
        <div>
          <h4 className="font-semibold mb-2">Purchased Items</h4>
          <div className="space-y-1">
            {purchases.map((itemId, index) => (
              <div key={index} className="text-sm p-2 bg-muted rounded">
                {itemId}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

const MockTestsAdmin = memo(function MockTestsAdmin() {
  const { data: mockTests = [], isLoading } = useGetAllMockTests();
  const addMockTest = useAddMockTest();
  const updatePrice = useUpdateMockTestPrice();
  const deleteMockTest = useDeleteMockTest();

  const [subject, setSubject] = useState('');
  const [price, setPrice] = useState('');
  const [questions, setQuestions] = useState('');

  const handleAddMockTest = async () => {
    if (!subject || !price || !questions) {
      toast.error('Please fill all fields');
      return;
    }

    try {
      const parsedQuestions = JSON.parse(questions);
      await addMockTest.mutateAsync({
        subject,
        questions: parsedQuestions,
        price: BigInt(price),
      });
      toast.success('Mock test added successfully');
      setSubject('');
      setPrice('');
      setQuestions('');
    } catch (error) {
      toast.error('Failed to add mock test');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add New Mock Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Subject</Label>
            <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g., Mathematics" />
          </div>
          <div>
            <Label>Price (in paise)</Label>
            <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="e.g., 10000" />
          </div>
          <div>
            <Label>Questions (JSON format)</Label>
            <Textarea 
              value={questions} 
              onChange={(e) => setQuestions(e.target.value)} 
              placeholder='[{"questionText": "...", "options": [...], "correctOption": 0, "explanation": "..."}]'
              className="min-h-[200px] font-mono text-sm"
            />
          </div>
          <Button onClick={handleAddMockTest} disabled={addMockTest.isPending}>
            {addMockTest.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
            Add Mock Test
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing Mock Tests ({mockTests.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <div className="space-y-2">
              {mockTests.map((test) => (
                <div key={test.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">{test.subject}</p>
                    <p className="text-sm text-muted-foreground">{test.questions.length} questions • ₹{Number(test.price) / 100}</p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      if (confirm('Delete this mock test?')) {
                        deleteMockTest.mutate(test.id);
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
});

const CoursesAdmin = memo(function CoursesAdmin() {
  const { data: courses = [], isLoading } = useGetAllCourses();
  const addCourse = useAddCourse();
  const deleteCourse = useDeleteCourse();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('');

  const handleAddCourse = async () => {
    if (!title || !description || !subject) {
      toast.error('Please fill all fields');
      return;
    }

    try {
      await addCourse.mutateAsync({
        title,
        description,
        subject,
        videos: [],
      });
      toast.success('Course added successfully');
      setTitle('');
      setDescription('');
      setSubject('');
    } catch (error) {
      toast.error('Failed to add course');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add New Course</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Course title" />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Course description" />
          </div>
          <div>
            <Label>Subject</Label>
            <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g., Physics" />
          </div>
          <Button onClick={handleAddCourse} disabled={addCourse.isPending}>
            {addCourse.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
            Add Course
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing Courses ({courses.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <div className="space-y-2">
              {courses.map((course) => (
                <div key={course.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">{course.title}</p>
                    <p className="text-sm text-muted-foreground">{course.subject} • {course.videos.length} videos</p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      if (confirm('Delete this course?')) {
                        deleteCourse.mutate(course.id);
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
});

const SyllabusAdmin = memo(function SyllabusAdmin() {
  const { data: syllabi = [], isLoading } = useGetAllSyllabi();
  const addSyllabus = useAddSyllabus();
  const updateSyllabus = useUpdateSyllabus();
  const deleteSyllabus = useDeleteSyllabus();

  const [subject, setSubject] = useState('');
  const [topics, setTopics] = useState('');
  const [editingSubject, setEditingSubject] = useState<string | null>(null);

  const handleAddOrUpdateSyllabus = async () => {
    if (!subject || !topics) {
      toast.error('Please fill all fields');
      return;
    }

    try {
      const topicsArray = topics.split('\n').filter(t => t.trim());
      
      if (editingSubject) {
        await updateSyllabus.mutateAsync({ subject: editingSubject, topics: topicsArray });
        toast.success('Syllabus updated successfully');
        setEditingSubject(null);
      } else {
        await addSyllabus.mutateAsync({ subject, topics: topicsArray });
        toast.success('Syllabus added successfully');
      }
      
      setSubject('');
      setTopics('');
    } catch (error) {
      toast.error(editingSubject ? 'Failed to update syllabus' : 'Failed to add syllabus');
    }
  };

  const handleEdit = (syllabus: any) => {
    setEditingSubject(syllabus.subject);
    setSubject(syllabus.subject);
    setTopics(syllabus.topics.join('\n'));
  };

  const handleCancelEdit = () => {
    setEditingSubject(null);
    setSubject('');
    setTopics('');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{editingSubject ? 'Edit Syllabus' : 'Add New Syllabus'}</CardTitle>
          {editingSubject && (
            <CardDescription>
              Editing syllabus for {editingSubject}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Subject</Label>
            <Input 
              value={subject} 
              onChange={(e) => setSubject(e.target.value)} 
              placeholder="e.g., General Knowledge" 
              disabled={!!editingSubject}
            />
          </div>
          <div>
            <Label>Topics (one per line)</Label>
            <Textarea 
              value={topics} 
              onChange={(e) => setTopics(e.target.value)} 
              placeholder="Enter each topic on a new line"
              className="admin-syllabus-editor"
            />
            <p className="text-sm text-muted-foreground mt-2">
              Enter each topic on a separate line. The editor is large for comfortable editing.
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleAddOrUpdateSyllabus} disabled={addSyllabus.isPending || updateSyllabus.isPending}>
              {(addSyllabus.isPending || updateSyllabus.isPending) ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              {editingSubject ? 'Update Syllabus' : 'Add Syllabus'}
            </Button>
            {editingSubject && (
              <Button variant="outline" onClick={handleCancelEdit}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing Syllabi ({syllabi.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <div className="space-y-2">
              {syllabi.map((syllabus) => (
                <div key={syllabus.subject} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{syllabus.subject}</p>
                    <p className="text-sm text-muted-foreground">{syllabus.topics.length} topics</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(syllabus)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        if (confirm('Delete this syllabus?')) {
                          deleteSyllabus.mutate(syllabus.subject);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
});

const StripeAdmin = memo(function StripeAdmin() {
  const { data: isConfigured = false, isLoading } = useIsStripeConfigured();
  const setConfig = useSetStripeConfiguration();

  const [secretKey, setSecretKey] = useState('');
  const [countries, setCountries] = useState('IN,US');

  const handleSetConfig = async () => {
    if (!secretKey || !countries) {
      toast.error('Please fill all fields');
      return;
    }

    try {
      await setConfig.mutateAsync({
        secretKey,
        allowedCountries: countries.split(',').map(c => c.trim()),
      });
      toast.success('Stripe configured successfully');
      setSecretKey('');
    } catch (error) {
      toast.error('Failed to configure Stripe');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Stripe Configuration</CardTitle>
        <CardDescription>
          {isConfigured ? 'Stripe is configured' : 'Configure Stripe to enable payments'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isConfigured && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Stripe is already configured. You can update the configuration below.
            </AlertDescription>
          </Alert>
        )}
        <div>
          <Label>Secret Key</Label>
          <Input 
            type="password" 
            value={secretKey} 
            onChange={(e) => setSecretKey(e.target.value)} 
            placeholder="sk_test_..." 
          />
        </div>
        <div>
          <Label>Allowed Countries (comma-separated)</Label>
          <Input 
            value={countries} 
            onChange={(e) => setCountries(e.target.value)} 
            placeholder="IN,US,GB" 
          />
        </div>
        <Button onClick={handleSetConfig} disabled={setConfig.isPending}>
          {setConfig.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          {isConfigured ? 'Update Configuration' : 'Set Configuration'}
        </Button>
      </CardContent>
    </Card>
  );
});
