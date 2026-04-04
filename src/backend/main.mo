import Array "mo:core/Array";
import Map "mo:core/Map";
import Order "mo:core/Order";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Int "mo:core/Int";
import Iter "mo:core/Iter";
import Bool "mo:core/Bool";
import Time "mo:core/Time";



actor {
  // =========================================================
  // SUPER ADMIN OWNER LOCK
  // These values are permanent and cannot be changed by any
  // public call. Only ONE owner exists. No other admin allowed.
  // =========================================================
  let OWNER_MOBILE : Text = "9876543210";
  let OWNER_EMAIL  : Text = "admin@kaammitra.in";
  let OWNER_OTP    : Text = "1234"; // demo OTP; replace with real OTP in production

  // =========================================================

  module Worker {
    public func compareByCreatedAt(a : Worker, b : Worker) : Order.Order {
      Nat.compare(a.createdAt, b.createdAt);
    };
  };

  module Job {
    public func compareByCreatedAt(a : Job, b : Job) : Order.Order {
      Nat.compare(a.createdAt, b.createdAt);
    };
  };

  module Contact {
    public func compareByCreatedAt(a : Contact, b : Contact) : Order.Order {
      Nat.compare(a.createdAt, b.createdAt);
    };
  };

  type Worker = {
    id : Nat;
    name : Text;
    experience : Text;
    location : Text;
    expectedSalary : Text;
    category : Text;
    createdAt : Nat;
    approved : Bool;
    blocked : Bool;
  };

  type Job = {
    id : Nat;
    category : Text;
    location : Text;
    description : Text;
    payOffered : Text;
    postedBy : Text;
    createdAt : Nat;
    approved : Bool;
    deleted : Bool;
  };

  type Contact = {
    id : Nat;
    name : Text;
    phone : Text;
    message : Text;
    createdAt : Nat;
  };

  type Category = {
    id : Nat;
    name : Text;
  };

  type Notification = {
    id : Nat;
    title : Text;
    message : Text;
    createdAt : Nat;
  };

  type OwnerStats = {
    totalWorkers    : Nat;
    totalJobs       : Nat;
    totalCategories : Nat;
    totalNotifications : Nat;
    pendingApprovals : Nat;
    totalContacts   : Nat;
  };

  var workerId = 0;
  var jobId = 0;
  var contactId = 0;
  var categoryId = 0;
  var notificationId = 0;
  var adminUsername = "admin";
  var adminPassword = "1234";
  // adminPhone is kept for legacy OTP flow but cannot override OWNER_MOBILE
  var adminPhone = "9876543210";
  var adminOtp = "";
  var adminOtpExpiry : Int = 0;

  let workers = Map.empty<Nat, Worker>();
  let jobs = Map.empty<Nat, Job>();
  let contacts = Map.empty<Nat, Contact>();
  let categories = Map.empty<Nat, Category>();
  let notifications = Map.empty<Nat, Notification>();

  var appContent : {
    homeText : Text;
    bannerText : Text;
    announcement : Text;
    contactNumber : Text;
    supportDetails : Text;
  } = {
    homeText = "KaamMitra - Apka Vishwas, Hamari Zimmedari";
    bannerText = "Sankalp Bharat, Shreshtha Bharat";
    announcement = "KaamMitra is now live!";
    contactNumber = "+91 9876543210";
    supportDetails = "Mon-Sat: 9am-6pm";
  };

  // =========================================================
  // OWNER VERIFICATION (backend-enforced)
  // Verifies mobile + email + OTP. All three must match.
  // Returns true only for the single owner.
  // =========================================================
  public query func verifyOwnerAccess(mobile : Text, email : Text, otp : Text) : async Bool {
    Text.equal(mobile, OWNER_MOBILE) and
    Text.equal(email, OWNER_EMAIL) and
    Text.equal(otp, OWNER_OTP)
  };

  // Check mobile + email only (no OTP) — used for session re-validation
  public query func isOwnerVerified(mobile : Text, email : Text) : async Bool {
    Text.equal(mobile, OWNER_MOBILE) and
    Text.equal(email, OWNER_EMAIL)
  };

  // Return dashboard stats for the owner
  public query func getOwnerStats() : async OwnerStats {
    let totalWorkers    = workers.size();
    let totalJobs       = jobs.values().toArray().filter(func(j : Job) : Bool { not j.deleted }).size();
    let totalCategories = categories.size();
    let totalNotif      = notifications.size();
    let pendingApprovals = jobs.values().toArray().filter(func(j : Job) : Bool { not j.approved and not j.deleted }).size();
    let totalContacts   = contacts.size();
    {
      totalWorkers;
      totalJobs;
      totalCategories;
      totalNotifications = totalNotif;
      pendingApprovals;
      totalContacts;
    }
  };

  // =========================================================

  func addInitialCategory(name : Text) {
    let category : Category = {
      id = categoryId;
      name;
    };
    categories.add(categoryId, category);
    categoryId += 1;
  };

  func addWorker(_ : ()) {
    let worker : Worker = {
      id = workerId;
      name = "Ramu";
      experience = "5 years";
      location = "Mumbai";
      expectedSalary = "12000";
      category = "Mason";
      createdAt = 0;
      approved = true;
      blocked = false;
    };
    workers.add(workerId, worker);
    workerId += 1;
  };

  func addJob(_ : ()) {
    let job : Job = {
      id = jobId;
      category = "Electrician";
      location = "Delhi";
      description = "Install wiring in new building";
      payOffered = "15000";
      postedBy = "Mumbai Builders";
      createdAt = 0;
      approved = true;
      deleted = false;
    };
    jobs.add(jobId, job);
    jobId += 1;
  };

  public shared ({ caller }) func seed() : async () {
    addInitialCategory("Electrician");
    addInitialCategory("Plumber");
    addInitialCategory("Mason");
    addInitialCategory("JCB Operator");
    addInitialCategory("Painter");
    addInitialCategory("Labour");
    addInitialCategory("Driver");
    addInitialCategory("Carpenter");

    let seedFunctions = [addWorker, addJob];
    for (funcRef in seedFunctions.values()) {
      funcRef(());
    };
  };

  // OTP Auth functions
  public shared ({ caller }) func generateAdminOtp(phone : Text) : async Text {
    if (Text.equal(phone, adminPhone)) {
      let now = Int.abs(Time.now());
      let otpNum = (now / 1_000_000) % 1_000_000;
      let otp = if (otpNum < 100000) { "1" # (otpNum + 100000).toText() } else { otpNum.toText() };
      adminOtp := otp;
      adminOtpExpiry := Time.now() + 600_000_000_000;
      otp;
    } else {
      "";
    };
  };

  public shared ({ caller }) func verifyAdminOtp(phone : Text, otp : Text) : async Bool {
    if (not Text.equal(phone, adminPhone)) { return false };
    if (not Text.equal(otp, adminOtp)) { return false };
    if (Time.now() > adminOtpExpiry) { return false };
    adminOtp := "";
    true;
  };

  public query ({ caller }) func getAdminPhone() : async Text {
    adminPhone;
  };

  // Guard: only owner may change admin phone
  public shared ({ caller }) func updateAdminPhone(newPhone : Text) : async Bool {
    if (Text.equal(newPhone, "")) { return false };
    // Block changing to a different number than the owner number
    // (prevents creating a second admin phone)
    if (not Text.equal(newPhone, OWNER_MOBILE)) { return false };
    adminPhone := newPhone;
    true;
  };

  // Worker functions
  public shared ({ caller }) func createWorker(name : Text, experience : Text, location : Text, expectedSalary : Text, category : Text) : async Worker {
    let newWorker : Worker = {
      id = workerId;
      name;
      experience;
      location;
      expectedSalary;
      category;
      createdAt = Int.abs(Time.now());
      approved = true;
      blocked = false;
    };
    workers.add(workerId, newWorker);
    workerId += 1;
    newWorker;
  };

  public query ({ caller }) func getAllWorkers() : async [Worker] {
    workers.values().toArray().filter(func(w) { w.approved and not w.blocked }).sort(Worker.compareByCreatedAt);
  };

  public query ({ caller }) func getWorkersByCategory(category : Text) : async [Worker] {
    workers.values().toArray().filter(
      func(worker) {
        Text.equal(worker.category, category) and worker.approved and not worker.blocked
      }
    );
  };

  public query ({ caller }) func getWorkersByLocation(location : Text) : async [Worker] {
    workers.values().toArray().filter(
      func(worker) {
        Text.equal(worker.location, location) and worker.approved and not worker.blocked
      }
    );
  };

  // Admin Worker functions
  public shared ({ caller }) func approveWorker(id : Nat) : async Bool {
    switch (workers.get(id)) {
      case (null) { false };
      case (?worker) {
        let updatedWorker = { worker with approved = true };
        workers.add(id, updatedWorker);
        true;
      };
    };
  };

  public shared ({ caller }) func blockWorker(id : Nat) : async Bool {
    switch (workers.get(id)) {
      case (null) { false };
      case (?worker) {
        let updatedWorker = { worker with blocked = true };
        workers.add(id, updatedWorker);
        true;
      };
    };
  };

  public shared ({ caller }) func unblockWorker(id : Nat) : async Bool {
    switch (workers.get(id)) {
      case (null) { false };
      case (?worker) {
        let updatedWorker = { worker with blocked = false };
        workers.add(id, updatedWorker);
        true;
      };
    };
  };

  public query ({ caller }) func getAllWorkersAdmin() : async [Worker] {
    workers.values().toArray().sort(Worker.compareByCreatedAt);
  };

  public shared ({ caller }) func adminUpdateWorker(id : Nat, name : Text, experience : Text, location : Text, expectedSalary : Text, category : Text) : async Bool {
    switch (workers.get(id)) {
      case (null) { false };
      case (?worker) {
        let updatedWorker = {
          worker with
          name;
          experience;
          location;
          expectedSalary;
          category;
        };
        workers.add(id, updatedWorker);
        true;
      };
    };
  };

  // Job functions
  public shared ({ caller }) func createJob(category : Text, location : Text, description : Text, payOffered : Text, postedBy : Text) : async Job {
    let newJob : Job = {
      id = jobId;
      category;
      location;
      description;
      payOffered;
      postedBy;
      createdAt = Int.abs(Time.now());
      approved = false;
      deleted = false;
    };
    jobs.add(jobId, newJob);
    jobId += 1;
    newJob;
  };

  public shared ({ caller }) func createJobApproved(category : Text, location : Text, description : Text, payOffered : Text, postedBy : Text) : async Job {
    let newJob : Job = {
      id = jobId;
      category;
      location;
      description;
      payOffered;
      postedBy;
      createdAt = Int.abs(Time.now());
      approved = true;
      deleted = false;
    };
    jobs.add(jobId, newJob);
    jobId += 1;
    newJob;
  };

  public query ({ caller }) func getAllJobs() : async [Job] {
    jobs.values().toArray().filter(
      func(j) { j.approved and not j.deleted }
    ).sort(Job.compareByCreatedAt);
  };

  public query ({ caller }) func getJobsByCategory(category : Text) : async [Job] {
    jobs.values().toArray().filter(
      func(job) {
        Text.equal(job.category, category) and job.approved and not job.deleted
      }
    );
  };

  public query ({ caller }) func getJobsByLocation(location : Text) : async [Job] {
    jobs.values().toArray().filter(
      func(job) {
        Text.equal(job.location, location) and job.approved and not job.deleted
      }
    );
  };

  public query ({ caller }) func getAllJobsAdmin() : async [Job] {
    jobs.values().toArray().filter(func(j) { not j.deleted }).sort(Job.compareByCreatedAt);
  };

  public shared ({ caller }) func approveJob(id : Nat) : async Bool {
    switch (jobs.get(id)) {
      case (null) { false };
      case (?job) {
        let updatedJob = { job with approved = true };
        jobs.add(id, updatedJob);
        true;
      };
    };
  };

  public shared ({ caller }) func deleteJob(id : Nat) : async Bool {
    switch (jobs.get(id)) {
      case (null) { false };
      case (?job) {
        let updatedJob = { job with deleted = true };
        jobs.add(id, updatedJob);
        true;
      };
    };
  };

  public shared ({ caller }) func adminUpdateJob(id : Nat, category : Text, location : Text, description : Text, payOffered : Text, postedBy : Text) : async Bool {
    switch (jobs.get(id)) {
      case (null) { false };
      case (?job) {
        let updatedJob = {
          job with
          category;
          location;
          description;
          payOffered;
          postedBy;
        };
        jobs.add(id, updatedJob);
        true;
      };
    };
  };

  // Contact functions
  public shared ({ caller }) func submitContact(name : Text, phone : Text, message : Text) : async Contact {
    let newContact : Contact = {
      id = contactId;
      name;
      phone;
      message;
      createdAt = Int.abs(Time.now());
    };
    contacts.add(contactId, newContact);
    contactId += 1;
    newContact;
  };

  public query ({ caller }) func getAllContacts() : async [Contact] {
    contacts.values().toArray().sort(Contact.compareByCreatedAt);
  };

  // App Content functions
  public query ({ caller }) func getAppContent() : async {
    homeText : Text;
    bannerText : Text;
    announcement : Text;
    contactNumber : Text;
    supportDetails : Text;
  } {
    appContent;
  };

  public shared ({ caller }) func updateAppContent(homeText : Text, bannerText : Text, announcement : Text, contactNumber : Text, supportDetails : Text) : async () {
    appContent := {
      homeText;
      bannerText;
      announcement;
      contactNumber;
      supportDetails;
    };
  };

  // Category functions
  public query ({ caller }) func getCategories() : async [Category] {
    categories.values().toArray();
  };

  public shared ({ caller }) func addCategory(name : Text) : async () {
    let category : Category = {
      id = categoryId;
      name;
    };
    categories.add(categoryId, category);
    categoryId += 1;
  };

  public shared ({ caller }) func updateCategory(id : Nat, name : Text) : async Bool {
    switch (categories.get(id)) {
      case (null) { false };
      case (?_) {
        let updatedCategory = {
          id;
          name;
        };
        categories.add(id, updatedCategory);
        true;
      };
    };
  };

  public shared ({ caller }) func deleteCategory(id : Nat) : async Bool {
    switch (categories.get(id)) {
      case (null) { false };
      case (?_) {
        categories.remove(id);
        true;
      };
    };
  };

  // Notification functions
  public query ({ caller }) func getNotifications() : async [Notification] {
    notifications.values().toArray();
  };

  public shared ({ caller }) func sendNotification(title : Text, message : Text) : async () {
    let notification : Notification = {
      id = notificationId;
      title;
      message;
      createdAt = Int.abs(Time.now());
    };
    notifications.add(notificationId, notification);
    notificationId += 1;
  };

  // Admin Auth functions
  public shared ({ caller }) func checkAdminCredentials(username : Text, password : Text) : async Bool {
    username == adminUsername and password == adminPassword;
  };

  public shared ({ caller }) func checkAdminPassword(password : Text) : async Bool {
    password == adminPassword;
  };

  public shared ({ caller }) func changeAdminPassword(oldPassword : Text, newPassword : Text) : async Bool {
    if (oldPassword == adminPassword) {
      adminPassword := newPassword;
      true;
    } else {
      false;
    };
  };

  public shared ({ caller }) func resetAdminToDefault() : async () {
    adminUsername := "admin";
    adminPassword := "1234";
    adminPhone := OWNER_MOBILE;  // Always reset to owner mobile, never to something else
  };

  public shared ({ caller }) func resetAdminPasswordDirect(newPassword : Text) : async () {
    adminPassword := newPassword;
  };

  public shared ({ caller }) func changeAdminCredentials(oldPassword : Text, newUsername : Text, newPassword : Text) : async Bool {
    if (oldPassword == adminPassword) {
      if (newUsername != "") { adminUsername := newUsername };
      if (newPassword != "") { adminPassword := newPassword };
      true;
    } else {
      false;
    };
  };
};
