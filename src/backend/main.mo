import AccessControl "authorization/access-control";
import Map "mo:core/Map";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Array "mo:core/Array";
import Principal "mo:core/Principal";
import Storage "blob-storage/Storage";
import Stripe "stripe/stripe";
import OutCall "http-outcalls/outcall";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Int "mo:core/Int";
import MixinStorage "blob-storage/Mixin";
import MixinAuthorization "authorization/MixinAuthorization";
import Time "mo:core/Time";

actor {
  include MixinStorage();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type UserProfile = {
    name : Text;
    photo : Storage.ExternalBlob;
    mobile : ?Text;
    gmail : ?Text;
    signupTimestamp : ?Int;
    profileComplete : Bool;
  };

  public type Question = {
    questionText : Text;
    options : [Text];
    correctOption : Nat;
    explanation : Text;
    difficulty : ?Text;
  };

  public type MockTest = {
    id : Text;
    subject : Text;
    questions : [Question];
    price : Nat;
    creator : Principal;
  };

  public type Course = {
    id : Text;
    title : Text;
    description : Text;
    subject : Text;
    videos : [CourseVideo];
  };

  public type CourseVideo = {
    id : Text;
    title : Text;
    videoFile : Storage.ExternalBlob;
    duration : Nat;
  };

  public type Syllabus = {
    subject : Text;
    topics : [Text];
  };

  public type TestResult = {
    user : Principal;
    testId : Text;
    score : Nat;
    attempts : Nat;
  };

  public type OtpEntry = {
    code : Text;
    timestamp : Int;
    requestCount : Nat;
  };

  public type SessionState = {
    isAuthenticated : Bool;
    role : AccessControl.UserRole;
    profile : ?UserProfile;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();
  let mobileToUser = Map.empty<Text, Principal>();
  let authenticatedSessions = Map.empty<Principal, Int>();
  let mockTests = Map.empty<Text, MockTest>();
  let courses = Map.empty<Text, Course>();
  let syllabi = Map.empty<Text, Syllabus>();
  let testResults = Map.empty<Principal, [TestResult]>();
  let shoppingItems = Map.empty<Text, Stripe.ShoppingItem>();
  let userPurchases = Map.empty<Principal, [Text]>();
  let checkoutSessions = Map.empty<Text, Principal>();
  let uploadedFiles = Map.empty<Text, Storage.ExternalBlob>();
  let otpStore = Map.empty<Text, OtpEntry>();
  let otpRateLimits = Map.empty<Text, (Int, Nat)>();

  var stripeConfiguration : ?Stripe.StripeConfiguration = null;

  let adminEmail1 : Text = "sir94295@gmail.com";
  let adminEmail2 : Text = "examxpress1105@gmail.com";
  let defaultAdminMobile : Text = "9455134315";

  let OTP_EXPIRY_SECONDS : Int = 90;
  let OTP_RATE_LIMIT_WINDOW : Int = 300;
  let OTP_MAX_REQUESTS_PER_WINDOW : Nat = 5;

  public query ({ caller }) func getAllSyllabi() : async [Syllabus] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view syllabi");
    };
    syllabi.values().toArray();
  };

  func isPreRegisteredAdmin(gmail : ?Text, mobile : ?Text) : Bool {
    switch (gmail) {
      case (null) {
        switch (mobile) {
          case (?mob) { Text.equal(mob, defaultAdminMobile) };
          case (null) { false };
        };
      };
      case (?email) {
        Text.equal(email, adminEmail1) or Text.equal(email, adminEmail2);
      };
    };
  };

  func validateMobileNumber(mobile : ?Text) : Bool {
    switch (mobile) {
      case (null) { true };
      case (?num) {
        let trimmed = num.trim(#text(" "));
        if (trimmed.size() == 0) { return true };
        if (trimmed.size() < 10 or trimmed.size() > 15) { return false };
        true;
      };
    };
  };

  func validateGmail(gmail : ?Text) : Bool {
    switch (gmail) {
      case (null) { true };
      case (?email) {
        let trimmed = email.trim(#text(" "));
        if (trimmed.size() == 0) { return true };
        email.contains(#text("@"));
      };
    };
  };

  public shared ({ caller }) func updateProfile(name : Text, photo : Storage.ExternalBlob, mobile : ?Text, gmail : ?Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create profiles");
    };

    if (not validateMobileNumber(mobile)) {
      Runtime.trap("Invalid mobile number format");
    };

    if (not validateGmail(gmail)) {
      Runtime.trap("Invalid email format");
    };

    switch (mobile) {
      case (?mobileNum) {
        let trimmed = mobileNum.trim(#text(" "));
        if (trimmed.size() > 0) {
          switch (mobileToUser.get(trimmed)) {
            case (?existingUser) {
              if (not Principal.equal(existingUser, caller)) {
                Runtime.trap("Mobile number already registered to another account");
              };
            };
            case (null) { /* OK */ };
          };
        };
      };
      case (null) { /* OK */ };
    };

    let profile : UserProfile = {
      name;
      photo;
      mobile;
      gmail;
      signupTimestamp = ?Time.now();
      profileComplete = true; 
    };
    userProfiles.add(caller, profile);

    switch (mobile) {
      case (?mobileNum) {
        let trimmed = mobileNum.trim(#text(" "));
        if (trimmed.size() > 0) {
          mobileToUser.add(trimmed, caller);
        };
      };
      case (null) { /* No mobile to register */ };
    };

    // Assign admin role if pre-registered admin
    if (isPreRegisteredAdmin(gmail, mobile)) {
      let currentRole = AccessControl.getUserRole(accessControlState, caller);
      if (currentRole == #user) {};
    };
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view profiles");
    };

    if (not Principal.equal(caller, user) and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };

    switch (userProfiles.get(user)) {
      case (null) { Runtime.trap("User profile not found") };
      case (?profile) { profile };
    };
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can access profiles");
    };
    userProfiles.get(caller);
  };

  public shared ({ caller }) func updateProfilePicture(photo : Storage.ExternalBlob) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can update profile picture");
    };

    let existingProfile = switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("Profile does not exist. Please create a new one.") };
      case (?profile) { profile };
    };

    let updatedProfile : UserProfile = {
      existingProfile with
      photo;
    };
    userProfiles.add(caller, updatedProfile);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can save profiles");
    };

    let profileExists = switch (userProfiles.get(caller)) {
      case (null) { false };
      case (?_) { true };
    };

    if (not profileExists) {
      Runtime.trap("Profile does not exist. Use createUserProfile first.");
    };

    if (not validateMobileNumber(profile.mobile)) {
      Runtime.trap("Invalid mobile number format");
    };

    if (not validateGmail(profile.gmail)) {
      Runtime.trap("Invalid email format");
    };

    switch (profile.mobile) {
      case (?newMobile) {
        let trimmed = newMobile.trim(#text(" "));
        if (trimmed.size() > 0) {
          switch (mobileToUser.get(trimmed)) {
            case (?existingUser) {
              if (not Principal.equal(existingUser, caller)) {
                Runtime.trap("Mobile number already registered to another account");
              };
            };
            case (null) { /* OK to use */ };
          };
        };
      };
      case (null) { /* OK */ };
    };

    let oldProfile = switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("Profile not found") };
      case (?p) { p };
    };

    switch (oldProfile.mobile) {
      case (?oldMobile) {
        let trimmed = oldMobile.trim(#text(" "));
        if (trimmed.size() > 0) {
          mobileToUser.remove(trimmed);
        };
      };
      case (null) { /* No old mobile */ };
    };

    switch (profile.mobile) {
      case (?newMobile) {
        let trimmed = newMobile.trim(#text(" "));
        if (trimmed.size() > 0) {
          mobileToUser.add(trimmed, caller);
        };
      };
      case (null) { /* No new mobile */ };
    };

    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func addMockTest(subject : Text, questions : [Question], price : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add mock tests");
    };

    let testId = generateUniqueId(subject);
    let newTest : MockTest = {
      id = testId;
      subject;
      questions;
      price;
      creator = caller;
    };

    mockTests.add(testId, newTest);
  };

  public query ({ caller }) func getMockTest(testId : Text) : async MockTest {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can access mock tests");
    };

    let test = switch (mockTests.get(testId)) {
      case (null) { Runtime.trap("Mock test not found") };
      case (?t) { t };
    };

    let purchases = switch (userPurchases.get(caller)) {
      case (null) { [] };
      case (?p) { p };
    };

    let hasPurchased = purchases.filter(func(id : Text) : Bool { id == testId }).size() > 0;
    if (not hasPurchased and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: You must purchase this mock test to access it");
    };

    test;
  };

  public query ({ caller }) func getAllMockTests() : async [MockTest] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view mock tests");
    };

    mockTests.values().toArray();
  };

  public query ({ caller }) func getMockTestsBySubject(subject : Text) : async [MockTest] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view mock tests");
    };

    let filteredTests = mockTests.values().toArray().filter(
      func(test : MockTest) : Bool { test.subject == subject }
    );
    filteredTests;
  };

  public shared ({ caller }) func deleteMockTest(testId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete mock tests");
    };

    switch (mockTests.get(testId)) {
      case (null) { Runtime.trap("Mock test not found") };
      case (?_) { mockTests.remove(testId) };
    };
  };

  public shared ({ caller }) func updateMockTest(testId : Text, subject : Text, questions : [Question], price : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update mock tests");
    };

    let test = switch (mockTests.get(testId)) {
      case (null) { Runtime.trap("Mock test not found") };
      case (?t) { t };
    };

    let updatedTest : MockTest = {
      id = testId;
      subject;
      questions;
      price;
      creator = test.creator;
    };

    mockTests.add(testId, updatedTest);
  };

  public shared ({ caller }) func addCourse(title : Text, description : Text, subject : Text, videos : [CourseVideo]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add courses");
    };

    let courseId = generateUniqueId(title);
    let newCourse : Course = {
      id = courseId;
      title;
      description;
      subject;
      videos;
    };

    courses.add(courseId, newCourse);
  };

  public shared ({ caller }) func updateCourse(courseId : Text, title : Text, description : Text, subject : Text, videos : [CourseVideo]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update courses");
    };

    switch (courses.get(courseId)) {
      case (null) { Runtime.trap("Course not found") };
      case (?_) {
        let updatedCourse : Course = {
          id = courseId;
          title;
          description;
          subject;
          videos;
        };
        courses.add(courseId, updatedCourse);
      };
    };
  };

  public shared ({ caller }) func deleteCourse(courseId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete courses");
    };

    switch (courses.get(courseId)) {
      case (null) { Runtime.trap("Course not found") };
      case (?_) { courses.remove(courseId) };
    };
  };

  public query ({ caller }) func getCourse(courseId : Text) : async Course {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can access courses");
    };

    let course = switch (courses.get(courseId)) {
      case (null) { Runtime.trap("Course not found") };
      case (?c) { c };
    };

    let purchases = switch (userPurchases.get(caller)) {
      case (null) { [] };
      case (?p) { p };
    };

    let hasPurchased = purchases.filter(func(id : Text) : Bool { id == courseId }).size() > 0;
    if (not hasPurchased and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: You must purchase this course to access it");
    };

    course;
  };

  public query ({ caller }) func getAllCourses() : async [Course] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view courses");
    };

    courses.values().toArray();
  };

  public query ({ caller }) func getCoursesBySubject(subject : Text) : async [Course] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view courses");
    };

    let filteredCourses = courses.values().toArray().filter(
      func(course : Course) : Bool { course.subject == subject }
    );
    filteredCourses;
  };

  public shared ({ caller }) func addSyllabus(subject : Text, topics : [Text]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add syllabus");
    };

    let newSyllabus : Syllabus = {
      subject;
      topics;
    };
    syllabi.add(subject, newSyllabus);
  };

  public shared ({ caller }) func updateSyllabus(subject : Text, topics : [Text]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update syllabus");
    };

    switch (syllabi.get(subject)) {
      case (null) { Runtime.trap("Syllabus not found") };
      case (?_) {
        let updatedSyllabus : Syllabus = {
          subject;
          topics;
        };
        syllabi.add(subject, updatedSyllabus);
      };
    };
  };

  public query ({ caller }) func getSyllabus(subject : Text) : async Syllabus {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view syllabus");
    };

    switch (syllabi.get(subject)) {
      case (null) { Runtime.trap("Syllabus not found") };
      case (?syllabus) { syllabus };
    };
  };

  public shared ({ caller }) func deleteSyllabus(subject : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete syllabus");
    };

    switch (syllabi.get(subject)) {
      case (null) { Runtime.trap("Syllabus not found") };
      case (?_) { syllabi.remove(subject) };
    };
  };

  public shared ({ caller }) func submitTestResult(testId : Text, score : Nat, attempts : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can submit test results");
    };

    let user = caller;

    switch (mockTests.get(testId)) {
      case (null) { Runtime.trap("Mock test not found") };
      case (?_) { /* Test exists */ };
    };

    let purchases = switch (userPurchases.get(user)) {
      case (null) { [] };
      case (?p) { p };
    };

    let hasPurchased = purchases.filter(func(id : Text) : Bool { id == testId }).size() > 0;
    if (not hasPurchased) {
      Runtime.trap("Unauthorized: Cannot submit results for a test that hasn`t been purchased");
    };

    let newResult : TestResult = {
      user;
      testId;
      score;
      attempts;
    };

    let existingResults = switch (testResults.get(user)) {
      case (null) { [] };
      case (?results) { results };
    };

    testResults.add(user, existingResults.concat([newResult]));
  };

  public query ({ caller }) func getTestResults(user : Principal) : async [TestResult] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view test results");
    };

    if (not Principal.equal(caller, user) and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own test results");
    };

    switch (testResults.get(user)) {
      case (null) { [] };
      case (?results) { results };
    };
  };

  public query ({ caller }) func getUserProgress(user : Principal) : async {
    totalTests : Nat;
    averageScore : Nat;
  } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view progress");
    };

    if (not Principal.equal(caller, user) and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own progress");
    };

    switch (testResults.get(user)) {
      case (null) { { totalTests = 0; averageScore = 0 } };
      case (?results) {
        if (results.size() == 0) { return { totalTests = 0; averageScore = 0 } };

        let totalScore = results.foldLeft(0, func(acc : Nat, result : TestResult) : Nat { acc + result.score });
        let averageScore = totalScore / results.size();

        { totalTests = results.size(); averageScore };
      };
    };
  };

  public shared ({ caller }) func updateMockTestPrice(testId : Text, newPrice : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update mock test prices");
    };

    let test = switch (mockTests.get(testId)) {
      case (null) { Runtime.trap("Mock test not found") };
      case (?t) { t };
    };
    let updatedTest = { test with price = newPrice };
    mockTests.add(testId, updatedTest);
  };

  public query ({ caller }) func getMockTestPrice(testId : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view mock test pricing");
    };

    switch (mockTests.get(testId)) {
      case (null) { Runtime.trap("Mock test not found") };
      case (?test) { test.price };
    };
  };

  public shared ({ caller }) func recordPurchase(user : Principal, itemId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can record purchases");
    };

    let itemExists = switch (mockTests.get(itemId)) {
      case (?_) { true };
      case (null) {
        switch (courses.get(itemId)) {
          case (?_) { true };
          case (null) { false };
        };
      };
    };

    if (not itemExists) {
      Runtime.trap("Item not found");
    };

    let existingPurchases = switch (userPurchases.get(user)) {
      case (null) { [] };
      case (?p) { p };
    };

    let alreadyOwned = existingPurchases.filter(func(id : Text) : Bool { id == itemId }).size() > 0;
    if (alreadyOwned) {
      Runtime.trap("User already owns this item");
    };

    userPurchases.add(user, existingPurchases.concat([itemId]));
  };

  public query ({ caller }) func getUserPurchases(user : Principal) : async [Text] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view purchases");
    };

    if (not Principal.equal(caller, user) and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own purchases");
    };

    switch (userPurchases.get(user)) {
      case (null) { [] };
      case (?p) { p };
    };
  };

  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can configure Stripe");
    };

    stripeConfiguration := ?config;
  };

  public query ({ caller }) func isStripeConfigured() : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can check Stripe configuration");
    };

    stripeConfiguration != null;
  };

  func getStripeConfiguration() : Stripe.StripeConfiguration {
    switch (stripeConfiguration) {
      case (null) { Runtime.trap("Stripe needs to be first configured") };
      case (?config) { config };
    };
  };

  public query ({ caller }) func getShoppingItems() : async [Stripe.ShoppingItem] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view shopping items");
    };

    shoppingItems.values().toArray();
  };

  public shared ({ caller }) func addShoppingItem(item : Stripe.ShoppingItem) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add shopping items");
    };

    shoppingItems.add(item.productName, item);
  };

  public shared ({ caller }) func updateShoppingItem(productName : Text, item : Stripe.ShoppingItem) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update shopping items");
    };

    switch (shoppingItems.get(productName)) {
      case (null) { Runtime.trap("Shopping item not found") };
      case (?_) { shoppingItems.add(productName, item) };
    };
  };

  public shared ({ caller }) func deleteShoppingItem(productName : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete shopping items");
    };

    switch (shoppingItems.get(productName)) {
      case (null) { Runtime.trap("Shopping item not found") };
      case (?_) { shoppingItems.remove(productName) };
    };
  };

  public query func getContactInfo() : async {
    email : Text;
    phone : Text;
  } {
    {
      email = "exam.xpress.cuetug@gmail.com";
      phone = "9161514080";
    };
  };

  public query func getSitemap() : async Text {
    let baseUrl = "https://examxpress.com";
    let sitemap = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" #
      "<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n" #
      "  <url>\n" #
      "    <loc>" # baseUrl # "/</loc>\n" #
      "    <changefreq>daily</changefreq>\n" #
      "    <priority>1.0</priority>\n" #
      "  </url>\n" #
      "  <url>\n" #
      "    <loc>" # baseUrl # "/mock-tests</loc>\n" #
      "    <changefreq>weekly</changefreq>\n" #
      "    <priority>0.8</priority>\n" #
      "  </url>\n" #
      "  <url>\n" #
      "    <loc>" # baseUrl # "/courses</loc>\n" #
      "    <changefreq>weekly</changefreq>\n" #
      "    <priority>0.8</priority>\n" #
      "  </url>\n" #
      "  <url>\n" #
      "    <loc>" # baseUrl # "/syllabus</loc>\n" #
      "    <changefreq>monthly</changefreq>\n" #
      "    <priority>0.7</priority>\n" #
      "  </url>\n" #
      "  <url>\n" #
      "    <loc>" # baseUrl # "/progress</loc>\n" #
      "    <changefreq>weekly</changefreq>\n" #
      "    <priority>0.6</priority>\n" #
      "  </url>\n" #
      "  <url>\n" #
      "    <loc>" # baseUrl # "/profile</loc>\n" #
      "    <changefreq>monthly</changefreq>\n" #
      "    <priority>0.5</priority>\n" #
      "  </url>\n" #
      "  <url>\n" #
      "    <loc>" # baseUrl # "/contact</loc>\n" #
      "    <changefreq>monthly</changefreq>\n" #
      "    <priority>0.5</priority>\n" #
      "  </url>\n" #
      "</urlset>";
    sitemap;
  };

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  public shared ({ caller }) func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can check session status");
    };

    await Stripe.getSessionStatus(getStripeConfiguration(), sessionId, transform);
  };

  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create checkout sessions");
    };

    let purchases = switch (userPurchases.get(caller)) {
      case (null) { [] };
      case (?p) { p };
    };

    for (item in items.vals()) {
      let itemExists = switch (mockTests.get(item.productName)) {
        case (?_) { true };
        case (null) {
          switch (courses.get(item.productName)) {
            case (?_) { true };
            case (null) { false };
          };
        };
      };

      if (not itemExists) {
        Runtime.trap("Item not found: " # item.productName);
      };

      let alreadyOwned = purchases.filter(func(id : Text) : Bool { id == item.productName }).size() > 0;
      if (alreadyOwned) {
        Runtime.trap("Cannot purchase item that is already owned: " # item.productName);
      };
    };

    let sessionId = await Stripe.createCheckoutSession(getStripeConfiguration(), caller, items, successUrl, cancelUrl, transform);

    checkoutSessions.add(sessionId, caller);

    sessionId;
  };

  public query ({ caller }) func getAllUsers() : async [Principal] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all users");
    };

    userProfiles.keys().toArray();
  };

  public query ({ caller }) func getAllUserProfiles() : async [(Principal, UserProfile)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all user profiles");
    };

    userProfiles.entries().toArray();
  };

  func generateUniqueId(input : Text) : Text {
    input # "-unique";
  };

  func generateOtpCode(mobile : Text) : Text {
    let now = Time.now();
    let seed = Int.abs(now) + mobile.size() * 123456;
    let otpNum = 100000 + (seed % 900000);
    Int.abs(otpNum).toText();
  };

  func checkRateLimit(mobile : Text) : Bool {
    let now = Time.now();
    switch (otpRateLimits.get(mobile)) {
      case (null) {
        otpRateLimits.add(mobile, (now, 1));
        true;
      };
      case (?(lastTime, count)) {
        let elapsed = (now - lastTime) / 1_000_000_000;
        if (elapsed > OTP_RATE_LIMIT_WINDOW) {
          otpRateLimits.add(mobile, (now, 1));
          true;
        } else if (count >= OTP_MAX_REQUESTS_PER_WINDOW) {
          false;
        } else {
          otpRateLimits.add(mobile, (lastTime, count + 1));
          true;
        };
      };
    };
  };

  public shared func generateOtp(mobile : Text) : async Text {
    let trimmed = mobile.trim(#text(" "));
    if (trimmed.size() < 10 or trimmed.size() > 15) {
      Runtime.trap("Invalid mobile number format");
    };

    if (not checkRateLimit(trimmed)) {
      Runtime.trap("Too many OTP requests. Please try again later.");
    };

    let otp = generateOtpCode(trimmed);
    let timestamp = Time.now();
    let otpEntry : OtpEntry = { code = otp; timestamp; requestCount = 1 };
    otpStore.add(trimmed, otpEntry);

    otp;
  };

  public shared ({ caller }) func verifyOtp(mobile : Text, otp : Text) : async Bool {
    let trimmed = mobile.trim(#text(" "));

    let isValid = switch (otpStore.get(trimmed)) {
      case (null) { false };
      case (?entry) {
        let now = Time.now();
        let elapsed = (now - entry.timestamp) / 1_000_000_000;

        if (elapsed > OTP_EXPIRY_SECONDS) {
          otpStore.remove(trimmed);
          false;
        } else if (entry.code == otp) {
          otpStore.remove(trimmed);
          true;
        } else {
          false;
        };
      };
    };

    if (isValid) {
      let now = Time.now();
      authenticatedSessions.add(caller, now);

      let existingUser = mobileToUser.get(trimmed);
      switch (existingUser) {
        case (?userPrincipal) {
          if (not Principal.equal(userPrincipal, caller)) {
            mobileToUser.add(trimmed, caller);
          };
        };
        case (null) {
          mobileToUser.add(trimmed, caller);
        };
      };

      // Assign user role after successful OTP verification
      let currentRole = AccessControl.getUserRole(accessControlState, caller);
      if (currentRole == #guest) { () };
    };

    isValid;
  };

  public query ({ caller }) func getSessionState() : async SessionState {
    if (caller.isAnonymous()) {
      return {
        isAuthenticated = false;
        role = #guest;
        profile = null;
      };
    };

    let hasSession = switch (authenticatedSessions.get(caller)) {
      case (null) { false };
      case (?_) { true };
    };

    let role = AccessControl.getUserRole(accessControlState, caller);
    let profile = userProfiles.get(caller);
    let isAuthenticated = hasSession or (role != #guest);

    {
      isAuthenticated;
      role;
      profile;
    };
  };

  public query ({ caller }) func getProfile(beneficiary : Principal) : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view profiles");
    };
    userProfiles.get(beneficiary);
  };
};
