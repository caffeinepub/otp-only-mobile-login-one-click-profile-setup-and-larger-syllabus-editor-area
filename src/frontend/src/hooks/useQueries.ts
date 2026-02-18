import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { 
  UserProfile, 
  MockTest, 
  Course, 
  Syllabus, 
  TestResult,
  SessionState,
  ExternalBlob,
  ShoppingItem,
  StripeConfiguration
} from '../backend';
import { Principal } from '@icp-sdk/core/principal';

export type CheckoutSession = {
  id: string;
  url: string;
};

export function useGetSessionState() {
  const { actor, isFetching } = useActor();

  return useQuery<SessionState>({
    queryKey: ['sessionState'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getSessionState();
    },
    enabled: !!actor && !isFetching,
    staleTime: 1000 * 30,
    gcTime: 1000 * 60,
  });
}

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useUpdateProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      name: string;
      photo: ExternalBlob;
      mobile: string | null;
      gmail: string | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.updateProfile(data.name, data.photo, data.mobile, data.gmail);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      queryClient.invalidateQueries({ queryKey: ['sessionState'] });
    },
  });
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      await actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      queryClient.invalidateQueries({ queryKey: ['sessionState'] });
    },
  });
}

export function useUpdateProfilePicture() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (photo: ExternalBlob) => {
      if (!actor) throw new Error('Actor not available');
      await actor.updateProfilePicture(photo);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useGetAllMockTests() {
  const { actor, isFetching } = useActor();

  return useQuery<MockTest[]>({
    queryKey: ['mockTests'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllMockTests();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetMockTest(testId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<MockTest>({
    queryKey: ['mockTest', testId],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getMockTest(testId);
    },
    enabled: !!actor && !isFetching && !!testId,
  });
}

export function useAddMockTest() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { subject: string; questions: any[]; price: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.addMockTest(data.subject, data.questions, data.price);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mockTests'] });
    },
  });
}

export function useUpdateMockTest() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { testId: string; subject: string; questions: any[]; price: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.updateMockTest(data.testId, data.subject, data.questions, data.price);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mockTests'] });
    },
  });
}

export function useUpdateMockTestPrice() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { testId: string; newPrice: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.updateMockTestPrice(data.testId, data.newPrice);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mockTests'] });
    },
  });
}

export function useDeleteMockTest() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (testId: string) => {
      if (!actor) throw new Error('Actor not available');
      await actor.deleteMockTest(testId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mockTests'] });
    },
  });
}

export function useGetAllCourses() {
  const { actor, isFetching } = useActor();

  return useQuery<Course[]>({
    queryKey: ['courses'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllCourses();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetCourse(courseId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Course>({
    queryKey: ['course', courseId],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCourse(courseId);
    },
    enabled: !!actor && !isFetching && !!courseId,
  });
}

export function useAddCourse() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { title: string; description: string; subject: string; videos: any[] }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.addCourse(data.title, data.description, data.subject, data.videos);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
}

export function useUpdateCourse() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { courseId: string; title: string; description: string; subject: string; videos: any[] }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.updateCourse(data.courseId, data.title, data.description, data.subject, data.videos);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
}

export function useDeleteCourse() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (courseId: string) => {
      if (!actor) throw new Error('Actor not available');
      await actor.deleteCourse(courseId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
}

export function useGetAllSyllabi() {
  const { actor, isFetching } = useActor();

  return useQuery<Syllabus[]>({
    queryKey: ['syllabi'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllSyllabi();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetSyllabus(subject: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Syllabus>({
    queryKey: ['syllabus', subject],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getSyllabus(subject);
    },
    enabled: !!actor && !isFetching && !!subject,
  });
}

export function useAddSyllabus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { subject: string; topics: string[] }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.addSyllabus(data.subject, data.topics);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['syllabi'] });
    },
  });
}

export function useUpdateSyllabus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { subject: string; topics: string[] }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.updateSyllabus(data.subject, data.topics);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['syllabi'] });
    },
  });
}

export function useDeleteSyllabus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (subject: string) => {
      if (!actor) throw new Error('Actor not available');
      await actor.deleteSyllabus(subject);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['syllabi'] });
    },
  });
}

export function useGetTestResults(user: Principal) {
  const { actor, isFetching } = useActor();

  return useQuery<TestResult[]>({
    queryKey: ['testResults', user.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTestResults(user);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetUserTestResults(user: Principal) {
  return useGetTestResults(user);
}

export function useSubmitTestResult() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { testId: string; score: bigint; attempts: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.submitTestResult(data.testId, data.score, data.attempts);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testResults'] });
      queryClient.invalidateQueries({ queryKey: ['userProgress'] });
    },
  });
}

export function useGetUserProgress(user: Principal) {
  const { actor, isFetching } = useActor();

  return useQuery<{ totalTests: bigint; averageScore: bigint }>({
    queryKey: ['userProgress', user.toString()],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getUserProgress(user);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetUserPurchases(user: Principal) {
  const { actor, isFetching } = useActor();

  return useQuery<string[]>({
    queryKey: ['userPurchases', user.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getUserPurchases(user);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllUserProfiles() {
  const { actor, isFetching } = useActor();

  return useQuery<Array<[Principal, UserProfile]>>({
    queryKey: ['allUserProfiles'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllUserProfiles();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsStripeConfigured() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['stripeConfigured'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isStripeConfigured();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetStripeConfiguration() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (config: StripeConfiguration) => {
      if (!actor) throw new Error('Actor not available');
      await actor.setStripeConfiguration(config);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stripeConfigured'] });
    },
  });
}

export function useCreateCheckoutSession() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (items: ShoppingItem[]): Promise<CheckoutSession> => {
      if (!actor) throw new Error('Actor not available');
      const baseUrl = `${window.location.protocol}//${window.location.host}`;
      const successUrl = `${baseUrl}/payment-success`;
      const cancelUrl = `${baseUrl}/payment-failure`;
      
      const result = await actor.createCheckoutSession(items, successUrl, cancelUrl);
      
      // Critical: Validate and parse the JSON response
      let session: CheckoutSession;
      try {
        session = JSON.parse(result) as CheckoutSession;
      } catch (parseError) {
        console.error('Failed to parse checkout session:', parseError);
        throw new Error('Invalid checkout session response from server');
      }
      
      // Validate that the session has a valid URL
      if (!session || typeof session !== 'object') {
        throw new Error('Invalid checkout session format');
      }
      
      if (!session.url || typeof session.url !== 'string' || session.url.trim() === '') {
        console.error('Checkout session missing url:', session);
        throw new Error('Stripe session missing url. Please try again or contact support.');
      }
      
      return session;
    }
  });
}
