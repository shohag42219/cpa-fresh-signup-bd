export type UserStatus = "Pending" | "Approved" | "Rejected" | "Suspended" | "Banned";
export type JobStatus = "Active" | "Paused" | "Completed";

export interface User {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  district: string;
  upazila: string;
  village: string;
  postalCode: string;
  cpaNetworks: string[];
  status: UserStatus;
  role: "admin" | "user";
  emailVerified: boolean;
  createdAt: string;
  surfingBalance?: number; // Add surfing balance
}

export interface Job {
  id: string;
  title: string;
  affiliateLink: string;
  cpaNetwork: string;
  country: string;
  deviceType: "Android" | "iPhone" | "Desktop" | "All Devices";
  browser: string;
  description: string;
  instructions: string;
  status: JobStatus;
  slotsLimit: number;
  remainingSlots: number;
  userId: string;
  username: string;
  createdAt: string;
}

export type TaskStatus = "Accepted" | "Pending" | "Approved" | "Rejected" | "Resubmission Requested";

export interface TaskSubmission {
  id: string;
  jobId: string;
  jobTitle: string;
  cpaNetwork: string;
  affiliateLink: string;
  workerId: string;
  workerName: string;
  ownerId: string;
  ownerName: string;
  screenshots: string[]; // exactly 4 items
  status: TaskStatus;
  rejectionReason?: string;
  createdAt: string; // when accepted
  submittedAt?: string; // when proofs submitted
  reviewedAt?: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
}

export interface SystemSettings {
  cooldownHours: number;
  rewardPoints: number;
}

export interface Transaction {
  id: string;
  userId: string;
  username: string;
  date: string;
  type: "Earned" | "Spent";
  jobTitle: string;
  points: number;
  status: "Completed" | "Pending" | "Cancelled";
}

export interface AuditLog {
  id: string;
  action: string;
  adminId: string;
  adminName: string;
  details: string;
  createdAt: string;
}

export interface WebsiteSettings {
  websiteName: string;
  logo: string;
  maintenanceMode: boolean;
  defaultCooldownTime: number;
  defaultSurfingBalanceReward: number;
  supportedCpaNetworks: string[];
  homepageBannerText: string;
  contactEmail: string;
}

export interface SimulatedEmail {
  id: string;
  to: string;
  subject: string;
  body: string;
  link: string;
  createdAt: string;
}

export type ViewState = 
  | "login"
  | "register"
  | "forgot-password"
  | "reset-password"
  | "dashboard"
  | "admin-panel";

