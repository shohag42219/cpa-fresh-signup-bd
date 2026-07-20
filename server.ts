import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;

// Check if Supabase is fully configured with real values (not placeholders)
const isSupabaseConfigured = !!(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes("your-project-id") && 
  !supabaseAnonKey.includes("your-supabase-anon-key-placeholder")
);

// Instantiate Supabase Client (safe fallback if not configured)
const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl!, supabaseServiceKey!) 
  : null;

if (isSupabaseConfigured) {
  console.log("🟢 Supabase is fully configured. All endpoints will route directly to the real Supabase PostgreSQL & Auth backend!");
} else {
  console.log("🟡 Supabase is using placeholder configurations. Falling back to high-performance local database.json storage.");
}


interface User {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  district: string;
  upazila: string;
  village: string;
  postalCode: string;
  cpaNetworks: string[];
  status: "Pending" | "Approved" | "Rejected" | "Suspended" | "Banned";
  role: "admin" | "user";
  emailVerified: boolean;
  verificationToken: string;
  createdAt: string;
  surfingBalance?: number; // Added surfingBalance
}

interface SimulatedEmail {
  id: string;
  to: string;
  subject: string;
  body: string;
  link: string;
  createdAt: string;
}

interface Job {
  id: string;
  title: string;
  affiliateLink: string;
  cpaNetwork: string;
  country: string;
  deviceType: "Android" | "iPhone" | "Desktop" | "All Devices";
  browser: string;
  description: string;
  instructions: string;
  status: "Active" | "Paused" | "Completed";
  slotsLimit: number;
  remainingSlots: number;
  userId: string;
  username: string;
  createdAt: string;
}

interface TaskSubmission {
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
  status: "Accepted" | "Pending" | "Approved" | "Rejected" | "Resubmission Requested";
  rejectionReason?: string;
  createdAt: string; // when accepted
  submittedAt?: string; // when proofs submitted
  reviewedAt?: string;
}

interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
}

interface SystemSettings {
  cooldownHours: number;
  rewardPoints: number;
}

interface Transaction {
  id: string;
  userId: string;
  username: string;
  date: string;
  type: "Earned" | "Spent";
  jobTitle: string;
  points: number;
  status: "Completed" | "Pending" | "Cancelled";
}

interface AuditLog {
  id: string;
  action: string;
  adminId: string;
  adminName: string;
  details: string;
  createdAt: string;
}

interface WebsiteSettings {
  websiteName: string;
  logo: string;
  maintenanceMode: boolean;
  defaultCooldownTime: number;
  defaultSurfingBalanceReward: number;
  supportedCpaNetworks: string[];
  homepageBannerText: string;
  contactEmail: string;
}

const DB_FILE = path.join(process.cwd(), "database.json");

// Helper to initialize or load database
function loadDatabase(): {
  users: User[];
  emails: SimulatedEmail[];
  jobs: Job[];
  tasks: TaskSubmission[];
  notifications: Notification[];
  settings: SystemSettings;
  transactions: Transaction[];
  auditLogs: AuditLog[];
  websiteSettings: WebsiteSettings;
} {
  const defaultUsers: User[] = [
    {
      id: "admin-id-123",
      username: "System Admin",
      email: "admin@gmail.com",
      passwordHash: "admin123", // For step 1 simplicity, plain password comparison
      district: "Dhaka",
      upazila: "Ramna",
      village: "Siddheswari",
      postalCode: "1217",
      cpaNetworks: ["CPAGrip", "MyLead", "ogads"],
      status: "Approved",
      role: "admin",
      emailVerified: true,
      verificationToken: "",
      createdAt: new Date().toISOString()
    },
    {
      id: "user-id-rahim",
      username: "Rahim Ahmed",
      email: "rahim@gmail.com",
      passwordHash: "rahim123",
      district: "Dhaka",
      upazila: "Mirpur",
      village: "Mirpur-1",
      postalCode: "1216",
      cpaNetworks: ["CPAGrip", "AdWorkMedia"],
      status: "Pending",
      role: "user",
      emailVerified: true,
      verificationToken: "",
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString() // 2 hours ago
    },
    {
      id: "user-id-karim",
      username: "Karim Ullah",
      email: "karim@gmail.com",
      passwordHash: "karim123",
      district: "Chittagong",
      upazila: "Double Mooring",
      village: "Agrabad",
      postalCode: "4100",
      cpaNetworks: ["MyLead", "ogads"],
      status: "Pending",
      role: "user",
      emailVerified: false,
      verificationToken: "token-karim-123",
      createdAt: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
    },
    {
      id: "user-id-approved",
      username: "Sharif Khan",
      email: "approved@gmail.com",
      passwordHash: "user123",
      district: "Sylhet",
      upazila: "Beanibazar",
      village: "Mathiura",
      postalCode: "3170",
      cpaNetworks: ["CPAGrip", "CPAFull"],
      status: "Approved",
      role: "user",
      emailVerified: true,
      verificationToken: "",
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString() // 1 day ago
    },
    {
      id: "user-id-suspended",
      username: "Hasan Mahmud",
      email: "suspended@gmail.com",
      passwordHash: "hasan123",
      district: "Rajshahi",
      upazila: "Paba",
      village: "Katakhali",
      postalCode: "6205",
      cpaNetworks: ["MyLead"],
      status: "Suspended",
      role: "user",
      emailVerified: true,
      verificationToken: "",
      createdAt: new Date(Date.now() - 3600000 * 48).toISOString()
    },
    {
      id: "user-id-banned",
      username: "Spam Bot User",
      email: "banned@gmail.com",
      passwordHash: "bot123",
      district: "Barisal",
      upazila: "Wazirpur",
      village: "Shikarpur",
      postalCode: "8220",
      cpaNetworks: ["CPAGrip", "ogads", "AdWorkMedia"],
      status: "Banned",
      role: "user",
      emailVerified: true,
      verificationToken: "",
      createdAt: new Date(Date.now() - 3600000 * 72).toISOString()
    }
  ];

  const defaultEmails: SimulatedEmail[] = [
    {
      id: "email-1",
      to: "karim@gmail.com",
      subject: "CPA Fresh Sign-up BD — Email Verification Link",
      body: "আপনার CPA Fresh Sign-up BD অ্যাকাউন্টটি ভেরিফাই করতে নিচের লিংকে ক্লিক করুন।",
      link: "/verify-email?token=token-karim-123",
      createdAt: new Date(Date.now() - 3600000).toISOString()
    }
  ];

  const defaultJobs: Job[] = [
    {
      id: "job-1",
      title: "CPAGrip Gmail Sign-up (Fast Exchange)",
      affiliateLink: "https://www.cpagrip.com/show.php?l=0&u=123456&id=99999",
      cpaNetwork: "CPAGrip",
      country: "Bangladesh",
      deviceType: "Android",
      browser: "Chrome",
      description: "কাজটি খুবই সহজ। লিংকে ক্লিক করে নতুন একটি জিমেইল একাউন্ট দিয়ে সাইন আপ করবেন।",
      instructions: "১. ভিপিএন অফ রাখুন।\n২. লিংকে ক্লিক করে রিয়াল জিমেইল এবং পাসওয়ার্ড দিয়ে সাইনআপ সম্পন্ন করুন।\n৩. সাকসেস স্ক্রিনশট আপলোড করে প্রুফ দিন।",
      status: "Active",
      slotsLimit: 100,
      remainingSlots: 48,
      userId: "user-id-approved",
      username: "Sharif Khan",
      createdAt: new Date(Date.now() - 3600000 * 5).toISOString()
    },
    {
      id: "job-2",
      title: "MyLead Game Sign-up & Verify",
      affiliateLink: "https://mylead.global/ref/98765",
      cpaNetwork: "MyLead",
      country: "United States",
      deviceType: "iPhone",
      browser: "Safari",
      description: "ইউএসএ ট্রাফিকের জন্য সাইন আপ করতে হবে। আইফোন ইউজারদের জন্য অত্যন্ত লাভজনক অফার।",
      instructions: "১. অবশ্যই সাফারি ব্রাউজার ব্যবহার করুন।\n২. সঠিক ইমেইল দিয়ে রেজিস্ট্রেশন করে ইমেইল ভেরিফাই করুন।\n৩. প্রোফাইল স্ক্রিনশট প্রুফ হিসেবে রাখুন।",
      status: "Active",
      slotsLimit: 50,
      remainingSlots: 12,
      userId: "user-id-approved",
      username: "Sharif Khan",
      createdAt: new Date(Date.now() - 3600000 * 12).toISOString()
    },
    {
      id: "job-3",
      title: "ogads Survey Sign-up (Only Android)",
      affiliateLink: "https://ogads.com/offer/777",
      cpaNetwork: "ogads",
      country: "United Kingdom",
      deviceType: "Android",
      browser: "Chrome",
      description: "অ্যান্ড্রয়েড ডিভাইস দিয়ে এই সিম্পল অফারটি কমপ্লিট করুন ও এক্সচেঞ্জ বোনাস নিন।",
      instructions: "১. লিংকে গিয়ে ১টি অফার সম্পন্ন করুন।\n২. অফার সম্পন্ন হলে স্ক্রিনশট দিন।",
      status: "Paused",
      slotsLimit: 30,
      remainingSlots: 15,
      userId: "admin-id-123",
      username: "System Admin",
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
    }
  ];

  const defaultWebsiteSettings: WebsiteSettings = {
    websiteName: "CPA Fresh Sign-up BD",
    logo: "",
    maintenanceMode: false,
    defaultCooldownTime: 24,
    defaultSurfingBalanceReward: 1,
    supportedCpaNetworks: ["MyLead", "CPAGrip", "CPAFull", "AdWorkMedia", "ogads", "CPAlead", "MaxBounty"],
    homepageBannerText: "গণপ্রজাতন্ত্রী বাংলাদেশ CPA এক্সচেঞ্জ প্লাটফর্ম",
    contactEmail: "support@cpasignupbd.com"
  };

  if (!fs.existsSync(DB_FILE)) {
    const initialDb = {
      users: defaultUsers.map(u => ({ ...u, surfingBalance: 0 })),
      emails: defaultEmails,
      jobs: defaultJobs,
      tasks: [] as TaskSubmission[],
      notifications: [] as Notification[],
      settings: { cooldownHours: 24, rewardPoints: 1 } as SystemSettings,
      transactions: [] as Transaction[],
      auditLogs: [] as AuditLog[],
      websiteSettings: defaultWebsiteSettings
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2));
    return initialDb;
  }

  try {
    const rawData = JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
    const updated = {
      users: (rawData.users || defaultUsers).map((u: any) => ({
        ...u,
        surfingBalance: u.surfingBalance !== undefined ? u.surfingBalance : 0
      })),
      emails: rawData.emails || defaultEmails,
      jobs: rawData.jobs || defaultJobs,
      tasks: rawData.tasks || [] as TaskSubmission[],
      notifications: rawData.notifications || [] as Notification[],
      settings: rawData.settings || { cooldownHours: 24, rewardPoints: 1 } as SystemSettings,
      transactions: rawData.transactions || [] as Transaction[],
      auditLogs: rawData.auditLogs || [] as AuditLog[],
      websiteSettings: rawData.websiteSettings || defaultWebsiteSettings
    };
    
    // Write back to sync fields
    fs.writeFileSync(DB_FILE, JSON.stringify(updated, null, 2));
    return updated;
  } catch (err) {
    const initialDb = {
      users: defaultUsers.map(u => ({ ...u, surfingBalance: 0 })),
      emails: defaultEmails,
      jobs: defaultJobs,
      tasks: [] as TaskSubmission[],
      notifications: [] as Notification[],
      settings: { cooldownHours: 24, rewardPoints: 1 } as SystemSettings,
      transactions: [] as Transaction[],
      auditLogs: [] as AuditLog[],
      websiteSettings: defaultWebsiteSettings
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2));
    return initialDb;
  }
}

function saveDatabase(data: {
  users: User[];
  emails: SimulatedEmail[];
  jobs: Job[];
  tasks: TaskSubmission[];
  notifications: Notification[];
  settings: SystemSettings;
  transactions: Transaction[];
  auditLogs: AuditLog[];
  websiteSettings: WebsiteSettings;
}) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

async function uploadBase64ToSupabase(base64Str: string, index: number, taskId: string): Promise<string> {
  if (!supabase) return base64Str;
  try {
    const match = base64Str.match(/^data:image\/([a-zA-Z+]+);base64,(.+)$/);
    if (!match) {
      return base64Str;
    }
    const ext = match[1];
    const data = match[2];
    const buffer = Buffer.from(data, 'base64');
    
    const fileName = `${taskId}_screenshot_${index}_${Date.now()}.${ext}`;
    const { data: uploadData, error } = await supabase.storage
      .from('screenshots')
      .upload(fileName, buffer, {
        contentType: `image/${ext}`,
        upsert: true
      });

    if (error) {
      console.error("Error uploading to storage:", error);
      return base64Str;
    }

    const { data: urlData } = supabase.storage
      .from('screenshots')
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  } catch (err) {
    console.error("Failed to upload base64 screenshot to Supabase:", err);
    return base64Str;
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  
  // 1. Get Me (Current Session User)
  app.get("/api/me", async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: "Unauthorized — No session found." });
    }
    
    const userId = authHeader.replace("Bearer ", "");

    if (isSupabaseConfigured && supabase) {
      try {
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();
        
        if (error || !profile) {
          return res.status(401).json({ error: "Session expired or invalid user." });
        }

        return res.json({
          user: {
            id: profile.id,
            username: profile.username,
            email: profile.email,
            district: profile.district,
            upazila: profile.upazila,
            village: profile.village,
            postalCode: profile.postal_code,
            cpaNetworks: profile.cpa_networks,
            status: profile.status,
            role: profile.role,
            emailVerified: profile.email_verified,
            surfingBalance: Number(profile.surfing_balance),
            createdAt: profile.created_at
          }
        });
      } catch (err: any) {
        return res.status(500).json({ error: err.message });
      }
    }
    
    const db = loadDatabase();
    const user = db.users.find(u => u.id === userId);
    
    if (!user) {
      return res.status(401).json({ error: "Session expired or invalid user." });
    }
    
    res.json({ user });
  });

  // 2. Register User
  app.post("/api/register", async (req, res) => {
    const { username, email, password, district, upazila, village, postalCode, cpaNetworks, termsChecked } = req.body;
    
    if (!username || !email || !password || !district || !upazila || !village || !postalCode || !cpaNetworks || !termsChecked) {
      return res.status(400).json({ error: "সবগুলো ঘর অবশ্যই সঠিকভাবে পূরণ করতে হবে।" });
    }

    if (!email.endsWith("@gmail.com") && !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
      return res.status(400).json({ error: "সঠিক ইমেইল এড্রেস প্রদান করুন।" });
    }

    if (isSupabaseConfigured && supabase) {
      try {
        const verificationToken = `token_${Math.random().toString(36).substring(2, 15)}`;
        
        // Register in Supabase Auth
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username,
              district,
              upazila,
              village,
              postalCode,
              cpaNetworks,
              verificationToken
            }
          }
        });

        if (error) {
          return res.status(400).json({ error: error.message });
        }

        const authUser = data.user;
        if (!authUser) {
          return res.status(400).json({ error: "নিবন্ধন ব্যর্থ হয়েছে।" });
        }

        // Insert simulated email in Supabase DB
        await supabase.from("simulated_emails").insert({
          to: email,
          subject: "CPA Fresh Sign-up BD — Email Verification Link",
          body: `আপনার CPA Fresh Sign-up BD অ্যাকাউন্টটি ভেরিফাই করতে নিচের লিংকে ক্লিক করুন।`,
          link: `/verify-email?token=${verificationToken}`
        });

        // Ensure token is set on the profile as well
        await supabase.from("profiles").update({
          verification_token: verificationToken,
          email_verified: false
        }).eq("id", authUser.id);

        return res.json({
          success: true,
          message: "নিবন্ধন সফল হয়েছে! অনুগ্রহ করে আপনার ইমেইল ভেরিফাই করুন।",
          user: {
            id: authUser.id,
            email: authUser.email,
            emailVerified: false
          }
        });
      } catch (err: any) {
        return res.status(500).json({ error: err.message });
      }
    }

    const db = loadDatabase();
    const existing = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return res.status(400).json({ error: "এই ইমেইলটি ইতিমধ্যে নিবন্ধিত রয়েছে।" });
    }

    const verificationToken = `token_${Math.random().toString(36).substring(2, 15)}`;
    const newUser: User = {
      id: `user_${Math.random().toString(36).substring(2, 9)}`,
      username,
      email,
      passwordHash: password,
      district,
      upazila,
      village,
      postalCode,
      cpaNetworks,
      status: "Pending", // Default pending
      role: "user",
      emailVerified: false,
      verificationToken,
      createdAt: new Date().toISOString()
    };

    const newEmail: SimulatedEmail = {
      id: `email_${Date.now()}`,
      to: email,
      subject: "CPA Fresh Sign-up BD — Email Verification Link",
      body: `আপনার CPA Fresh Sign-up BD অ্যাকাউন্টটি ভেরিফাই করতে নিচের লিংকে ক্লিক করুন।`,
      link: `/verify-email?token=${verificationToken}`,
      createdAt: new Date().toISOString()
    };

    db.users.push(newUser);
    db.emails.unshift(newEmail);
    saveDatabase(db);

    res.json({
      success: true,
      message: "নিবন্ধন সফল হয়েছে! অনুগ্রহ করে আপনার ইমেইল ভেরিফাই করুন।",
      user: {
        id: newUser.id,
        email: newUser.email,
        emailVerified: false
      }
    });
  });

  // 3. Verify Email
  app.post("/api/verify", async (req, res) => {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ error: "টোকেন পাওয়া যায়নি।" });
    }

    if (isSupabaseConfigured && supabase) {
      try {
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("verification_token", token)
          .single();

        if (error || !profile) {
          return res.status(400).json({ error: "ভুল অথবা মেয়াদোত্তীর্ণ ভেরিফিকেশন টোকেন।" });
        }

        // Update profiles status
        await supabase
          .from("profiles")
          .update({ email_verified: true, verification_token: "" })
          .eq("id", profile.id);

        return res.json({
          success: true,
          message: "ইমেইল ভেরিফিকেশন সফল হয়েছে! এখন আপনি লগইন করতে পারবেন।"
        });
      } catch (err: any) {
        return res.status(500).json({ error: err.message });
      }
    }

    const db = loadDatabase();
    const user = db.users.find(u => u.verificationToken === token);
    
    if (!user) {
      return res.status(400).json({ error: "ভুল অথবা মেয়াদোত্তীর্ণ ভেরিফিকেশন টোকেন।" });
    }

    user.emailVerified = true;
    user.verificationToken = ""; // Clear token
    saveDatabase(db);

    res.json({
      success: true,
      message: "ইমেইল ভেরিফিকেশন সফল হয়েছে! এখন আপনি লগইন করতে পারবেন।"
    });
  });

  // 4. Login User
  app.post("/api/login", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "ইমেইল এবং পাসওয়ার্ড দুটিই দিন।" });
    }

    if (isSupabaseConfigured && supabase) {
      try {
        // Authenticate via Supabase auth
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) {
          return res.status(401).json({ error: "ইমেইল অথবা পাসওয়ার্ডটি সঠিক নয়।" });
        }

        const authUser = data.user;
        if (!authUser) {
          return res.status(401).json({ error: "লগইন ব্যর্থ হয়েছে।" });
        }

        // Fetch user profile to verify status and email
        const { data: profile, error: profileErr } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", authUser.id)
          .single();

        if (profileErr || !profile) {
          return res.status(401).json({ error: "ব্যবহারকারীর প্রোফাইল পাওয়া যায়নি।" });
        }

        if (!profile.email_verified) {
          return res.status(403).json({ 
            error: "লগইন করতে প্রথমে আপনার ইমেইল ভেরিফাই করতে হবে।", 
            unverified: true 
          });
        }

        if (profile.status === "Banned") {
          return res.status(403).json({ error: "আপনার অ্যাকাউন্টটি স্থায়ীভাবে ব্যান করা হয়েছে। অনুগ্রহ করে কর্তৃপক্ষের সাথে যোগাযোগ করুন।" });
        }

        return res.json({
          success: true,
          user: {
            id: profile.id,
            username: profile.username,
            email: profile.email,
            status: profile.status,
            role: profile.role
          }
        });
      } catch (err: any) {
        return res.status(500).json({ error: err.message });
      }
    }

    const db = loadDatabase();
    const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user || user.passwordHash !== password) {
      return res.status(401).json({ error: "ইমেইল অথবা পাসওয়ার্ডটি সঠিক নয়।" });
    }

    if (!user.emailVerified) {
      return res.status(403).json({ 
        error: "লগইন করতে প্রথমে আপনার ইমেইল ভেরিফাই করতে হবে।", 
        unverified: true 
      });
    }

    // Checking Banned/Suspended for early notice
    if (user.status === "Banned") {
      return res.status(403).json({ error: "আপনার অ্যাকাউন্টটি স্থায়ীভাবে ব্যান করা হয়েছে। অনুগ্রহ করে কর্তৃপক্ষের সাথে যোগাযোগ করুন।" });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        status: user.status,
        role: user.role
      }
    });
  });

  // 5. Admin — Get Users
  app.get("/api/admin/users", async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    const adminId = authHeader.replace("Bearer ", "");

    if (isSupabaseConfigured && supabase) {
      try {
        const { data: adminProfile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", adminId)
          .single();

        if (!adminProfile || adminProfile.role !== "admin") {
          return res.status(403).json({ error: "শুধুমাত্র Admin এই এক্সেস পেতে পারেন।" });
        }

        const { data: profiles, error } = await supabase
          .from("profiles")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          return res.status(500).json({ error: error.message });
        }

        const usersMapped = (profiles || []).map(p => ({
          id: p.id,
          username: p.username,
          email: p.email,
          district: p.district,
          upazila: p.upazila,
          village: p.village,
          postalCode: p.postal_code,
          cpaNetworks: p.cpa_networks,
          status: p.status,
          role: p.role,
          emailVerified: p.email_verified,
          surfingBalance: Number(p.surfing_balance),
          createdAt: p.created_at
        }));

        return res.json({ users: usersMapped });
      } catch (err: any) {
        return res.status(500).json({ error: err.message });
      }
    }

    const db = loadDatabase();
    const adminUser = db.users.find(u => u.id === adminId);

    if (!adminUser || adminUser.role !== "admin") {
      return res.status(403).json({ error: "শুধুমাত্র Admin এই এক্সেস পেতে পারেন।" });
    }

    res.json({ users: db.users });
  });

  // 6. Admin — Update User Status
  app.post("/api/admin/update-status", async (req, res) => {
    const authHeader = req.headers.authorization;
    const { targetUserId, action } = req.body; // action: Approve | Reject | Suspend | Ban | Active

    if (!authHeader) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const adminId = authHeader.replace("Bearer ", "");

    if (isSupabaseConfigured && supabase) {
      try {
        const { data: adminProfile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", adminId)
          .single();

        if (!adminProfile || adminProfile.role !== "admin") {
          return res.status(403).json({ error: "শুধুমাত্র Admin এই পরিবর্তন করতে পারেন।" });
        }

        let status = "Pending";
        if (action === "Approve") {
          status = "Approved";
        } else if (action === "Reject") {
          status = "Rejected";
        } else if (action === "Suspend") {
          status = "Suspended";
        } else if (action === "Ban") {
          status = "Banned";
        } else if (action === "Unban" || action === "Active") {
          status = "Approved";
        } else {
          return res.status(400).json({ error: "ভুল একশন কমান্ড।" });
        }

        const { data: updatedProfile, error } = await supabase
          .from("profiles")
          .update({ status })
          .eq("id", targetUserId)
          .select()
          .single();

        if (error || !updatedProfile) {
          return res.status(404).json({ error: "ব্যবহারকারী খুঁজে পাওয়া যায়নি।" });
        }

        const userMapped = {
          id: updatedProfile.id,
          username: updatedProfile.username,
          email: updatedProfile.email,
          district: updatedProfile.district,
          upazila: updatedProfile.upazila,
          village: updatedProfile.village,
          postalCode: updatedProfile.postal_code,
          cpaNetworks: updatedProfile.cpa_networks,
          status: updatedProfile.status,
          role: updatedProfile.role,
          emailVerified: updatedProfile.email_verified,
          surfingBalance: Number(updatedProfile.surfing_balance),
          createdAt: updatedProfile.created_at
        };

        return res.json({ success: true, message: "ব্যবহারকারীর স্ট্যাটাস সফলভাবে আপডেট করা হয়েছে।", user: userMapped });
      } catch (err: any) {
        return res.status(500).json({ error: err.message });
      }
    }

    const db = loadDatabase();
    const adminUser = db.users.find(u => u.id === adminId);

    if (!adminUser || adminUser.role !== "admin") {
      return res.status(403).json({ error: "শুধুমাত্র Admin এই পরিবর্তন করতে পারেন।" });
    }

    const targetUser = db.users.find(u => u.id === targetUserId);
    if (!targetUser) {
      return res.status(404).json({ error: "ব্যবহারকারী খুঁজে পাওয়া যায়নি।" });
    }

    // Action matching status
    if (action === "Approve") {
      targetUser.status = "Approved";
    } else if (action === "Reject") {
      targetUser.status = "Rejected";
    } else if (action === "Suspend") {
      targetUser.status = "Suspended";
    } else if (action === "Ban") {
      targetUser.status = "Banned";
    } else if (action === "Unban" || action === "Active") {
      targetUser.status = "Approved";
    } else {
      return res.status(400).json({ error: "ভুল একশন কমান্ড।" });
    }

    saveDatabase(db);
    res.json({ success: true, message: "ব্যবহারকারীর স্ট্যাটাস সফলভাবে আপডেট করা হয়েছে।", user: targetUser });
  });

  // 7. Simulated Mailbox APIs
  app.get("/api/simulated/emails", (req, res) => {
    const db = loadDatabase();
    res.json({ emails: db.emails });
  });

  app.post("/api/simulated/clear-emails", (req, res) => {
    const db = loadDatabase();
    db.emails = [];
    saveDatabase(db);
    res.json({ success: true });
  });

  // 8. Forgot Password Simulation
  app.post("/api/forgot-password", (req, res) => {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "অনুগ্রহ করে আপনার ইমেইল প্রদান করুন।" });
    }
    const db = loadDatabase();
    const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return res.status(404).json({ error: "এই ইমেইল দিয়ে কোনো অ্যাকাউন্ট তৈরি করা হয়নি।" });
    }

    const resetToken = `reset_${Math.random().toString(36).substring(2, 15)}`;
    const newEmail: SimulatedEmail = {
      id: `email_reset_${Date.now()}`,
      to: email,
      subject: "CPA Fresh Sign-up BD — Password Reset Link",
      body: `আপনার CPA Fresh Sign-up BD পাসওয়ার্ড রিসেট করতে নিচের লিংকে ক্লিক করুন।`,
      link: `/reset-password?token=${resetToken}`,
      createdAt: new Date().toISOString()
    };

    db.emails.unshift(newEmail);
    saveDatabase(db);

    res.json({
      success: true,
      message: "পাসওয়ার্ড রিসেট লিংকটি আপনার ইমেইলে পাঠানো হয়েছে! (Simulated Mailbox চেক করুন)"
    });
  });

  // 9. Reset Password Simulation
  app.post("/api/reset-password", (req, res) => {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ error: "টোকেন এবং পাসওয়ার্ড দুটিই প্রয়োজন।" });
    }

    // In a real database we would lookup token; here we can simply allow updating the password of any demo user,
    // or for high fidelity we can reset the password of the user associated with the token.
    // Let's reset the password for 'admin@gmail.com' or 'approved@gmail.com' based on simple lookup.
    const db = loadDatabase();
    // find a user with a token matching, or if we look up the last emails sent:
    const lastResetEmail = db.emails.find(e => e.link.includes(token));
    if (!lastResetEmail) {
      return res.status(400).json({ error: "ভুল অথবা মেয়াদোত্তীর্ণ পাসওয়ার্ড রিসেট টোকেন।" });
    }

    const user = db.users.find(u => u.email.toLowerCase() === lastResetEmail.to.toLowerCase());
    if (!user) {
      return res.status(400).json({ error: "ব্যবহারকারী পাওয়া যায়নি।" });
    }

    user.passwordHash = newPassword;
    saveDatabase(db);

    res.json({
      success: true,
      message: "পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে! অনুগ্রহ করে নতুন পাসওয়ার্ড দিয়ে লগইন করুন।"
    });
  });

  // 10. Get All Jobs (Approved and Admin users only)
  app.get("/api/jobs", async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const userId = authHeader.replace("Bearer ", "");

    if (isSupabaseConfigured && supabase) {
      try {
        const { data: user, error: userErr } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();

        if (userErr || !user) {
          return res.status(401).json({ error: "ব্যবহারকারী সেশন পাওয়া যায়নি।" });
        }

        if (user.status !== "Approved" && user.role !== "admin") {
          return res.status(403).json({ error: "শুধুমাত্র অনুমোদিত (Approved) ব্যবহারকারীরাই অফারসমূহ দেখতে পারেন।" });
        }

        const { data: jobs, error: jobsErr } = await supabase
          .from("jobs")
          .select("*")
          .order("created_at", { ascending: false });

        if (jobsErr) {
          return res.status(500).json({ error: jobsErr.message });
        }

        const frontendJobs = (jobs || []).map(j => ({
          id: j.id,
          title: j.title,
          affiliateLink: j.affiliate_link,
          cpaNetwork: j.cpa_network,
          country: j.country,
          deviceType: j.device_type,
          browser: j.browser,
          description: j.description,
          instructions: j.instructions,
          status: j.status,
          slotsLimit: Number(j.slots_limit),
          remainingSlots: Number(j.remaining_slots),
          userId: j.user_id,
          username: j.username,
          createdAt: j.created_at
        }));

        return res.json({ jobs: frontendJobs });
      } catch (err: any) {
        return res.status(500).json({ error: err.message });
      }
    }

    const db = loadDatabase();
    const user = db.users.find(u => u.id === userId);

    if (!user) {
      return res.status(401).json({ error: "ব্যবহারকারী সেশন পাওয়া যায়নি।" });
    }

    if (user.status !== "Approved" && user.role !== "admin") {
      return res.status(403).json({ error: "শুধুমাত্র অনুমোদিত (Approved) ব্যবহারকারীরাই অফারসমূহ দেখতে পারেন।" });
    }

    res.json({ jobs: db.jobs });
  });

  // 11. Create a Job (Approved users only)
  app.post("/api/jobs", async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const userId = authHeader.replace("Bearer ", "");

    if (isSupabaseConfigured && supabase) {
      try {
        const { data: user, error: userErr } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();

        if (userErr || !user) {
          return res.status(401).json({ error: "ব্যবহারকারী সেশন পাওয়া যায়নি।" });
        }

        if (user.status !== "Approved") {
          return res.status(403).json({ error: "শুধুমাত্র Approved ব্যবহারকারীরাই কাজ পোস্ট করতে পারবেন।" });
        }

        const { title, affiliateLink, cpaNetwork, country, deviceType, browser, description, instructions, slotsLimit } = req.body;

        if (!title || !affiliateLink || !cpaNetwork || !country || !deviceType || !browser || !description || !instructions || !slotsLimit) {
          return res.status(400).json({ error: "সবগুলো ঘর অবশ্যই সঠিকভাবে পূরণ করতে হবে।" });
        }

        const limit = parseInt(slotsLimit, 10);
        if (isNaN(limit) || limit <= 0) {
          return res.status(400).json({ error: "Slots এর সংখ্যা অবশ্যই ১ বা তার বেশি হতে হবে।" });
        }

        const { data: newJob, error: insertErr } = await supabase
          .from("jobs")
          .insert({
            title,
            affiliate_link: affiliateLink,
            cpa_network: cpaNetwork,
            country,
            device_type: deviceType,
            browser,
            description,
            instructions,
            slots_limit: limit,
            remaining_slots: limit,
            user_id: user.id,
            username: user.username
          })
          .select()
          .single();

        if (insertErr || !newJob) {
          return res.status(500).json({ error: insertErr?.message || "পোস্ট করতে ব্যর্থ হয়েছে।" });
        }

        const frontendJob = {
          id: newJob.id,
          title: newJob.title,
          affiliateLink: newJob.affiliate_link,
          cpaNetwork: newJob.cpa_network,
          country: newJob.country,
          deviceType: newJob.device_type,
          browser: newJob.browser,
          description: newJob.description,
          instructions: newJob.instructions,
          status: newJob.status,
          slotsLimit: Number(newJob.slots_limit),
          remainingSlots: Number(newJob.remaining_slots),
          userId: newJob.user_id,
          username: newJob.username,
          createdAt: newJob.created_at
        };

        return res.json({ success: true, message: "অফারটি সফলভাবে পোস্ট করা হয়েছে!", job: frontendJob });
      } catch (err: any) {
        return res.status(500).json({ error: err.message });
      }
    }

    const db = loadDatabase();
    const user = db.users.find(u => u.id === userId);

    if (!user) {
      return res.status(401).json({ error: "ব্যবহারকারী সেশন পাওয়া যায়নি।" });
    }

    if (user.status !== "Approved") {
      return res.status(403).json({ error: "শুধুমাত্র Approved ব্যবহারকারীরাই কাজ পোস্ট করতে পারবেন।" });
    }

    const { title, affiliateLink, cpaNetwork, country, deviceType, browser, description, instructions, slotsLimit } = req.body;

    if (!title || !affiliateLink || !cpaNetwork || !country || !deviceType || !browser || !description || !instructions || !slotsLimit) {
      return res.status(400).json({ error: "সবগুলো ঘর অবশ্যই সঠিকভাবে পূরণ করতে হবে।" });
    }

    const limit = parseInt(slotsLimit, 10);
    if (isNaN(limit) || limit <= 0) {
      return res.status(400).json({ error: "Slots এর সংখ্যা অবশ্যই ১ বা তার বেশি হতে হবে।" });
    }

    const newJob: Job = {
      id: `job_${Math.random().toString(36).substring(2, 9)}`,
      title,
      affiliateLink,
      cpaNetwork,
      country,
      deviceType,
      browser,
      description,
      instructions,
      status: "Active",
      slotsLimit: limit,
      remainingSlots: limit,
      userId: user.id,
      username: user.username,
      createdAt: new Date().toISOString()
    };

    db.jobs.unshift(newJob);
    saveDatabase(db);

    res.json({ success: true, message: "অফারটি সফলভাবে পোস্ট করা হয়েছে!", job: newJob });
  });

  // 12. Update/Edit Job (Owner or Admin only)
  app.post("/api/jobs/update", async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const userId = authHeader.replace("Bearer ", "");

    if (isSupabaseConfigured && supabase) {
      try {
        const { data: user, error: userErr } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();

        if (userErr || !user) {
          return res.status(401).json({ error: "ব্যবহারকারী সেশন পাওয়া যায়নি।" });
        }

        if (user.status !== "Approved" && user.role !== "admin") {
          return res.status(403).json({ error: "শুধুমাত্র অনুমোদিত (Approved) ব্যবহারকারীরাই এই পরিবর্তন করতে পারেন।" });
        }

        const { id, title, affiliateLink, cpaNetwork, country, deviceType, browser, description, instructions, status, slotsLimit } = req.body;

        if (!id) {
          return res.status(400).json({ error: "Job ID আবশ্যক।" });
        }

        const { data: existingJob, error: fetchErr } = await supabase
          .from("jobs")
          .select("*")
          .eq("id", id)
          .single();

        if (fetchErr || !existingJob) {
          return res.status(404).json({ error: "অফারটি খুঁজে পাওয়া যায়নি।" });
        }

        if (existingJob.user_id !== user.id && user.role !== "admin") {
          return res.status(403).json({ error: "আপনি এই অফারটির মালিক নন, তাই এটি পরিবর্তন করতে পারবেন না।" });
        }

        const updatePayload: any = {};
        if (title) updatePayload.title = title;
        if (affiliateLink) updatePayload.affiliate_link = affiliateLink;
        if (cpaNetwork) updatePayload.cpa_network = cpaNetwork;
        if (country) updatePayload.country = country;
        if (deviceType) updatePayload.device_type = deviceType;
        if (browser) updatePayload.browser = browser;
        if (description) updatePayload.description = description;
        if (instructions) updatePayload.instructions = instructions;
        if (status) {
          if (status === "Active" || status === "Paused" || status === "Completed") {
            updatePayload.status = status;
          } else {
            return res.status(400).json({ error: "ভুল স্ট্যাটাস কমান্ড।" });
          }
        }

        if (slotsLimit !== undefined) {
          const limit = parseInt(slotsLimit, 10);
          if (!isNaN(limit) && limit > 0) {
            const diff = limit - Number(existingJob.slots_limit);
            updatePayload.slots_limit = limit;
            updatePayload.remaining_slots = Math.max(0, Number(existingJob.remaining_slots) + diff);
          }
        }

        const { data: updatedJob, error: updateErr } = await supabase
          .from("jobs")
          .update(updatePayload)
          .eq("id", id)
          .select()
          .single();

        if (updateErr || !updatedJob) {
          return res.status(500).json({ error: updateErr?.message || "আপডেট ব্যর্থ হয়েছে।" });
        }

        const frontendJob = {
          id: updatedJob.id,
          title: updatedJob.title,
          affiliateLink: updatedJob.affiliate_link,
          cpaNetwork: updatedJob.cpa_network,
          country: updatedJob.country,
          deviceType: updatedJob.device_type,
          browser: updatedJob.browser,
          description: updatedJob.description,
          instructions: updatedJob.instructions,
          status: updatedJob.status,
          slotsLimit: Number(updatedJob.slots_limit),
          remainingSlots: Number(updatedJob.remaining_slots),
          userId: updatedJob.user_id,
          username: updatedJob.username,
          createdAt: updatedJob.created_at
        };

        return res.json({ success: true, message: "অফারটি সফলভাবে আপডেট করা হয়েছে!", job: frontendJob });
      } catch (err: any) {
        return res.status(500).json({ error: err.message });
      }
    }

    const db = loadDatabase();
    const user = db.users.find(u => u.id === userId);

    if (!user) {
      return res.status(401).json({ error: "ব্যবহারকারী সেশন পাওয়া যায়নি।" });
    }

    if (user.status !== "Approved" && user.role !== "admin") {
      return res.status(403).json({ error: "শুধুমাত্র অনুমোদিত (Approved) ব্যবহারকারীরাই এই পরিবর্তন করতে পারেন।" });
    }

    const { id, title, affiliateLink, cpaNetwork, country, deviceType, browser, description, instructions, status, slotsLimit } = req.body;

    if (!id) {
      return res.status(400).json({ error: "Job ID আবশ্যক।" });
    }

    const jobIndex = db.jobs.findIndex(j => j.id === id);
    if (jobIndex === -1) {
      return res.status(404).json({ error: "অফারটি খুঁজে পাওয়া যায়নি।" });
    }

    const job = db.jobs[jobIndex];

    // Only creator or admin can update
    if (job.userId !== user.id && user.role !== "admin") {
      return res.status(403).json({ error: "আপনি এই অফারটির মালিক নন, তাই এটি পরিবর্তন করতে পারবেন না।" });
    }

    if (title) job.title = title;
    if (affiliateLink) job.affiliateLink = affiliateLink;
    if (cpaNetwork) job.cpaNetwork = cpaNetwork;
    if (country) job.country = country;
    if (deviceType) job.deviceType = deviceType;
    if (browser) job.browser = browser;
    if (description) job.description = description;
    if (instructions) job.instructions = instructions;
    if (status) {
      if (status === "Active" || status === "Paused" || status === "Completed") {
        job.status = status;
      } else {
        return res.status(400).json({ error: "ভুল স্ট্যাটাস কমান্ড।" });
      }
    }

    if (slotsLimit !== undefined) {
      const limit = parseInt(slotsLimit, 10);
      if (!isNaN(limit) && limit > 0) {
        const diff = limit - job.slotsLimit;
        job.slotsLimit = limit;
        job.remainingSlots = Math.max(0, job.remainingSlots + diff);
      }
    }

    saveDatabase(db);
    res.json({ success: true, message: "অফারটি সফলভাবে আপডেট করা হয়েছে!", job });
  });

  // 13. Delete Job (Owner or Admin only)
  app.post("/api/jobs/delete", async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const userId = authHeader.replace("Bearer ", "");

    if (isSupabaseConfigured && supabase) {
      try {
        const { data: user, error: userErr } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();

        if (userErr || !user) {
          return res.status(401).json({ error: "ব্যবহারকারী সেশন পাওয়া যায়নি।" });
        }

        const { id } = req.body;
        if (!id) {
          return res.status(400).json({ error: "Job ID আবশ্যক।" });
        }

        const { data: job, error: fetchErr } = await supabase
          .from("jobs")
          .select("*")
          .eq("id", id)
          .single();

        if (fetchErr || !job) {
          return res.status(404).json({ error: "অফারটি খুঁজে পাওয়া যায়নি।" });
        }

        if (job.user_id !== user.id && user.role !== "admin") {
          return res.status(403).json({ error: "আপনি এই অফারটি ডিলিট করতে পারবেন না।" });
        }

        const { error: deleteErr } = await supabase
          .from("jobs")
          .delete()
          .eq("id", id);

        if (deleteErr) {
          return res.status(500).json({ error: deleteErr.message });
        }

        return res.json({ success: true, message: "অফারটি সফলভাবে ডিলিট করা হয়েছে!" });
      } catch (err: any) {
        return res.status(500).json({ error: err.message });
      }
    }

    const db = loadDatabase();
    const userId_local = authHeader.replace("Bearer ", "");
    const user = db.users.find(u => u.id === userId_local);

    if (!user) {
      return res.status(401).json({ error: "ব্যবহারকারী সেশন পাওয়া যায়নি।" });
    }

    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ error: "Job ID আবশ্যক।" });
    }

    const jobIndex = db.jobs.findIndex(j => j.id === id);
    if (jobIndex === -1) {
      return res.status(404).json({ error: "অফারটি খুঁজে পাওয়া যায়নি।" });
    }

    const job = db.jobs[jobIndex];

    if (job.userId !== user.id && user.role !== "admin") {
      return res.status(403).json({ error: "আপনি এই অফারটি ডিলিট করতে পারবেন না।" });
    }

    db.jobs.splice(jobIndex, 1);
    saveDatabase(db);

    res.json({ success: true, message: "অফারটি সফলভাবে ডিলিট করা হয়েছে!" });
  });

  // --- CPA LEAD EXCHANGE WORKFLOWS (STEP 3) ---

  // 14. Accept Task
  app.post("/api/tasks/accept", async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const userId = authHeader.replace("Bearer ", "");

    if (isSupabaseConfigured && supabase) {
      try {
        // Fetch worker profile
        const { data: user, error: userErr } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();

        if (userErr || !user) {
          return res.status(401).json({ error: "ব্যবহারকারী সেশন পাওয়া যায়নি।" });
        }

        if (user.status !== "Approved") {
          return res.status(403).json({ error: "শুধুমাত্র অনুমোদিত (Approved) ব্যবহারকারীরাই অফার সম্পন্ন করতে পারবেন।" });
        }

        const { jobId } = req.body;
        if (!jobId) {
          return res.status(400).json({ error: "Job ID আবশ্যক।" });
        }

        // Fetch job
        const { data: job, error: jobErr } = await supabase
          .from("jobs")
          .select("*")
          .eq("id", jobId)
          .single();

        if (jobErr || !job) {
          return res.status(404).json({ error: "সিপিএ অফারটি খুঁজে পাওয়া যায়নি।" });
        }

        if (job.user_id === user.id) {
          return res.status(400).json({ error: "আপনি নিজের পোস্ট করা কাজ নিজে সম্পন্ন করতে পারবেন না।" });
        }

        if (job.status !== "Active" || Number(job.remaining_slots) <= 0) {
          return res.status(400).json({ error: "দুঃখিত, এই অফারটিতে আর কোনো অবশিষ্ট স্লট নেই বা অফারটি সক্রিয় নয়।" });
        }

        // Fetch website settings for cooldown (cooldownHours)
        const { data: webSettings } = await supabase
          .from("website_settings")
          .select("*")
          .eq("id", 1)
          .single();

        const cooldownHours = webSettings?.default_cooldown_time || 24;
        const cooldownMs = cooldownHours * 60 * 60 * 1000;

        // Check if user has already accepted this task recently
        const { data: existingTasks } = await supabase
          .from("tasks")
          .select("*")
          .eq("worker_id", user.id)
          .eq("job_id", jobId)
          .neq("status", "Rejected");

        const hasRecentTask = (existingTasks || []).some(t => {
          return (Date.now() - new Date(t.created_at).getTime()) < cooldownMs;
        });

        if (hasRecentTask) {
          return res.status(400).json({ 
            error: `আপনি ইতিমধ্যেই এই অফারটি গ্রহণ করেছেন। কুলডাউন পলিসি অনুযায়ী প্রতি ${cooldownHours} ঘণ্টায় কেবল একবার একটি অফার সম্পন্ন করা সম্ভব।` 
          });
        }

        // Insert new task
        const { data: newTask, error: insertTaskErr } = await supabase
          .from("tasks")
          .insert({
            job_id: job.id,
            job_title: job.title,
            cpa_network: job.cpa_network,
            affiliate_link: job.affiliate_link,
            worker_id: user.id,
            worker_name: user.username,
            owner_id: job.user_id,
            owner_name: job.username,
            screenshots: [],
            status: "Accepted"
          })
          .select()
          .single();

        if (insertTaskErr || !newTask) {
          return res.status(500).json({ error: insertTaskErr?.message || "কাজটি গ্রহণ করতে ব্যর্থ হয়েছে।" });
        }

        // Create notification to job owner
        await supabase
          .from("notifications")
          .insert({
            user_id: job.user_id,
            title: "নতুন টাস্ক গ্রহণ",
            message: `মেম্বার ${user.username} আপনার "${job.title}" কাজটি গ্রহণ করেছেন।`,
            read: false
          });

        const frontendTask = {
          id: newTask.id,
          jobId: newTask.job_id,
          jobTitle: newTask.job_title,
          cpaNetwork: newTask.cpa_network,
          affiliateLink: newTask.affiliate_link,
          workerId: newTask.worker_id,
          workerName: newTask.worker_name,
          ownerId: newTask.owner_id,
          ownerName: newTask.owner_name,
          screenshots: newTask.screenshots,
          status: newTask.status,
          createdAt: newTask.created_at
        };

        return res.json({ success: true, message: "কাজটি সফলভাবে গ্রহণ করা হয়েছে। 'My Active Tasks' এ দেখুন।", task: frontendTask });
      } catch (err: any) {
        return res.status(500).json({ error: err.message });
      }
    }

    const db = loadDatabase();
    const userId_local = authHeader.replace("Bearer ", "");
    const user = db.users.find(u => u.id === userId_local);

    if (!user) {
      return res.status(401).json({ error: "ব্যবহারকারী সেশন পাওয়া যায়নি।" });
    }

    if (user.status !== "Approved") {
      return res.status(403).json({ error: "শুধুমাত্র অনুমোদিত (Approved) ব্যবহারকারীরাই অফার সম্পন্ন করতে পারবেন।" });
    }

    const { jobId } = req.body;
    if (!jobId) {
      return res.status(400).json({ error: "Job ID আবশ্যক।" });
    }

    const job = db.jobs.find(j => j.id === jobId);
    if (!job) {
      return res.status(404).json({ error: "সিপিএ অফারটি খুঁজে পাওয়া যায়নি।" });
    }

    if (job.userId === user.id) {
      return res.status(400).json({ error: "আপনি নিজের পোস্ট করা কাজ নিজে সম্পন্ন করতে পারবেন না।" });
    }

    if (job.status !== "Active" || job.remainingSlots <= 0) {
      return res.status(400).json({ error: "দুঃখিত, এই অফারটিতে আর কোনো অবশিষ্ট স্লট নেই বা অফারটি সক্রিয় নয়।" });
    }

    // Cooldown verification
    const cooldownMs = db.settings.cooldownHours * 60 * 60 * 1000;
    const existingTask = db.tasks.find(t => 
      t.workerId === user.id && 
      t.jobId === jobId &&
      t.status !== "Rejected" &&
      (Date.now() - new Date(t.createdAt).getTime()) < cooldownMs
    );

    if (existingTask) {
      return res.status(400).json({ 
        error: `আপনি ইতিমধ্যেই এই অফারটি গ্রহণ করেছেন। কুলডাউন পলিসি অনুযায়ী প্রতি ${db.settings.cooldownHours} ঘণ্টায় কেবল একবার একটি অফার সম্পন্ন করা সম্ভব।` 
      });
    }

    const newTask: TaskSubmission = {
      id: `task_${Math.random().toString(36).substring(2, 9)}`,
      jobId: job.id,
      jobTitle: job.title,
      cpaNetwork: job.cpaNetwork,
      affiliateLink: job.affiliateLink,
      workerId: user.id,
      workerName: user.username,
      ownerId: job.userId,
      ownerName: job.username,
      screenshots: [],
      status: "Accepted",
      createdAt: new Date().toISOString()
    };

    // Real-time simulated Notification to Job Owner
    const newNotif: Notification = {
      id: `notif_${Math.random().toString(36).substring(2, 9)}`,
      userId: job.userId,
      title: "নতুন টাস্ক গ্রহণ",
      message: `মেম্বার ${user.username} আপনার "${job.title}" কাজটি গ্রহণ করেছেন।`,
      createdAt: new Date().toISOString(),
      read: false
    };

    db.tasks.unshift(newTask);
    db.notifications.unshift(newNotif);
    saveDatabase(db);

    res.json({ success: true, message: "কাজটি সফলভাবে গ্রহণ করা হয়েছে। 'My Active Tasks' এ দেখুন।", task: newTask });
  });

  // 15. Submit Proof (Screenshots upload)
  app.post("/api/tasks/submit", async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const userId = authHeader.replace("Bearer ", "");

    if (isSupabaseConfigured && supabase) {
      try {
        const { data: user, error: userErr } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();

        if (userErr || !user) {
          return res.status(401).json({ error: "ব্যবহারকারী সেশন পাওয়া যায়নি।" });
        }

        const { taskId, screenshots } = req.body;
        if (!taskId || !screenshots || !Array.isArray(screenshots)) {
          return res.status(400).json({ error: "সঠিক তথ্যাদি ও স্ক্রিনশটসমূহ আবশ্যক।" });
        }

        if (screenshots.length !== 4) {
          return res.status(400).json({ error: "অনুগ্রহ করে ঠিক ৪টি স্ক্রিনশটই আপলোড করুন।" });
        }

        // Fetch task
        const { data: task, error: taskErr } = await supabase
          .from("tasks")
          .select("*")
          .eq("id", taskId)
          .single();

        if (taskErr || !task) {
          return res.status(404).json({ error: "টাস্কটি খুঁজে পাওয়া যায়নি।" });
        }

        if (task.worker_id !== user.id) {
          return res.status(403).json({ error: "আপনি এই টাস্কটির দায়িত্বপ্রাপ্ত মেম্বার নন।" });
        }

        if (task.status !== "Accepted" && task.status !== "Resubmission Requested") {
          return res.status(400).json({ error: "এই টাস্কটির প্রুফ ইতিমধ্যে জমা দেওয়া হয়েছে।" });
        }

        // Upload any base64 screenshots to Supabase Storage bucket and convert to public urls
        const uploadedUrls = await Promise.all(
          screenshots.map((screen, idx) => uploadBase64ToSupabase(screen, idx, taskId))
        );

        // Update task with screenshots and state
        const { data: updatedTask, error: updateTaskErr } = await supabase
          .from("tasks")
          .update({
            screenshots: uploadedUrls,
            status: "Pending",
            submitted_at: new Date().toISOString()
          })
          .eq("id", taskId)
          .select()
          .single();

        if (updateTaskErr || !updatedTask) {
          return res.status(500).json({ error: updateTaskErr?.message || "প্রুফ জমা দিতে ব্যর্থ হয়েছে।" });
        }

        // Create notification to job owner
        await supabase
          .from("notifications")
          .insert({
            user_id: task.owner_id,
            title: "প্রুফ সাবমিট করা হয়েছে",
            message: `মেম্বার ${user.username} "${task.job_title}" কাজটির ৪টি স্ক্রিনশট প্রুফ জমা দিয়েছেন। অনুগ্রহ করে চেক করুন।`,
            read: false
          });

        const frontendTask = {
          id: updatedTask.id,
          jobId: updatedTask.job_id,
          jobTitle: updatedTask.job_title,
          cpaNetwork: updatedTask.cpa_network,
          affiliateLink: updatedTask.affiliate_link,
          workerId: updatedTask.worker_id,
          workerName: updatedTask.worker_name,
          ownerId: updatedTask.owner_id,
          ownerName: updatedTask.owner_name,
          screenshots: updatedTask.screenshots,
          status: updatedTask.status,
          submittedAt: updatedTask.submitted_at,
          createdAt: updatedTask.created_at
        };

        return res.json({ success: true, message: "আপনার প্রুফটি সফলভাবে পর্যালোচনার জন্য জমা দেওয়া হয়েছে!", task: frontendTask });
      } catch (err: any) {
        return res.status(500).json({ error: err.message });
      }
    }

    const db = loadDatabase();
    const user = db.users.find(u => u.id === userId);

    if (!user) {
      return res.status(401).json({ error: "ব্যবহারকারী সেশন পাওয়া যায়নি।" });
    }

    const { taskId, screenshots } = req.body;
    if (!taskId || !screenshots || !Array.isArray(screenshots)) {
      return res.status(400).json({ error: "সঠিক তথ্যাদি ও স্ক্রিনশটসমূহ আবশ্যক।" });
    }

    if (screenshots.length !== 4) {
      return res.status(400).json({ error: "অনুগ্রহ করে ঠিক ৪টি স্ক্রিনশটই আপলোড করুন।" });
    }

    const task = db.tasks.find(t => t.id === taskId);
    if (!task) {
      return res.status(404).json({ error: "টাস্কটি খুঁজে পাওয়া যায়নি।" });
    }

    if (task.workerId !== user.id) {
      return res.status(403).json({ error: "আপনি এই টাস্কটির দায়িত্বপ্রাপ্ত মেম্বার নন।" });
    }

    if (task.status !== "Accepted" && task.status !== "Resubmission Requested") {
      return res.status(400).json({ error: "এই টাস্কটির প্রুফ ইতিমধ্যে জমা দেওয়া হয়েছে।" });
    }

    task.screenshots = screenshots;
    task.status = "Pending";
    task.submittedAt = new Date().toISOString();

    // Create Notification to Job Owner
    const newNotif: Notification = {
      id: `notif_${Math.random().toString(36).substring(2, 9)}`,
      userId: task.ownerId,
      title: "প্রুফ সাবমিট করা হয়েছে",
      message: `মেম্বার ${user.username} "${task.jobTitle}" কাজটির ৪টি স্ক্রিনশট প্রুফ জমা দিয়েছেন। অনুগ্রহ করে চেক করুন।`,
      createdAt: new Date().toISOString(),
      read: false
    };

    db.notifications.unshift(newNotif);
    saveDatabase(db);

    res.json({ success: true, message: "আপনার প্রুফটি সফলভাবে পর্যালোচনার জন্য জমা দেওয়া হয়েছে!", task });
  });

  // 16. Review Task Submission (Approve / Reject / Resubmission Requested)
  app.post("/api/tasks/review", async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const userId = authHeader.replace("Bearer ", "");

    if (isSupabaseConfigured && supabase) {
      try {
        const { data: user, error: userErr } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();

        if (userErr || !user) {
          return res.status(401).json({ error: "ব্যবহারকারী সেশন পাওয়া যায়নি।" });
        }

        const { taskId, action, rejectionReason } = req.body;
        if (!taskId || !action) {
          return res.status(400).json({ error: "টাস্ক আইডি এবং রিভিও অ্যাকশন আবশ্যক।" });
        }

        // Fetch task
        const { data: task, error: taskErr } = await supabase
          .from("tasks")
          .select("*")
          .eq("id", taskId)
          .single();

        if (taskErr || !task) {
          return res.status(404).json({ error: "টাস্ক সাবমিশন পাওয়া যায়নি।" });
        }

        const isOwner = task.owner_id === user.id;
        const isAdmin = user.role === "admin";

        if (!isOwner && !isAdmin) {
          return res.status(403).json({ error: "আপনি এই কাজের মালিক বা এডমিন নন।" });
        }

        if (task.status !== "Pending") {
          return res.status(400).json({ error: "এই টাস্কটি পেন্ডিং অবস্থায় নেই, রিভিও করা সম্ভব নয়।" });
        }

        // Fetch settings for points reward
        const { data: adminSettings } = await supabase
          .from("website_settings")
          .select("*")
          .eq("id", 1)
          .single();

        const points = adminSettings?.default_surfing_balance_reward || 100;

        if (action === "Approve") {
          // Update task
          await supabase
            .from("tasks")
            .update({
              status: "Approved",
              reviewed_at: new Date().toISOString()
            })
            .eq("id", taskId);

          // Decrement job slots
          const { data: job } = await supabase
            .from("jobs")
            .select("*")
            .eq("id", task.job_id)
            .single();

          if (job) {
            const nextRemaining = Math.max(0, Number(job.remaining_slots) - 1);
            await supabase
              .from("jobs")
              .update({
                remaining_slots: nextRemaining,
                status: nextRemaining === 0 ? "Completed" : job.status
              })
              .eq("id", job.id);
          }

          // Award Worker
          const { data: workerProfile } = await supabase
            .from("profiles")
            .select("surfing_balance, username")
            .eq("id", task.worker_id)
            .single();

          if (workerProfile) {
            const newBal = Number(workerProfile.surfing_balance || 0) + points;
            await supabase
              .from("profiles")
              .update({ surfing_balance: newBal })
              .eq("id", task.worker_id);

            // Notify Worker
            await supabase
              .from("notifications")
              .insert({
                user_id: task.worker_id,
                title: "টাস্ক অনুমোদিত 🎉",
                message: `আপনার "${task.job_title}" কাজের প্রুফ অনুমোদিত হয়েছে এবং আপনার অ্যাকাউন্টে ${points} Surfing Point যোগ হয়েছে।`,
                read: false
              });

            // Log Transaction for Worker
            await supabase
              .from("transactions")
              .insert({
                user_id: task.worker_id,
                username: workerProfile.username || task.worker_name,
                type: "Earned",
                job_title: task.job_title,
                points: points,
                status: "Completed"
              });
          }

          // Award Owner
          const { data: ownerProfile } = await supabase
            .from("profiles")
            .select("surfing_balance, username")
            .eq("id", task.owner_id)
            .single();

          if (ownerProfile) {
            const newBal = Number(ownerProfile.surfing_balance || 0) + points;
            await supabase
              .from("profiles")
              .update({ surfing_balance: newBal })
              .eq("id", task.owner_id);

            // Notify Owner
            await supabase
              .from("notifications")
              .insert({
                user_id: task.owner_id,
                title: "অফার সম্পন্ন বোনাস 🎉",
                message: `আপনার পোস্টকৃত "${task.job_title}" অফারটি সফলভাবে সম্পন্ন করার জন্য আপনার অ্যাকাউন্টে ${points} Surfing Point যোগ হয়েছে।`,
                read: false
              });

            // Log Transaction for Owner
            await supabase
              .from("transactions")
              .insert({
                user_id: task.owner_id,
                username: ownerProfile.username || task.owner_name,
                type: "Earned",
                job_title: task.job_title,
                points: points,
                status: "Completed"
              });
          }

        } else if (action === "Reject") {
          if (!rejectionReason || !rejectionReason.trim()) {
            return res.status(400).json({ error: "বাতিল করার জন্য অবশ্যই কারণ দর্শাতে হবে।" });
          }

          await supabase
            .from("tasks")
            .update({
              status: "Rejected",
              rejection_reason: rejectionReason,
              reviewed_at: new Date().toISOString()
            })
            .eq("id", taskId);

          // Notify worker
          await supabase
            .from("notifications")
            .insert({
              user_id: task.worker_id,
              title: "টাস্ক রিজেক্ট করা হয়েছে ❌",
              message: `আপনার "${task.job_title}" কাজের প্রুফটি রিজেক্ট করা হয়েছে। কারণ: "${rejectionReason}"`,
              read: false
            });

        } else if (action === "Resubmission Requested") {
          if (!rejectionReason || !rejectionReason.trim()) {
            return res.status(400).json({ error: "সংশোধনের নির্দেশনাবলি বা ফিডব্যাক অবশ্যই প্রদান করতে হবে।" });
          }

          await supabase
            .from("tasks")
            .update({
              status: "Resubmission Requested",
              rejection_reason: rejectionReason,
              reviewed_at: new Date().toISOString()
            })
            .eq("id", taskId);

          // Notify worker
          await supabase
            .from("notifications")
            .insert({
              user_id: task.worker_id,
              title: "প্রুফ সংশোধনের অনুরোধ ⚠️",
              message: `আপনার "${task.job_title}" কাজের প্রুফ সংশোধনের অনুরোধ করা হয়েছে। ফিডব্যাক: "${rejectionReason}"`,
              read: false
            });

        } else {
          return res.status(400).json({ error: "ভুল রিভিও কমান্ড।" });
        }

        return res.json({ success: true, message: `টাস্কটি সফলভাবে ${action === "Approve" ? "অনুমোদিত" : action === "Reject" ? "প্রত্যাখ্যাত" : "সংশোধন অনুরোধ"} করা হয়েছে!` });
      } catch (err: any) {
        return res.status(500).json({ error: err.message });
      }
    }

    const db = loadDatabase();
    const user = db.users.find(u => u.id === userId);

    if (!user) {
      return res.status(401).json({ error: "ব্যবহারকারী সেশন পাওয়া যায়নি।" });
    }

    const { taskId, action, rejectionReason } = req.body;
    if (!taskId || !action) {
      return res.status(400).json({ error: "টাস্ক আইডি এবং রিভিও অ্যাকশন আবশ্যক।" });
    }

    const task = db.tasks.find(t => t.id === taskId);
    if (!task) {
      return res.status(404).json({ error: "টাস্ক সাবমিশন পাওয়া যায়নি।" });
    }

    const isOwner = task.ownerId === user.id;
    const isAdmin = user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: "আপনি এই কাজের মালিক বা এডমিন নন।" });
    }

    if (task.status !== "Pending") {
      return res.status(400).json({ error: "এই টাস্কটি পেন্ডিং অবস্থায় নেই, রিভিও করা সম্ভব নয়।" });
    }

    const points = db.settings.rewardPoints;

    if (action === "Approve") {
      task.status = "Approved";
      task.reviewedAt = new Date().toISOString();

      // Decrement job remaining slots
      const job = db.jobs.find(j => j.id === task.jobId);
      if (job) {
        job.remainingSlots = Math.max(0, job.remainingSlots - 1);
        if (job.remainingSlots === 0) {
          job.status = "Completed";
        }
      }

      // Award Surfing Points
      // 1. Worker
      const worker = db.users.find(u => u.id === task.workerId);
      if (worker) {
        worker.surfingBalance = (worker.surfingBalance || 0) + points;
        
        // Notification to worker
        db.notifications.unshift({
          id: `notif_${Math.random().toString(36).substring(2, 9)}`,
          userId: worker.id,
          title: "টাস্ক অনুমোদিত 🎉",
          message: `আপনার "${task.jobTitle}" কাজের প্রুফ অনুমোদিত হয়েছে এবং আপনার অ্যাকাউন্টে ${points} Surfing Point যোগ হয়েছে।`,
          createdAt: new Date().toISOString(),
          read: false
        });

        // Log Transaction
        db.transactions.unshift({
          id: `tx_${Math.random().toString(36).substring(2, 9)}`,
          userId: worker.id,
          username: worker.username,
          date: new Date().toISOString(),
          type: "Earned",
          jobTitle: task.jobTitle,
          points: points,
          status: "Completed"
        });
      }

      // 2. Owner
      const owner = db.users.find(u => u.id === task.ownerId);
      if (owner) {
        owner.surfingBalance = (owner.surfingBalance || 0) + points;

        // Notification to owner
        db.notifications.unshift({
          id: `notif_${Math.random().toString(36).substring(2, 9)}`,
          userId: owner.id,
          title: "অফার সম্পন্ন বোনাস 🎉",
          message: `আপনার পোস্টকৃত "${task.jobTitle}" অফারটি সফলভাবে সম্পন্ন করার জন্য আপনার অ্যাকাউন্টে ${points} Surfing Point যোগ হয়েছে।`,
          createdAt: new Date().toISOString(),
          read: false
        });

        // Log Transaction
        db.transactions.unshift({
          id: `tx_${Math.random().toString(36).substring(2, 9)}`,
          userId: owner.id,
          username: owner.username,
          date: new Date().toISOString(),
          type: "Earned",
          jobTitle: task.jobTitle,
          points: points,
          status: "Completed"
        });
      }

    } else if (action === "Reject") {
      if (!rejectionReason || !rejectionReason.trim()) {
        return res.status(400).json({ error: "বাতিল করার জন্য অবশ্যই কারণ দর্শাতে হবে।" });
      }
      task.status = "Rejected";
      task.rejectionReason = rejectionReason;
      task.reviewedAt = new Date().toISOString();

      // Notification to worker
      db.notifications.unshift({
        id: `notif_${Math.random().toString(36).substring(2, 9)}`,
        userId: task.workerId,
        title: "টাস্ক রিজেক্ট করা হয়েছে ❌",
        message: `আপনার "${task.jobTitle}" কাজের প্রুফটি রিজেক্ট করা হয়েছে। কারণ: "${rejectionReason}"`,
        createdAt: new Date().toISOString(),
        read: false
      });

    } else if (action === "Resubmission Requested") {
      if (!rejectionReason || !rejectionReason.trim()) {
        return res.status(400).json({ error: "সংশোধনের নির্দেশনাবলি বা ফিডব্যাক অবশ্যই প্রদান করতে হবে।" });
      }
      task.status = "Resubmission Requested";
      task.rejectionReason = rejectionReason; // Save instructions as rejectionReason field
      task.reviewedAt = new Date().toISOString();

      // Notification to worker
      db.notifications.unshift({
        id: `notif_${Math.random().toString(36).substring(2, 9)}`,
        userId: task.workerId,
        title: "প্রুফ সংশোধনের অনুরোধ ⚠️",
        message: `আপনার "${task.jobTitle}" কাজের প্রুফ সংশোধনের অনুরোধ করা হয়েছে। ফিডব্যাক: "${rejectionReason}"`,
        createdAt: new Date().toISOString(),
        read: false
      });

    } else {
      return res.status(400).json({ error: "ভুল রিভিও কমান্ড।" });
    }

    saveDatabase(db);
    res.json({ success: true, message: `টাস্কটি সফলভাবে ${action === "Approve" ? "অনুমোদিত" : action === "Reject" ? "প্রত্যাখ্যাত" : "সংশোধন অনুরোধ"} করা হয়েছে!`, task });
  });

  // 17. Fetch Tasks (Both as Worker and as Owner)
  app.get("/api/tasks", async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const userId = authHeader.replace("Bearer ", "");

    if (isSupabaseConfigured && supabase) {
      try {
        const { data: user } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();

        // Fetch tasks as worker
        const { data: tasksWorker } = await supabase
          .from("tasks")
          .select("*")
          .eq("worker_id", userId)
          .order("created_at", { ascending: false });

        // Fetch tasks as owner
        const { data: tasksOwner } = await supabase
          .from("tasks")
          .select("*")
          .eq("owner_id", userId)
          .order("created_at", { ascending: false });

        // Fetch all tasks if admin
        let allTasks: any[] = [];
        if (user?.role === "admin") {
          const { data: adminTasks } = await supabase
            .from("tasks")
            .select("*")
            .order("created_at", { ascending: false });
          allTasks = adminTasks || [];
        }

        const mapTask = (t: any) => ({
          id: t.id,
          jobId: t.job_id,
          jobTitle: t.job_title,
          cpaNetwork: t.cpa_network,
          affiliateLink: t.affiliate_link,
          workerId: t.worker_id,
          workerName: t.worker_name,
          ownerId: t.owner_id,
          ownerName: t.owner_name,
          screenshots: t.screenshots || [],
          status: t.status,
          rejectionReason: t.rejection_reason,
          createdAt: t.created_at,
          submittedAt: t.submitted_at,
          reviewedAt: t.reviewed_at
        });

        return res.json({
          success: true,
          tasksAsWorker: (tasksWorker || []).map(mapTask),
          tasksAsOwner: (tasksOwner || []).map(mapTask),
          allTasks: allTasks.map(mapTask)
        });
      } catch (err: any) {
        return res.status(500).json({ error: err.message });
      }
    }

    const db = loadDatabase();
    const userId_local = authHeader.replace("Bearer ", "");
    const user = db.users.find(u => u.id === userId_local);

    const tasksAsWorker = db.tasks.filter(t => t.workerId === userId);
    const tasksAsOwner = db.tasks.filter(t => t.ownerId === userId);
    const allTasks = user?.role === "admin" ? db.tasks : [];

    res.json({ success: true, tasksAsWorker, tasksAsOwner, allTasks });
  });

  // 18. Fetch Notifications
  app.get("/api/notifications", async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const userId = authHeader.replace("Bearer ", "");

    if (isSupabaseConfigured && supabase) {
      try {
        const { data: notifications, error } = await supabase
          .from("notifications")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });

        if (error) {
          return res.status(500).json({ error: error.message });
        }

        const mapped = (notifications || []).map(n => ({
          id: n.id,
          userId: n.user_id,
          title: n.title,
          message: n.message,
          createdAt: n.created_at,
          read: n.read
        }));

        return res.json({ success: true, notifications: mapped });
      } catch (err: any) {
        return res.status(500).json({ error: err.message });
      }
    }

    const db = loadDatabase();
    const userNotifs = db.notifications.filter(n => n.userId === userId);
    res.json({ success: true, notifications: userNotifs });
  });

  // 19. Mark Notifications as Read
  app.post("/api/notifications/read", async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const userId = authHeader.replace("Bearer ", "");
    const { notifId } = req.body;

    if (isSupabaseConfigured && supabase) {
      try {
        if (notifId) {
          await supabase
            .from("notifications")
            .update({ read: true })
            .eq("id", notifId)
            .eq("user_id", userId);
        } else {
          // Mark all as read
          await supabase
            .from("notifications")
            .update({ read: true })
            .eq("user_id", userId);
        }
        return res.json({ success: true });
      } catch (err: any) {
        return res.status(500).json({ error: err.message });
      }
    }

    const db = loadDatabase();
    if (notifId) {
      const notif = db.notifications.find(n => n.id === notifId && n.userId === userId);
      if (notif) notif.read = true;
    } else {
      db.notifications.forEach(n => {
        if (n.userId === userId) n.read = true;
      });
    }
    saveDatabase(db);
    res.json({ success: true });
  });

  // 20. Get Admin / System Settings
  app.get("/api/admin/settings", async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const userId = authHeader.replace("Bearer ", "");

    if (isSupabaseConfigured && supabase) {
      try {
        const { data: webSettings } = await supabase
          .from("website_settings")
          .select("*")
          .eq("id", 1)
          .single();

        const cooldownHours = webSettings?.default_cooldown_time ?? 24;
        const rewardPoints = webSettings?.default_surfing_balance_reward ?? 100;

        return res.json({
          success: true,
          settings: { cooldownHours, rewardPoints }
        });
      } catch (err: any) {
        return res.status(500).json({ error: err.message });
      }
    }

    const db = loadDatabase();
    const user = db.users.find(u => u.id === userId);

    if (!user) {
      return res.status(401).json({ error: "সেশন পাওয়া যায়নি।" });
    }

    res.json({ success: true, settings: db.settings });
  });

  // 21. Update Admin / System Settings
  app.post("/api/admin/settings", async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const userId = authHeader.replace("Bearer ", "");

    if (isSupabaseConfigured && supabase) {
      try {
        const { data: user } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();

        if (!user || user.role !== "admin") {
          return res.status(403).json({ error: "শুধুমাত্র এডমিনগণ এই পরিবর্তন করতে পারবেন।" });
        }

        const { cooldownHours, rewardPoints } = req.body;
        const updates: any = {};

        if (cooldownHours !== undefined) {
          const ch = parseInt(cooldownHours, 10);
          if (!isNaN(ch) && ch >= 0) {
            updates.default_cooldown_time = ch;
          }
        }

        if (rewardPoints !== undefined) {
          const rp = parseInt(rewardPoints, 10);
          if (!isNaN(rp) && rp >= 0) {
            updates.default_surfing_balance_reward = rp;
          }
        }

        if (Object.keys(updates).length > 0) {
          await supabase
            .from("website_settings")
            .update(updates)
            .eq("id", 1);
        }

        return res.json({
          success: true,
          message: "সিস্টেম সেটিংস সফলভাবে আপডেট করা হয়েছে!",
          settings: {
            cooldownHours: updates.default_cooldown_time ?? cooldownHours,
            rewardPoints: updates.default_surfing_balance_reward ?? rewardPoints
          }
        });
      } catch (err: any) {
        return res.status(500).json({ error: err.message });
      }
    }

    const db = loadDatabase();
    const user = db.users.find(u => u.id === userId);

    if (!user || user.role !== "admin") {
      return res.status(403).json({ error: "শুধুমাত্র এডমিনগণ এই পরিবর্তন করতে পারবেন।" });
    }

    const { cooldownHours, rewardPoints } = req.body;

    if (cooldownHours !== undefined) {
      const ch = parseInt(cooldownHours, 10);
      if (!isNaN(ch) && ch >= 0) {
        db.settings.cooldownHours = ch;
      }
    }

    if (rewardPoints !== undefined) {
      const rp = parseInt(rewardPoints, 10);
      if (!isNaN(rp) && rp >= 0) {
        db.settings.rewardPoints = rp;
      }
    }

    saveDatabase(db);
    res.json({ success: true, message: "সিস্টেম সেটিংস সফলভাবে আপডেট করা হয়েছে!", settings: db.settings });
  });

  // 22. Reset User Password (by Admin)
  app.post("/api/admin/reset-user-password", async (req, res) => {
    const authHeader = req.headers.authorization;
    const { targetUserId } = req.body;

    if (!authHeader) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const adminId = authHeader.replace("Bearer ", "");

    if (isSupabaseConfigured && supabase) {
      try {
        const { data: adminUser } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", adminId)
          .single();

        if (!adminUser || adminUser.role !== "admin") {
          return res.status(403).json({ error: "শুধুমাত্র Admin পাসওয়ার্ড রিসেট করতে পারবেন।" });
        }

        const { data: targetUser } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", targetUserId)
          .single();

        if (!targetUser) {
          return res.status(404).json({ error: "ব্যবহারকারী খুঁজে পাওয়া যায়নি।" });
        }

        const resetToken = `reset_${Math.random().toString(36).substring(2, 15)}`;
        
        // Insert simulated email
        await supabase
          .from("simulated_emails")
          .insert({
            to: targetUser.email || "",
            subject: "CPA Fresh Sign-up BD — Password Reset Link (By Admin)",
            body: `এডমিন আপনার একাউন্টের পাসওয়ার্ড রিসেট করার অনুরোধ পাঠিয়েছেন। পাসওয়ার্ড রিসেট করতে নিচের লিংকে ক্লিক করুন।`,
            link: `/reset-password?token=${resetToken}`
          });

        // Insert audit log
        await supabase
          .from("audit_logs")
          .insert({
            action: "Password Reset Requested",
            admin_id: adminUser.id,
            admin_name: adminUser.username,
            details: `Requested password reset for user ${targetUser.username} (${targetUser.email})`
          });

        return res.json({ success: true, message: "পাসওয়ার্ড রিসেট লিংকটি সফলভাবে ইউজারের ইমেইলে পাঠানো হয়েছে! (Simulated Mailbox চেক করুন)" });
      } catch (err: any) {
        return res.status(500).json({ error: err.message });
      }
    }

    const db = loadDatabase();
    const adminUser = db.users.find(u => u.id === adminId);

    if (!adminUser || adminUser.role !== "admin") {
      return res.status(403).json({ error: "শুধুমাত্র Admin পাসওয়ার্ড রিসেট করতে পারবেন।" });
    }

    const targetUser = db.users.find(u => u.id === targetUserId);
    if (!targetUser) {
      return res.status(404).json({ error: "ব্যবহারকারী খুঁজে পাওয়া যায়নি।" });
    }

    const resetToken = `reset_${Math.random().toString(36).substring(2, 15)}`;
    const newEmail: SimulatedEmail = {
      id: `email_reset_${Date.now()}`,
      to: targetUser.email,
      subject: "CPA Fresh Sign-up BD — Password Reset Link (By Admin)",
      body: `এডমিন আপনার একাউন্টের পাসওয়ার্ড রিসেট করার অনুরোধ পাঠিয়েছেন। পাসওয়ার্ড রিসেট করতে নিচের লিংকে ক্লিক করুন।`,
      link: `/reset-password?token=${resetToken}`,
      createdAt: new Date().toISOString()
    };

    db.emails.unshift(newEmail);
    
    // Add Audit Log
    db.auditLogs.unshift({
      id: `audit_${Math.random().toString(36).substring(2, 9)}`,
      action: "Password Reset Requested",
      adminId: adminUser.id,
      adminName: adminUser.username,
      details: `Requested password reset for user ${targetUser.username} (${targetUser.email})`,
      createdAt: new Date().toISOString()
    });

    saveDatabase(db);
    res.json({ success: true, message: "পাসওয়ার্ড রিসেট লিংকটি সফলভাবে ইউজারের ইমেইলে পাঠানো হয়েছে! (Simulated Mailbox চেক করুন)" });
  });

  // 23. Fetch Wallet Transactions
  app.get("/api/transactions", async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const userId = authHeader.replace("Bearer ", "");

    if (isSupabaseConfigured && supabase) {
      try {
        const { data: user } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();

        if (!user) {
          return res.status(401).json({ error: "সেশন পাওয়া যায়নি।" });
        }

        let query = supabase.from("transactions").select("*");
        if (user.role !== "admin") {
          query = query.eq("user_id", userId);
        }

        const { data: txs, error } = await query.order("date", { ascending: false });

        if (error) {
          return res.status(500).json({ error: error.message });
        }

        const mapped = (txs || []).map(t => ({
          id: t.id,
          userId: t.user_id,
          username: t.username,
          date: t.date,
          type: t.type,
          jobTitle: t.job_title,
          points: Number(t.points),
          status: t.status
        }));

        return res.json({ success: true, transactions: mapped });
      } catch (err: any) {
        return res.status(500).json({ error: err.message });
      }
    }

    const db = loadDatabase();
    const user = db.users.find(u => u.id === userId);
    if (!user) {
      return res.status(401).json({ error: "সেশন পাওয়া যায়নি।" });
    }

    if (user.role === "admin") {
      return res.json({ success: true, transactions: db.transactions });
    }

    const txs = db.transactions.filter(t => t.userId === user.id);
    res.json({ success: true, transactions: txs });
  });

  // 24. Fetch Admin Audit Logs
  app.get("/api/admin/audit-logs", async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const adminId = authHeader.replace("Bearer ", "");

    if (isSupabaseConfigured && supabase) {
      try {
        const { data: adminUser } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", adminId)
          .single();

        if (!adminUser || adminUser.role !== "admin") {
          return res.status(403).json({ error: "শুধুমাত্র Admin এটি দেখতে পারবেন।" });
        }

        const { data: logs, error } = await supabase
          .from("audit_logs")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          return res.status(500).json({ error: error.message });
        }

        const mapped = (logs || []).map(l => ({
          id: l.id,
          action: l.action,
          adminId: l.admin_id,
          adminName: l.admin_name,
          details: l.details,
          createdAt: l.created_at
        }));

        return res.json({ success: true, auditLogs: mapped });
      } catch (err: any) {
        return res.status(500).json({ error: err.message });
      }
    }

    const db = loadDatabase();
    const adminUser = db.users.find(u => u.id === adminId);
    if (!adminUser || adminUser.role !== "admin") {
      return res.status(403).json({ error: "শুধুমাত্র Admin এটি দেখতে পারবেন।" });
    }
    res.json({ success: true, auditLogs: db.auditLogs });
  });

  // 25. Get Website Settings
  app.get("/api/admin/website-settings", async (req, res) => {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: ws, error } = await supabase
          .from("website_settings")
          .select("*")
          .eq("id", 1)
          .single();

        if (error) {
          return res.status(500).json({ error: error.message });
        }

        const mapped = {
          websiteName: ws.website_name,
          logo: ws.logo,
          maintenanceMode: ws.maintenance_mode,
          defaultCooldownTime: Number(ws.default_cooldown_time),
          defaultSurfingBalanceReward: Number(ws.default_surfing_balance_reward),
          supportedCpaNetworks: ws.supported_cpa_networks,
          homepageBannerText: ws.homepage_banner_text,
          contactEmail: ws.contact_email
        };

        return res.json({ success: true, websiteSettings: mapped });
      } catch (err: any) {
        return res.status(500).json({ error: err.message });
      }
    }

    const db = loadDatabase();
    res.json({ success: true, websiteSettings: db.websiteSettings });
  });

  // 26. Update Website Settings
  app.post("/api/admin/website-settings", async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const adminId = authHeader.replace("Bearer ", "");

    if (isSupabaseConfigured && supabase) {
      try {
        const { data: adminUser } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", adminId)
          .single();

        if (!adminUser || adminUser.role !== "admin") {
          return res.status(403).json({ error: "শুধুমাত্র Admin এটি পরিবর্তন করতে পারবেন।" });
        }

        const { websiteName, logo, maintenanceMode, defaultCooldownTime, defaultSurfingBalanceReward, supportedCpaNetworks, homepageBannerText, contactEmail } = req.body;
        const updates: any = {};

        if (websiteName !== undefined) updates.website_name = websiteName;
        if (logo !== undefined) updates.logo = logo;
        if (maintenanceMode !== undefined) updates.maintenance_mode = maintenanceMode;
        if (defaultCooldownTime !== undefined) updates.default_cooldown_time = Number(defaultCooldownTime);
        if (defaultSurfingBalanceReward !== undefined) updates.default_surfing_balance_reward = Number(defaultSurfingBalanceReward);
        if (supportedCpaNetworks !== undefined) updates.supported_cpa_networks = supportedCpaNetworks;
        if (homepageBannerText !== undefined) updates.homepage_banner_text = homepageBannerText;
        if (contactEmail !== undefined) updates.contact_email = contactEmail;

        const { data: updatedWs, error } = await supabase
          .from("website_settings")
          .update(updates)
          .eq("id", 1)
          .select()
          .single();

        if (error || !updatedWs) {
          return res.status(500).json({ error: error?.message || "ব্যর্থ হয়েছে।" });
        }

        // Add audit log
        await supabase
          .from("audit_logs")
          .insert({
            action: "Website Settings Updated",
            admin_id: adminUser.id,
            admin_name: adminUser.username,
            details: `Updated website settings: ${JSON.stringify(req.body)}`
          });

        const mapped = {
          websiteName: updatedWs.website_name,
          logo: updatedWs.logo,
          maintenanceMode: updatedWs.maintenance_mode,
          defaultCooldownTime: Number(updatedWs.default_cooldown_time),
          defaultSurfingBalanceReward: Number(updatedWs.default_surfing_balance_reward),
          supportedCpaNetworks: updatedWs.supported_cpa_networks,
          homepageBannerText: updatedWs.homepage_banner_text,
          contactEmail: updatedWs.contact_email
        };

        return res.json({ success: true, message: "ওয়েবসাইট সেটিংস সফলভাবে আপডেট করা হয়েছে!", websiteSettings: mapped });
      } catch (err: any) {
        return res.status(500).json({ error: err.message });
      }
    }

    const db = loadDatabase();
    const adminUser = db.users.find(u => u.id === adminId);
    if (!adminUser || adminUser.role !== "admin") {
      return res.status(403).json({ error: "শুধুমাত্র Admin এটি পরিবর্তন করতে পারবেন।" });
    }

    const { websiteName, logo, maintenanceMode, defaultCooldownTime, defaultSurfingBalanceReward, supportedCpaNetworks, homepageBannerText, contactEmail } = req.body;

    if (websiteName) db.websiteSettings.websiteName = websiteName;
    if (logo !== undefined) db.websiteSettings.logo = logo;
    if (maintenanceMode !== undefined) db.websiteSettings.maintenanceMode = maintenanceMode;
    if (defaultCooldownTime !== undefined) db.websiteSettings.defaultCooldownTime = Number(defaultCooldownTime);
    if (defaultSurfingBalanceReward !== undefined) db.websiteSettings.defaultSurfingBalanceReward = Number(defaultSurfingBalanceReward);
    if (supportedCpaNetworks) db.websiteSettings.supportedCpaNetworks = supportedCpaNetworks;
    if (homepageBannerText) db.websiteSettings.homepageBannerText = homepageBannerText;
    if (contactEmail) db.websiteSettings.contactEmail = contactEmail;

    // Also sync standard settings for compatibility
    db.settings.cooldownHours = db.websiteSettings.defaultCooldownTime;
    db.settings.rewardPoints = db.websiteSettings.defaultSurfingBalanceReward;

    // Audit Log
    db.auditLogs.unshift({
      id: `audit_${Math.random().toString(36).substring(2, 9)}`,
      action: "Website Settings Updated",
      adminId: adminUser.id,
      adminName: adminUser.username,
      details: `Updated website settings: ${JSON.stringify(req.body)}`,
      createdAt: new Date().toISOString()
    });

    saveDatabase(db);
    res.json({ success: true, message: "ওয়েবসাইট সেটিংস সফলভাবে আপডেট করা হয়েছে!", websiteSettings: db.websiteSettings });
  });
  app.post("/api/reset-all-data", (req, res) => {
    if (fs.existsSync(DB_FILE)) {
      fs.unlinkSync(DB_FILE);
    }
    loadDatabase();
    res.json({ success: true, message: "ডেটাবেস সফলভাবে রি-সেট করা হয়েছে।" });
  });

  // Initialize DB before starting
  loadDatabase();

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
