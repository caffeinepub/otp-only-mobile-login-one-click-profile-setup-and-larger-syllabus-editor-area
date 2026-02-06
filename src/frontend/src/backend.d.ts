import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface SessionState {
    role: UserRole;
    isAuthenticated: boolean;
    profile?: UserProfile;
}
export interface MockTest {
    id: string;
    creator: Principal;
    subject: string;
    questions: Array<Question>;
    price: bigint;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface CourseVideo {
    id: string;
    title: string;
    duration: bigint;
    videoFile: ExternalBlob;
}
export interface http_header {
    value: string;
    name: string;
}
export interface TestResult {
    user: Principal;
    attempts: bigint;
    score: bigint;
    testId: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface Course {
    id: string;
    title: string;
    subject: string;
    description: string;
    videos: Array<CourseVideo>;
}
export interface ShoppingItem {
    productName: string;
    currency: string;
    quantity: bigint;
    priceInCents: bigint;
    productDescription: string;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export type StripeSessionStatus = {
    __kind__: "completed";
    completed: {
        userPrincipal?: string;
        response: string;
    };
} | {
    __kind__: "failed";
    failed: {
        error: string;
    };
};
export interface StripeConfiguration {
    allowedCountries: Array<string>;
    secretKey: string;
}
export interface Question {
    correctOption: bigint;
    difficulty?: string;
    explanation: string;
    questionText: string;
    options: Array<string>;
}
export interface Syllabus {
    subject: string;
    topics: Array<string>;
}
export interface UserProfile {
    name: string;
    signupTimestamp?: bigint;
    gmail?: string;
    mobile?: string;
    photo: ExternalBlob;
    profileComplete: boolean;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addCourse(title: string, description: string, subject: string, videos: Array<CourseVideo>): Promise<void>;
    addMockTest(subject: string, questions: Array<Question>, price: bigint): Promise<void>;
    addShoppingItem(item: ShoppingItem): Promise<void>;
    addSyllabus(subject: string, topics: Array<string>): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createCheckoutSession(items: Array<ShoppingItem>, successUrl: string, cancelUrl: string): Promise<string>;
    deleteCourse(courseId: string): Promise<void>;
    deleteMockTest(testId: string): Promise<void>;
    deleteShoppingItem(productName: string): Promise<void>;
    deleteSyllabus(subject: string): Promise<void>;
    generateOtp(mobile: string): Promise<string>;
    getAllCourses(): Promise<Array<Course>>;
    getAllMockTests(): Promise<Array<MockTest>>;
    getAllSyllabi(): Promise<Array<Syllabus>>;
    getAllUserProfiles(): Promise<Array<[Principal, UserProfile]>>;
    getAllUsers(): Promise<Array<Principal>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getContactInfo(): Promise<{
        email: string;
        phone: string;
    }>;
    getCourse(courseId: string): Promise<Course>;
    getCoursesBySubject(subject: string): Promise<Array<Course>>;
    getMockTest(testId: string): Promise<MockTest>;
    getMockTestPrice(testId: string): Promise<bigint>;
    getMockTestsBySubject(subject: string): Promise<Array<MockTest>>;
    getProfile(beneficiary: Principal): Promise<UserProfile | null>;
    getSessionState(): Promise<SessionState>;
    getShoppingItems(): Promise<Array<ShoppingItem>>;
    getSitemap(): Promise<string>;
    getStripeSessionStatus(sessionId: string): Promise<StripeSessionStatus>;
    getSyllabus(subject: string): Promise<Syllabus>;
    getTestResults(user: Principal): Promise<Array<TestResult>>;
    getUserProfile(user: Principal): Promise<UserProfile>;
    getUserProgress(user: Principal): Promise<{
        totalTests: bigint;
        averageScore: bigint;
    }>;
    getUserPurchases(user: Principal): Promise<Array<string>>;
    isCallerAdmin(): Promise<boolean>;
    isStripeConfigured(): Promise<boolean>;
    recordPurchase(user: Principal, itemId: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setStripeConfiguration(config: StripeConfiguration): Promise<void>;
    submitTestResult(testId: string, score: bigint, attempts: bigint): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    updateCourse(courseId: string, title: string, description: string, subject: string, videos: Array<CourseVideo>): Promise<void>;
    updateMockTest(testId: string, subject: string, questions: Array<Question>, price: bigint): Promise<void>;
    updateMockTestPrice(testId: string, newPrice: bigint): Promise<void>;
    updateProfile(name: string, photo: ExternalBlob, mobile: string | null, gmail: string | null): Promise<void>;
    updateProfilePicture(photo: ExternalBlob): Promise<void>;
    updateShoppingItem(productName: string, item: ShoppingItem): Promise<void>;
    updateSyllabus(subject: string, topics: Array<string>): Promise<void>;
    verifyOtp(mobile: string, otp: string): Promise<boolean>;
}
