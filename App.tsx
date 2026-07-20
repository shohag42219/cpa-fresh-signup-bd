import React, { useState, useEffect } from "react";
import { 
  User as UserIcon, 
  Mail, 
  Lock, 
  MapPin, 
  Compass, 
  CheckCircle, 
  XCircle, 
  ShieldAlert, 
  LogOut, 
  Users, 
  Clock, 
  Database, 
  KeyRound, 
  Building, 
  Hash, 
  Sparkles,
  Info,
  ExternalLink,
  RefreshCw,
  Ban,
  Play,
  Bell
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { User, UserStatus, ViewState, Job, TaskSubmission, Notification, SystemSettings, Transaction } from "./types";
import SupabaseConsole from "./SupabaseConsole";
import Mailbox from "./Mailbox";
import JobPostingForm from "./JobPostingForm";
import TaskFeed from "./TaskFeed";
import MyJobsList from "./MyJobsList";
import ActiveTasksList from "./ActiveTasksList";
import TaskHistoryList from "./TaskHistoryList";
import ReceivedSubmissionsList from "./ReceivedSubmissionsList";
import NotificationCenter from "./NotificationCenter";

// Newly created Step 4 components
import WalletPage from "./WalletPage";
import AdminDashboard from "./AdminDashboard";
import AdminUserManagement from "./AdminUserManagement";
import AdminJobManagement from "./AdminJobManagement";
import AdminProofManagement from "./AdminProofManagement";
import AdminReports from "./AdminReports";
import AdminSettings from "./AdminSettings";
import AdminSecurity from "./AdminSecurity";


export default function App() {
  // Authentication & View State
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<ViewState>("login");
  const [token, setToken] = useState<string>("");

  // Job Posting & Task Feed Module States
  const [jobs, setJobs] = useState<Job[]>([]);
  const [dashboardTab, setDashboardTab] = useState<
    "task-feed" | "my-jobs" | "active-tasks" | "task-history" | "received-proofs" | "wallet"
  >("task-feed");
  const [isPostingJob, setIsPostingJob] = useState(false);
  const [jobToEdit, setJobToEdit] = useState<Job | null>(null);

  // Step 3 States
  const [tasksAsWorker, setTasksAsWorker] = useState<TaskSubmission[]>([]);
  const [tasksAsOwner, setTasksAsOwner] = useState<TaskSubmission[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({ cooldownHours: 24, rewardPoints: 1 });
  const [showNotifCenter, setShowNotifCenter] = useState(false);

  // Simulated Inbox state hooks to route straight to verify/reset pages
  const [verifyToken, setVerifyToken] = useState<string>("");
  const [resetToken, setResetToken] = useState<string>("");

  // Login Form States
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loginSuccess, setLoginSuccess] = useState("");

  // Registration Form States
  const [regUsername, setRegUsername] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regDistrict, setRegDistrict] = useState("");
  const [regUpazila, setRegUpazila] = useState("");
  const [regVillage, setRegVillage] = useState("");
  const [regPostalCode, setRegPostalCode] = useState("");
  const [regCpaNetworks, setRegCpaNetworks] = useState<string[]>([]);
  const [regTermsChecked, setRegTermsChecked] = useState(false);
  const [regError, setRegError] = useState("");
  const [regSuccess, setRegSuccess] = useState("");

  // Forgot Password States
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotError, setForgotError] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState("");

  // Reset Password States
  const [resetPassword, setResetPassword] = useState("");
  const [resetConfirmPassword, setResetConfirmPassword] = useState("");
  const [resetError, setResetError] = useState("");
  const [resetSuccess, setResetSuccess] = useState("");

  // Admin View States
  const [adminUsers, setAdminUsers] = useState<User[]>([]);
  const [adminFilter, setAdminFilter] = useState<UserStatus | "All">("All");
  const [adminSearch, setAdminSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [adminTab, setAdminTab] = useState<
    "dashboard" | "users" | "jobs" | "proofs" | "reports" | "settings" | "security"
  >("dashboard");
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminMessage, setAdminMessage] = useState("");
  const [adminTasks, setAdminTasks] = useState<TaskSubmission[]>([]);
  const [adminTransactions, setAdminTransactions] = useState<Transaction[]>([]);

  // Bangladesh Districts List
  const bangladeshDistricts = [
    "Bagerhat", "Bandarban", "Barguna", "Barisal", "Bhola", "Bogura", "Brahmanbaria", 
    "Chandpur", "Chapai Nawabganj", "Chattogram", "Chuadanga", "Cox's Bazar", "Cumilla", 
    "Dhaka", "Dinajpur", "Faridpur", "Feni", "Gaibandha", "Gazipur", "Gopalganj", 
    "Habiganj", "Jamalpur", "Jashore", "Jhalokathi", "Jhenaidah", "Joypurhat", 
    "Khagrachari", "Khulna", "Kishoreganj", "Kurigram", "Kushtia", "Lakshmipur", 
    "Lalmonirhat", "Madaripur", "Magura", "Manikganj", "Meherpur", "Moulvibazar", 
    "Munshiganj", "Mymensingh", "Naogaon", "Narail", "Narayanganj", "Narsingdi", 
    "Natore", "Netrokona", "Nilphamari", "Noakhali", "Pabna", "Panchagarh", 
    "Patuakhali", "Pirojpur", "Rajbari", "Rajshahi", "Rangamati", "Rangpur", 
    "Satkhira", "Shariatpur", "Sherpur", "Sirajganj", "Sunamganj", "Sylhet", 
    "Tangail", "Thakurgaon"
  ];

  // Available CPA Networks
  const availableCpaNetworks = [
    "MyLead", "CPAGrip", "CPAFull", "AdWorkMedia", "ogads", "CPAlead", "MaxBounty",
    "Advertica", "Affmine", "AdBlueMedia", "Adsterra"
  ];

  // Check existing session on load
  useEffect(() => {
    const savedUserId = localStorage.getItem("cpa_user_id");
    if (savedUserId) {
      fetchUserSession(savedUserId);
    }

    // Check query params for verify / reset tokens if accessed via traditional URL redirects
    const params = new URLSearchParams(window.location.search);
    const vToken = params.get("token");
    if (window.location.pathname === "/verify-email" && vToken) {
      handleMailboxVerify(vToken);
    } else if (window.location.pathname === "/reset-password" && vToken) {
      setResetToken(vToken);
      setView("reset-password");
    }
  }, []);

  // Reset forms on view change
  useEffect(() => {
    setLoginError("");
    setLoginSuccess("");
    setRegError("");
    setRegSuccess("");
    setForgotError("");
    setForgotSuccess("");
    setResetError("");
    setResetSuccess("");
    
    // Reset inputs
    setLoginEmail("");
    setLoginPassword("");
    setRegUsername("");
    setRegEmail("");
    setRegPassword("");
    setRegDistrict("");
    setRegUpazila("");
    setRegVillage("");
    setRegPostalCode("");
    setRegCpaNetworks([]);
    setRegTermsChecked(false);
    setForgotEmail("");
    setResetPassword("");
    setResetConfirmPassword("");
  }, [view]);

  const fetchUserSession = async (userId: string) => {
    try {
      const res = await fetch("/api/me", {
        headers: { "Authorization": `Bearer ${userId}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        fetchAllData(userId);
        if (data.user.role === "admin") {
          setView("admin-panel");
          fetchAdminUsers(userId);
        } else {
          setView("dashboard");
        }
      } else {
        localStorage.removeItem("cpa_user_id");
      }
    } catch (err) {
      console.error("Session fetch failed", err);
    }
  };

  const fetchAdminUsers = async (adminId: string) => {
    setAdminLoading(true);
    try {
      const res = await fetch("/api/admin/users", {
        headers: { "Authorization": `Bearer ${adminId}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAdminUsers(data.users);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAdminLoading(false);
    }
  };

  // Login handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoginSuccess("");

    if (!loginEmail || !loginPassword) {
      setLoginError("অনুগ্রহ করে ইমেইল এবং পাসওয়ার্ড দুটিই লিখুন।");
      return;
    }

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });
      const data = await res.json();

      if (!res.ok) {
        setLoginError(data.error || "লগইন ব্যর্থ হয়েছে।");
        return;
      }

      setLoginSuccess("লগইন সফল হয়েছে!");
      if (rememberMe) {
        localStorage.setItem("cpa_user_id", data.user.id);
      }
      
      setUser(data.user);
      fetchAllData(data.user.id);
      if (data.user.role === "admin") {
        setView("admin-panel");
        fetchAdminUsers(data.user.id);
      } else {
        setView("dashboard");
      }
    } catch (err) {
      setLoginError("সার্ভারের সাথে যোগাযোগ করা যাচ্ছে না।");
    }
  };

  // Quick Login helpers for easy testing
  const handleQuickLogin = (email: string, pass: string) => {
    setLoginEmail(email);
    setLoginPassword(pass);
    setLoginError("");
  };

  // Register handler
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError("");
    setRegSuccess("");

    if (!regUsername || !regEmail || !regPassword || !regDistrict || !regUpazila || !regVillage || !regPostalCode) {
      setRegError("সবগুলো ঘর অবশ্যই সঠিকভাবে পূরণ করতে হবে।");
      return;
    }

    if (regCpaNetworks.length === 0) {
      setRegError("কমপক্ষে ১টি CPA নেটওয়ার্ক নির্বাচন করুন।");
      return;
    }

    if (!regTermsChecked) {
      setRegError("আপনাকে অবশ্যই শর্তাবলীতে সম্মতি দিতে হবে।");
      return;
    }

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: regUsername,
          email: regEmail,
          password: regPassword,
          district: regDistrict,
          upazila: regUpazila,
          village: regVillage,
          postalCode: regPostalCode,
          cpaNetworks: regCpaNetworks,
          termsChecked: regTermsChecked
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setRegError(data.error || "নিবন্ধন করা সম্ভব হয়নি।");
        return;
      }

      setRegSuccess("নিবন্ধন সফল হয়েছে! ভেরিফিকেশন ইমেইল পাঠানো হয়েছে। ডানদিকের ইমেইল আইকনে ক্লিক করে ইনবক্স চেক করুন।");
      // Clear form
      setRegUsername("");
      setRegEmail("");
      setRegPassword("");
      setRegDistrict("");
      setRegUpazila("");
      setRegVillage("");
      setRegPostalCode("");
      setRegCpaNetworks([]);
      setRegTermsChecked(false);
      
      // Auto-focus the login page switch
      setTimeout(() => setView("login"), 6000);
    } catch (err) {
      setRegError("সার্ভার ত্রুটি। আবার চেষ্টা করুন।");
    }
  };

  // Forgot password handler
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError("");
    setForgotSuccess("");

    if (!forgotEmail) {
      setForgotError("আপনার রেজিস্ট্রিকৃত ইমেইলটি দিন।");
      return;
    }

    try {
      const res = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail })
      });
      const data = await res.json();

      if (!res.ok) {
        setForgotError(data.error);
        return;
      }

      setForgotSuccess(data.message);
      setForgotEmail("");
    } catch (err) {
      setForgotError("সার্ভার সমস্যা হয়েছে।");
    }
  };

  // Reset password handler
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError("");
    setResetSuccess("");

    if (!resetPassword || !resetConfirmPassword) {
      setResetError("পাসওয়ার্ডের ঘরগুলো পূরণ করুন।");
      return;
    }

    if (resetPassword !== resetConfirmPassword) {
      setResetError("পাসওয়ার্ড দুটি মেলেনি।");
      return;
    }

    try {
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: resetToken, newPassword: resetPassword })
      });
      const data = await res.json();

      if (!res.ok) {
        setResetError(data.error);
        return;
      }

      setResetSuccess(data.message);
      setResetPassword("");
      setResetConfirmPassword("");
      setTimeout(() => {
        setResetToken("");
        setView("login");
      }, 3500);
    } catch (err) {
      setResetError("সার্ভার ত্রুটি।");
    }
  };

  // Admin — Update user status
  const handleUpdateStatus = async (targetUserId: string, action: string) => {
    setAdminMessage("");
    if (!user) return;

    try {
      const res = await fetch("/api/admin/update-status", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user.id}`
        },
        body: JSON.stringify({ targetUserId, action })
      });
      const data = await res.json();

      if (!res.ok) {
        setAdminMessage(`❌ ভুল হয়েছে: ${data.error}`);
        return;
      }

      setAdminMessage(`✅ সফল হয়েছে: স্ট্যাটাস আপডেট করা হয়েছে!`);
      // Update local state
      setAdminUsers(prev => prev.map(u => u.id === targetUserId ? { ...u, status: data.user.status } : u));
      if (selectedUser && selectedUser.id === targetUserId) {
        setSelectedUser({ ...selectedUser, status: data.user.status });
      }
    } catch (err) {
      setAdminMessage("সার্ভারে পরিবর্তন করা যায়নি।");
    }
  };

  // Admin — Reset user password
  const handleAdminResetUserPassword = async (targetUserId: string): Promise<string> => {
    if (!user) throw new Error("Unauthorized");
    const res = await fetch("/api/admin/reset-user-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${user.id}`
      },
      body: JSON.stringify({ targetUserId })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "পাসওয়ার্ড রিসেট করতে ব্যর্থ হয়েছে।");
    }
    return data.message;
  };

  // Admin — Review Task submission
  const handleAdminReviewTask = async (
    taskId: string, 
    action: "Approve" | "Reject" | "Resubmission Requested", 
    rejectionReason?: string
  ) => {
    if (!user) throw new Error("Unauthorized");
    const res = await fetch("/api/tasks/review", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${user.id}`
      },
      body: JSON.stringify({ taskId, action, rejectionReason })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "টাস্ক রিভিউ করতে ব্যর্থ হয়েছে।");
    }
    fetchAllData(user.id);
  };

  // Admin — Delete Job
  const handleAdminDeleteJob = async (jobId: string) => {
    if (!user) throw new Error("Unauthorized");
    const res = await fetch("/api/jobs/delete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${user.id}`
      },
      body: JSON.stringify({ id: jobId })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "জব ডিলিট করতে ব্যর্থ হয়েছে।");
    }
    fetchAllData(user.id);
  };

  // Mailbox simulation callback: User clicks verify email link
  const handleMailboxVerify = async (token: string) => {
    try {
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token })
      });
      const data = await res.json();
      if (res.ok) {
        alert("✅ ইমেইল ভেরিফিকেশন সফল হয়েছে! এখন আপনি নতুন একাউন্টে লগইন করতে পারবেন।");
        setView("login");
      } else {
        alert(`❌ ভেরিফিকেশন ব্যর্থ: ${data.error}`);
      }
    } catch (err) {
      alert("নেটওয়ার্ক সমস্যা। ভেরিফাই করা যায়নি।");
    }
  };

  // Mailbox simulation callback: User clicks password reset link
  const handleMailboxReset = (token: string) => {
    setResetToken(token);
    setView("reset-password");
  };

  // --- CPA OFFER MANAGEMENT ACTIONS ---
  
  // Fetch CPA jobs from Server
  const fetchJobs = async (userId?: string) => {
    const activeUserId = userId || user?.id;
    if (!activeUserId) return;
    try {
      const res = await fetch("/api/jobs", {
        headers: { "Authorization": `Bearer ${activeUserId}` }
      });
      if (res.ok) {
        const data = await res.json();
        setJobs(data.jobs || []);
      }
    } catch (err) {
      console.error("Failed to fetch jobs:", err);
    }
  };

  // Fetch Tasks (both accepted as worker and received as owner)
  const fetchTasks = async (userId?: string) => {
    const activeUserId = userId || user?.id;
    if (!activeUserId) return;
    try {
      const res = await fetch("/api/tasks", {
        headers: { "Authorization": `Bearer ${activeUserId}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTasksAsWorker(data.tasksAsWorker || []);
        setTasksAsOwner(data.tasksAsOwner || []);
        if (data.allTasks) {
          setAdminTasks(data.allTasks);
        }
      }
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
    }
  };

  // Fetch Wallet Transactions
  const fetchTransactions = async (userId?: string) => {
    const activeUserId = userId || user?.id;
    if (!activeUserId) return;
    try {
      const res = await fetch("/api/transactions", {
        headers: { "Authorization": `Bearer ${activeUserId}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAdminTransactions(data.transactions || []);
      }
    } catch (err) {
      console.error("Failed to fetch transactions:", err);
    }
  };

  // Fetch Notifications
  const fetchNotifications = async (userId?: string) => {
    const activeUserId = userId || user?.id;
    if (!activeUserId) return;
    try {
      const res = await fetch("/api/notifications", {
        headers: { "Authorization": `Bearer ${activeUserId}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  // Fetch System Settings
  const fetchSettings = async (userId?: string) => {
    const activeUserId = userId || user?.id;
    if (!activeUserId) return;
    try {
      const res = await fetch("/api/admin/settings", {
        headers: { "Authorization": `Bearer ${activeUserId}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSystemSettings(data.settings || { cooldownHours: 24, rewardPoints: 1 });
      }
    } catch (err) {
      console.error("Failed to fetch settings:", err);
    }
  };

  // Common loader to pull everything
  const fetchAllData = (userId?: string) => {
    const activeUserId = userId || user?.id;
    if (!activeUserId) return;
    fetchJobs(activeUserId);
    fetchTasks(activeUserId);
    fetchNotifications(activeUserId);
    fetchSettings(activeUserId);
    fetchAdminUsers(activeUserId);
    fetchTransactions(activeUserId);
  };

  // Refresh current user profile to see updated balance
  const refreshUserProfile = async () => {
    if (!user) return;
    try {
      const res = await fetch("/api/me", {
        headers: { "Authorization": `Bearer ${user.id}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      }
    } catch (err) {
      console.error("Failed to refresh profile:", err);
    }
  };

  // Accept CPA Job Task
  const handleAcceptJobTask = async (jobId: string) => {
    if (!user) return false;
    try {
      const res = await fetch("/api/tasks/accept", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user.id}`
        },
        body: JSON.stringify({ jobId })
      });
      const data = await res.json();
      if (!res.ok) {
        alert(`❌ অফারটি গ্রহণ করা সম্ভব হয়নি: ${data.error}`);
        return false;
      }
      alert(`✅ ${data.message}`);
      fetchAllData(user.id);
      setDashboardTab("active-tasks"); // Go to Active Tasks tab
      return true;
    } catch (err) {
      console.error("Failed to accept task:", err);
      alert("❌ নেটওয়ার্ক ত্রুটি, পুনরায় চেষ্টা করুন।");
      return false;
    }
  };

  // Submit Task Proof (Upload exactly 4 screenshots)
  const handleSubmitTaskProof = async (taskId: string, screenshots: string[]) => {
    if (!user) return false;
    try {
      const res = await fetch("/api/tasks/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user.id}`
        },
        body: JSON.stringify({ taskId, screenshots })
      });
      const data = await res.json();
      if (!res.ok) {
        alert(`❌ প্রুফ জমা দেওয়া যায়নি: ${data.error}`);
        return false;
      }
      alert("✅ আপনার প্রুফ সফলভাবে পর্যালোচনার জন্য জমা দেওয়া হয়েছে!");
      fetchAllData(user.id);
      setDashboardTab("task-history"); // Go to Task History tab to check progress
      return true;
    } catch (err) {
      console.error("Failed to submit proof:", err);
      alert("❌ নেটওয়ার্ক ত্রুটি, পুনরায় চেষ্টা করুন।");
      return false;
    }
  };

  // Review Task Submission (Approve / Reject / Resubmission Requested)
  const handleReviewTaskSubmission = async (taskId: string, action: "Approve" | "Reject" | "Resubmission Requested", rejectionReason?: string) => {
    if (!user) return false;
    try {
      const res = await fetch("/api/tasks/review", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user.id}`
        },
        body: JSON.stringify({ taskId, action, rejectionReason })
      });
      const data = await res.json();
      if (!res.ok) {
        alert(`❌ রিভিও সফল হয়নি: ${data.error}`);
        return false;
      }
      alert(`✅ ${data.message}`);
      fetchAllData(user.id);
      refreshUserProfile();
      return true;
    } catch (err) {
      console.error("Failed to review task:", err);
      alert("❌ নেটওয়ার্ক ত্রুটি, পুনরায় চেষ্টা করুন।");
      return false;
    }
  };

  // Mark notifications as read
  const handleMarkNotificationsRead = async (notifId?: string) => {
    if (!user) return;
    try {
      await fetch("/api/notifications/read", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user.id}`
        },
        body: JSON.stringify({ notifId })
      });
      fetchNotifications(user.id);
    } catch (err) {
      console.error("Failed to read notifications:", err);
    }
  };

  // Admin Settings updates
  const handleUpdateSystemSettings = async (cooldownHours: number, rewardPoints: number) => {
    if (!user) return false;
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user.id}`
        },
        body: JSON.stringify({ cooldownHours, rewardPoints })
      });
      const data = await res.json();
      if (!res.ok) {
        alert(`❌ সেটিংস আপডেট করা যায়নি: ${data.error}`);
        return false;
      }
      alert("✅ সিস্টেম সেটিংস সফলভাবে আপডেট করা হয়েছে!");
      fetchSettings(user.id);
      return true;
    } catch (err) {
      console.error("Failed to update settings:", err);
      alert("❌ নেটওয়ার্ক ত্রুটি, সেটিংস আপডেট করা যায়নি।");
      return false;
    }
  };

  // Admin Website Settings updates
  const handleSaveWebsiteSettings = async (settingsData: any) => {
    if (!user) return;
    const res = await fetch("/api/admin/website-settings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${user.id}`
      },
      body: JSON.stringify(settingsData)
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "ওয়েবসাইট সেটিংস আপডেট করা যায়নি।");
    }
    fetchSettings(user.id);
  };

  // Create or Update CPA Job Form Handler
  const handleSaveJob = async (jobData: any) => {
    if (!user) return;
    const isEdit = !!jobData.id;
    const endpoint = isEdit ? "/api/jobs/update" : "/api/jobs";
    
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${user.id}`
      },
      body: JSON.stringify(jobData)
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "সংরক্ষণ করতে ব্যর্থ হয়েছে।");
    }

    // Success resetting
    setIsPostingJob(false);
    setJobToEdit(null);
    fetchJobs(user.id);
  };

  // Change own Job state (Active <-> Paused <-> Completed)
  const handleUpdateJobStatus = async (jobId: string, newStatus: "Active" | "Paused" | "Completed") => {
    if (!user) return;
    try {
      const res = await fetch("/api/jobs/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user.id}`
        },
        body: JSON.stringify({ id: jobId, status: newStatus })
      });
      const data = await res.json();
      if (!res.ok) {
        alert(`❌ স্ট্যাটাস পরিবর্তন করা সম্ভব হয়নি: ${data.error}`);
        return;
      }
      fetchJobs(user.id);
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  // Delete own CPA Job
  const handleDeleteJob = async (jobId: string) => {
    if (!user) return;
    try {
      const res = await fetch("/api/jobs/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user.id}`
        },
        body: JSON.stringify({ id: jobId })
      });
      const data = await res.json();
      if (!res.ok) {
        alert(`❌ অফারটি ডিলিট করা সম্ভব হয়নি: ${data.error}`);
        return;
      }
      fetchJobs(user.id);
    } catch (err) {
      console.error("Failed to delete job", err);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setJobs([]);
    localStorage.removeItem("cpa_user_id");
    setView("login");
    setSelectedUser(null);
    setDashboardTab("task-feed");
    setIsPostingJob(false);
    setJobToEdit(null);
  };

  const toggleCpaNetwork = (network: string) => {
    if (regCpaNetworks.includes(network)) {
      setRegCpaNetworks(prev => prev.filter(n => n !== network));
    } else {
      setRegCpaNetworks(prev => [...prev, network]);
    }
  };

  // Filter users in admin panel
  const filteredUsers = adminUsers.filter(u => {
    const matchesFilter = adminFilter === "All" || u.status === adminFilter;
    const matchesSearch = 
      u.username.toLowerCase().includes(adminSearch.toLowerCase()) || 
      u.email.toLowerCase().includes(adminSearch.toLowerCase()) ||
      u.district.toLowerCase().includes(adminSearch.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col relative selection:bg-emerald-200">
      
      {/* 🇧🇩 Bangladeshi Top Bar Banner */}
      <div className="bg-[#006a4e] text-white py-1 px-4 text-xs font-semibold flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-[#f42a41] rounded-full inline-block shadow-sm"></span>
          <span className="tracking-wide">গণপ্রজাতন্ত্রী বাংলাদেশ CPA এক্সচেঞ্জ প্লাটফর্ম</span>
        </div>
        <div className="hidden sm:flex items-center gap-4 text-[10px] text-slate-100 font-mono">
          <span>SERVER: 0.0.0.0:3000</span>
          <span>● SECURE RLS ACTIVE</span>
        </div>
      </div>

      {/* Modern Premium Navigation Bar */}
      <nav className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-40 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600 border border-emerald-100">
            <Building className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-display text-slate-950 tracking-tight flex items-center gap-1.5">
              <span>CPA Fresh Sign-up BD</span>
              <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-medium">Step 1</span>
            </h1>
            <p className="text-[10px] text-slate-500 font-medium">নিবন্ধন এবং অ্যাকাউন্ট অনুমোদন সিস্টেম</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-4">
              {/* User Identity Details */}
              <div className="hidden md:flex flex-col items-end">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <UserIcon className="w-3.5 h-3.5 text-slate-500" />
                  {user.username}
                </span>
                <span className="text-[10px] text-slate-500">{user.email}</span>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-slate-400">স্ট্যাটাস:</span>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold shadow-sm ${
                  user.status === "Approved" ? "bg-emerald-100 text-emerald-800 border border-emerald-200" :
                  user.status === "Pending" ? "bg-amber-100 text-amber-800 border border-amber-200 animate-pulse" :
                  user.status === "Rejected" ? "bg-rose-100 text-rose-800 border border-rose-200" :
                  "bg-slate-100 text-slate-800 border border-slate-200"
                }`}>
                  {user.status === "Approved" ? "Active" : user.status}
                </span>
              </div>

              {user.role === "admin" && view !== "admin-panel" && (
                <button
                  onClick={() => setView("admin-panel")}
                  className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Users className="w-4 h-4" />
                  <span>এডমিন প্যানেল</span>
                </button>
              )}

              {user.role === "admin" && view === "admin-panel" && (
                <button
                  onClick={() => setView("dashboard")}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Compass className="w-4 h-4" />
                  <span>আমার ড্যাশবোর্ড</span>
                </button>
              )}

              <button
                onClick={handleLogout}
                className="p-2 hover:bg-slate-100 text-slate-600 hover:text-red-600 rounded-xl transition-colors cursor-pointer"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setView("login")}
                className={`text-xs font-bold px-4 py-2 rounded-lg transition-all cursor-pointer ${
                  view === "login" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                লগইন
              </button>
              <button
                onClick={() => setView("register")}
                className={`text-xs font-bold px-4 py-2 rounded-lg transition-all cursor-pointer ${
                  view === "register" ? "bg-emerald-600 text-white hover:bg-emerald-500 shadow" : "bg-slate-100 hover:bg-slate-200 text-slate-800"
                }`}
              >
                নিবন্ধন
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Main Container Wrapper */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 md:p-8 flex flex-col items-center justify-center">
        
        <AnimatePresence mode="wait">
          
          {/* ==================== VIEW 1: LOGIN ==================== */}
          {view === "login" && (
            <motion.div
              key="login-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200/80 p-8 space-y-6"
              id="login-card"
            >
              <div className="text-center space-y-2">
                <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full">স্বাগতম</span>
                <h2 className="text-2xl font-bold font-display text-slate-950">অ্যাকাউন্টে লগইন করুন</h2>
                <p className="text-xs text-slate-500">আপনার সঠিক ইমেইল এবং পাসওয়ার্ড ব্যবহার করে প্রবেশ করুন</p>
              </div>

              {loginError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-3.5 rounded-xl flex items-start gap-2.5">
                  <XCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                  <div>
                    <span className="font-semibold">ত্রুটি:</span> {loginError}
                  </div>
                </div>
              )}

              {loginSuccess && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3.5 rounded-xl flex items-start gap-2.5">
                  <CheckCircle className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                  <div>{loginSuccess}</div>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-slate-400" /> জিমেইল / ইমেইল
                  </label>
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="example@gmail.com"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm outline-none transition-all placeholder:text-slate-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5 text-slate-400" /> পাসওয়ার্ড
                    </label>
                    <button
                      type="button"
                      onClick={() => setView("forgot-password")}
                      className="text-xs text-emerald-600 hover:text-emerald-500 font-medium cursor-pointer"
                    >
                      পাসওয়ার্ড ভুলে গেছেন?
                    </button>
                  </div>
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm outline-none transition-all placeholder:text-slate-400"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500/20 border-slate-300 w-4 h-4 cursor-pointer"
                    />
                    <span>লগইন মনে রাখুন</span>
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3.5 rounded-xl shadow-lg hover:shadow-emerald-900/10 active:scale-98 transition-all text-sm cursor-pointer"
                >
                  লগইন করুন
                </button>
              </form>

              {/* Developer Assist: Quick Login accounts */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-2.5">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-500 animate-pulse" /> 
                  <span>ডেভেলপার কুইক টেস্ট একাউন্টস:</span>
                </div>
                <div className="grid grid-cols-1 gap-1.5">
                  <button
                    onClick={() => handleQuickLogin("admin@gmail.com", "admin123")}
                    className="text-[11px] text-left hover:bg-slate-100 p-2 rounded border border-slate-200 bg-white flex items-center justify-between text-slate-700 transition-colors group cursor-pointer"
                  >
                    <span>🛠️ <strong>Admin:</strong> admin@gmail.com</span>
                    <span className="text-[9px] bg-slate-150 group-hover:bg-emerald-100 group-hover:text-emerald-800 px-1.5 py-0.5 rounded font-bold font-mono">Select</span>
                  </button>
                  <button
                    onClick={() => handleQuickLogin("approved@gmail.com", "user123")}
                    className="text-[11px] text-left hover:bg-slate-100 p-2 rounded border border-slate-200 bg-white flex items-center justify-between text-slate-700 transition-colors group cursor-pointer"
                  >
                    <span>✅ <strong>Approved User:</strong> approved@gmail.com</span>
                    <span className="text-[9px] bg-slate-150 group-hover:bg-emerald-100 group-hover:text-emerald-800 px-1.5 py-0.5 rounded font-bold font-mono">Select</span>
                  </button>
                  <button
                    onClick={() => handleQuickLogin("rahim@gmail.com", "rahim123")}
                    className="text-[11px] text-left hover:bg-slate-100 p-2 rounded border border-slate-200 bg-white flex items-center justify-between text-slate-700 transition-colors group cursor-pointer"
                  >
                    <span>⏳ <strong>Pending User:</strong> rahim@gmail.com</span>
                    <span className="text-[9px] bg-slate-150 group-hover:bg-emerald-100 group-hover:text-emerald-800 px-1.5 py-0.5 rounded font-bold font-mono">Select</span>
                  </button>
                </div>
              </div>

              <div className="text-center">
                <span className="text-xs text-slate-500">অ্যাকাউন্ট নেই? </span>
                <button
                  onClick={() => setView("register")}
                  className="text-xs font-semibold text-emerald-600 hover:text-emerald-500 cursor-pointer"
                >
                  নতুন অ্যাকাউন্ট তৈরি করুন
                </button>
              </div>
            </motion.div>
          )}

          {/* ==================== VIEW 2: REGISTER ==================== */}
          {view === "register" && (
            <motion.div
              key="register-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-slate-200/80 p-8 space-y-6"
              id="register-card"
            >
              <div className="text-center space-y-1">
                <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full">ফ্রি জয়েনিং</span>
                <h2 className="text-2xl font-bold font-display text-slate-950">নতুন মেম্বারশিপ নিবন্ধন</h2>
                <p className="text-xs text-slate-500">সঠিক তথ্য প্রদান করে অ্যাকাউন্টটি তৈরি করুন। (১০০% রিয়েল ইনফরমেশন বাধ্যতামূলক)</p>
              </div>

              {regError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-3.5 rounded-xl flex items-start gap-2.5">
                  <XCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                  <div>
                    <span className="font-semibold">ত্রুটি:</span> {regError}
                  </div>
                </div>
              )}

              {regSuccess && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-4 rounded-xl flex items-start gap-2.5">
                  <CheckCircle className="w-4.5 h-4.5 shrink-0 mt-0.5 text-emerald-600" />
                  <div>{regSuccess}</div>
                </div>
              )}

              <form onSubmit={handleRegister} className="space-y-5">
                
                {/* 2-Column Responsive Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  
                  {/* Column 1: Credentials */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-1.5 flex items-center gap-1">
                      <KeyRound className="w-3.5 h-3.5" /> লগইন তথ্য (Credentials)
                    </h3>
                    
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                        ইউজারনেম (পূর্ণ নাম)
                      </label>
                      <div className="relative">
                        <UserIcon className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          value={regUsername}
                          onChange={(e) => setRegUsername(e.target.value)}
                          placeholder="উদাঃ আব্দুর রহমান"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm outline-none transition-all placeholder:text-slate-400"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                        জিমেইল / ইমেইল
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                        <input
                          type="email"
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          placeholder="example@gmail.com"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm outline-none transition-all placeholder:text-slate-400"
                        />
                      </div>
                      <p className="text-[10px] text-slate-400">অবশ্যই আপনার অ্যাক্টিভ জিমেইল দিন, ভেরিফিকেশন লিংক পাঠানো হবে।</p>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                        পাসওয়ার্ড
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                        <input
                          type="password"
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm outline-none transition-all placeholder:text-slate-400"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Column 2: Location Detail */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-1.5 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" /> ঠিকানা (Address / Area)
                    </h3>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">জেলা (District)</label>
                        <select
                          value={regDistrict}
                          onChange={(e) => setRegDistrict(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm outline-none transition-all bg-white"
                        >
                          <option value="">নির্বাচন করুন</option>
                          {bangladeshDistricts.map(d => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">উপজেলা / থানা</label>
                        <input
                          type="text"
                          value={regUpazila}
                          onChange={(e) => setRegUpazila(e.target.value)}
                          placeholder="উদাঃ মিরপুর"
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm outline-none transition-all placeholder:text-slate-400"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="col-span-2 space-y-1">
                        <label className="text-xs font-bold text-slate-700">গ্রাম / এলাকা</label>
                        <input
                          type="text"
                          value={regVillage}
                          onChange={(e) => setRegVillage(e.target.value)}
                          placeholder="উদাঃ সেনপাড়া"
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm outline-none transition-all placeholder:text-slate-400"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700 flex items-center gap-0.5">
                          পোস্ট কোড
                        </label>
                        <input
                          type="text"
                          value={regPostalCode}
                          onChange={(e) => setRegPostalCode(e.target.value)}
                          placeholder="1216"
                          maxLength={5}
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm outline-none transition-all placeholder:text-slate-400 text-center font-mono font-bold"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* CPA Networks Multi-Selector */}
                <div className="space-y-2 border-t border-slate-100 pt-4">
                  <label className="text-xs font-bold text-slate-700 block">
                    আপনি কোন কোন CPA নেটওয়ার্ক-এ কাজ করেন? (Multiple Selection)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {availableCpaNetworks.map(network => {
                      const isSelected = regCpaNetworks.includes(network);
                      return (
                        <button
                          key={network}
                          type="button"
                          onClick={() => toggleCpaNetwork(network)}
                          className={`text-xs px-3.5 py-2 rounded-lg font-semibold border transition-all flex items-center gap-1 cursor-pointer ${
                            isSelected 
                              ? "bg-emerald-600 text-white border-emerald-600 shadow-sm" 
                              : "bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200"
                          }`}
                        >
                          {isSelected && <span className="text-[10px]">✓</span>}
                          <span>{network}</span>
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[10px] text-slate-400">যে নেটওয়ার্কগুলো থেকে লিড নিয়ে আপনি সাইন-আপ এক্সচেঞ্জ করবেন সেগুলো সিলেক্ট করুন।</p>
                </div>

                {/* Terms and Conditions */}
                <div className="border-t border-slate-100 pt-4">
                  <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-600 leading-relaxed">
                    <input
                      type="checkbox"
                      checked={regTermsChecked}
                      onChange={(e) => setRegTermsChecked(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500/20 border-slate-300 w-4.5 h-4.5 mt-0.5 cursor-pointer"
                    />
                    <span>
                      আমি ঘোষণা করছি যে আমি কোনো ভিপিএন (VPN), প্রক্সি বা স্প্যামিং টুল ব্যবহার করে কোনো ফেক সাইন-আপ বা লিড জেনারেট করব না। এক্সচেঞ্জের সমস্ত নীতি মানতে আমি সম্মত।
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-xl shadow-lg hover:shadow-emerald-900/10 active:scale-98 transition-all text-sm cursor-pointer"
                >
                  নতুন মেম্বারশিপ আবেদন জমা দিন
                </button>
              </form>

              <div className="text-center border-t border-slate-100 pt-4">
                <span className="text-xs text-slate-500">ইতিমধ্যে অ্যাকাউন্ট আছে? </span>
                <button
                  onClick={() => setView("login")}
                  className="text-xs font-semibold text-emerald-600 hover:text-emerald-500 cursor-pointer"
                >
                  লগইন করুন
                </button>
              </div>
            </motion.div>
          )}

          {/* ==================== VIEW 3: FORGOT PASSWORD ==================== */}
          {view === "forgot-password" && (
            <motion.div
              key="forgot-password-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200/80 p-8 space-y-6"
              id="forgot-password-card"
            >
              <div className="text-center space-y-2">
                <h2 className="text-xl font-bold font-display text-slate-950">পাসওয়ার্ড পুনরুদ্ধার</h2>
                <p className="text-xs text-slate-500">আপনার রেজিস্ট্রিকৃত ইমেইল এড্রেসটি নিচে প্রদান করুন। আমরা আপনাকে একটি পাসওয়ার্ড রিসেট লিংক পাঠাবো।</p>
              </div>

              {forgotError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-3.5 rounded-xl flex items-start gap-2.5">
                  <XCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                  <div>{forgotError}</div>
                </div>
              )}

              {forgotSuccess && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-4 rounded-xl flex items-start gap-2.5">
                  <CheckCircle className="w-4.5 h-4.5 shrink-0 mt-0.5 text-emerald-600" />
                  <div>{forgotSuccess}</div>
                </div>
              )}

              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-slate-400" /> আপনার জিমেইল
                  </label>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="example@gmail.com"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm outline-none transition-all placeholder:text-slate-400"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3.5 rounded-xl shadow-lg active:scale-98 transition-all text-sm cursor-pointer"
                >
                  রিসেট লিংক পাঠান
                </button>
              </form>

              <div className="text-center">
                <button
                  onClick={() => setView("login")}
                  className="text-xs font-semibold text-slate-500 hover:text-emerald-600 cursor-pointer"
                >
                  ← লগইন পেজে ফিরে যান
                </button>
              </div>
            </motion.div>
          )}

          {/* ==================== VIEW 4: RESET PASSWORD ==================== */}
          {view === "reset-password" && (
            <motion.div
              key="reset-password-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200/80 p-8 space-y-6"
              id="reset-password-card"
            >
              <div className="text-center space-y-2">
                <h2 className="text-xl font-bold font-display text-slate-950">নতুন পাসওয়ার্ড নির্ধারণ করুন</h2>
                <p className="text-xs text-slate-500">আপনার অ্যাকাউন্টের জন্য নতুন একটি পাসওয়ার্ড টাইপ করুন।</p>
              </div>

              {resetError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-3.5 rounded-xl flex items-start gap-2.5">
                  <XCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                  <div>{resetError}</div>
                </div>
              )}

              {resetSuccess && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-4 rounded-xl flex items-start gap-2.5">
                  <CheckCircle className="w-4.5 h-4.5 shrink-0 mt-0.5 text-emerald-600" />
                  <div>{resetSuccess}</div>
                </div>
              )}

              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">নতুন পাসওয়ার্ড</label>
                  <input
                    type="password"
                    value={resetPassword}
                    onChange={(e) => setResetPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm outline-none transition-all placeholder:text-slate-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">পাসওয়ার্ড নিশ্চিত করুন</label>
                  <input
                    type="password"
                    value={resetConfirmPassword}
                    onChange={(e) => setResetConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm outline-none transition-all placeholder:text-slate-400"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3.5 rounded-xl shadow-lg active:scale-98 transition-all text-sm cursor-pointer"
                >
                  পাসওয়ার্ড পরিবর্তন করুন
                </button>
              </form>
            </motion.div>
          )}

          {/* ==================== VIEW 5: USER DASHBOARD ==================== */}
          {view === "dashboard" && user && (
            <motion.div
              key="dashboard-view"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-4xl space-y-6"
              id="user-dashboard"
            >
              
              {/* If user status is PENDING — STRICT REQUIREMENT — Display ONLY Bengali notice and NO job features */}
              {user.status === "Pending" ? (
                <div className="bg-white rounded-2xl shadow-xl border border-amber-200 overflow-hidden" id="pending-notice-card">
                  {/* Visual Warning Header */}
                  <div className="bg-gradient-to-r from-amber-50 to-amber-100/50 p-8 border-b border-amber-100 flex flex-col items-center text-center space-y-4">
                    <div className="w-16 h-16 bg-amber-500/10 text-amber-600 border border-amber-500/20 rounded-full flex items-center justify-center animate-pulse">
                      <Clock className="w-8 h-8 stroke-[1.8]" />
                    </div>
                    <div className="max-w-xl space-y-2">
                      <div className="text-[10px] bg-amber-200 text-amber-900 px-3 py-0.5 rounded-full font-bold uppercase tracking-wider inline-block">
                        অ্যাকাউন্ট রিভিউাধীন রয়েছে
                      </div>
                      <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900 tracking-tight leading-snug">
                        আপনার অ্যাকাউন্ট এখনো Admin দ্বারা অনুমোদিত হয়নি।
                      </h2>
                    </div>
                  </div>

                  {/* Absolute core requirement bangla warning block */}
                  <div className="p-8 text-center space-y-6 max-w-2xl mx-auto">
                    <p className="text-base font-medium text-amber-900 leading-relaxed bg-amber-50 p-5 rounded-2xl border border-amber-200/80 shadow-inner">
                      "আপনার অ্যাকাউন্ট এখনো Admin দ্বারা অনুমোদিত হয়নি। অনুমোদন না পাওয়া পর্যন্ত আপনি কোনো Job Post বা Task Complete করতে পারবেন না।"
                    </p>

                    <div className="space-y-4 text-xs text-slate-500 text-left border-t border-slate-100 pt-6">
                      <div className="font-bold text-slate-800 text-sm flex items-center gap-1">
                        <Info className="w-4 h-4 text-emerald-600" /> পরবর্তী করণীয়সমূহ:
                      </div>
                      <ul className="list-disc pl-5 space-y-2 leading-relaxed">
                        <li>আমাদের এডমিন টিম বর্তমানে আপনার দেয়া আবেদনপত্রের জেলা (<strong className="text-slate-800">{user.district}</strong>), উপজেলা (<strong className="text-slate-800">{user.upazila}</strong>) এবং CPA নেটওয়ার্ক (<strong className="text-slate-800">{user.cpaNetworks.join(", ")}</strong>) যাচাই করছে।</li>
                        <li>অ্যাকাউন্ট ভেরিফিকেশন প্রক্রিয়াটি সাধারণত ১-২৪ ঘণ্টার মধ্যে সম্পন্ন হয়।</li>
                        <li>অনুমোদন পাওয়া মাত্র আপনার ইমেইলে নোটিফিকেশন চলে যাবে এবং এই ড্যাশবোর্ডটি স্বয়ংক্রিয়ভাবে সক্রিয় হয়ে উঠবে।</li>
                      </ul>
                    </div>

                    <div className="flex justify-center gap-3 pt-2">
                      <button 
                        onClick={handleLogout} 
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2.5 px-6 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>প্রস্থান করুন (Logout)</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : user.status === "Approved" ? (
                /* APPROVED — High Fidelity Active CPA Member Dashboard */
                <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 p-8 space-y-8" id="active-dashboard">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span className="text-xs font-bold text-emerald-600">অ্যাকাউন্ট একটিভ (Active Member)</span>
                      </div>
                      <h2 className="text-2xl font-bold font-display text-slate-950 mt-1">আসসালামু আলাইকুম, {user.username}!</h2>
                      <p className="text-xs text-slate-500">সিপিএ সাইন-আপ এক্সচেঞ্জ প্লাটফর্মে আপনার কাজ শুরু করার জন্য অ্যাকাউন্টটি প্রস্তুত।</p>
                    </div>

                    <div className="flex items-center gap-3 self-end md:self-center">
                      {/* Real-time simulated Notification Bell */}
                      <div className="relative">
                        <button
                          onClick={() => setShowNotifCenter(!showNotifCenter)}
                          className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors relative cursor-pointer flex items-center justify-center shadow-sm"
                          title="Notification Center"
                        >
                          <Bell className="w-4 h-4 text-slate-600" />
                          {notifications.filter(n => !n.read).length > 0 && (
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
                          )}
                        </button>

                        {showNotifCenter && (
                          <div className="absolute right-0 mt-2 z-50 w-80 sm:w-96 shadow-2xl">
                            <NotificationCenter 
                              notifications={notifications} 
                              onMarkRead={handleMarkNotificationsRead} 
                              onClose={() => setShowNotifCenter(false)} 
                            />
                          </div>
                        )}
                      </div>

                      <div className="bg-emerald-50 text-emerald-800 rounded-xl px-4 py-2 border border-emerald-100 flex items-center gap-2 shadow-sm">
                        <Sparkles className="w-4 h-4 text-emerald-600 animate-pulse" />
                        <span className="text-xs font-bold">সার্ফিং ব্যালেন্স: <span className="font-mono text-sm">{user.surfingBalance !== undefined ? user.surfingBalance : 0}</span> পয়েন্ট</span>
                      </div>
                    </div>
                  </div>

                  {/* Stats Cards Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="border border-slate-200/80 bg-slate-50 p-4 rounded-xl space-y-1 shadow-sm">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">আমার লাইভ জবসমূহ</span>
                      <span className="text-2xl font-bold text-slate-950 font-mono">
                        {jobs.filter(j => j.userId === user.id && j.status === "Active").length}
                      </span>
                      <p className="text-[10px] text-slate-500">সরাসরি ড্যাশবোর্ড থেকে পরিচালিত</p>
                    </div>
                    <div className="border border-slate-200/80 bg-slate-50 p-4 rounded-xl space-y-1 shadow-sm">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">সম্পূর্ণ করা টাস্ক</span>
                      <span className="text-2xl font-bold text-slate-950 font-mono">
                        {tasksAsWorker.filter(t => t.status === "Approved").length}
                      </span>
                      <p className="text-[10px] text-slate-500">অনুমোদিত সার্ফিং এক্সচেঞ্জ</p>
                    </div>
                    <div className="border border-slate-200/80 bg-slate-50 p-4 rounded-xl space-y-1 shadow-sm">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">সহযোগিতাকারী CPA নেটওয়ার্ক</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {user.cpaNetworks.map(n => (
                          <span key={n} className="text-[9px] bg-white border border-slate-200 px-1.5 py-0.5 rounded font-semibold text-slate-600">{n}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Active Workspace Switcher */}
                  {isPostingJob ? (
                    <div className="space-y-4">
                      <JobPostingForm
                        jobToEdit={jobToEdit}
                        onSave={handleSaveJob}
                        onCancel={() => {
                          setIsPostingJob(false);
                          setJobToEdit(null);
                        }}
                        availableCpaNetworks={user.cpaNetworks}
                      />
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Nav tabs bar */}
                      <div className="flex flex-wrap items-center justify-between border-b border-slate-200 gap-y-3 pb-0.5">
                        <div className="flex flex-wrap gap-x-4 gap-y-2">
                          <button
                            onClick={() => setDashboardTab("task-feed")}
                            className={`pb-3 font-bold text-sm border-b-2 transition-all cursor-pointer ${
                              dashboardTab === "task-feed"
                                ? "border-emerald-600 text-emerald-600"
                                : "border-transparent text-slate-400 hover:text-slate-600"
                            }`}
                          >
                            সকল অফার (Task Feed)
                          </button>
                          <button
                            onClick={() => setDashboardTab("active-tasks")}
                            className={`pb-3 font-bold text-sm border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                              dashboardTab === "active-tasks"
                                ? "border-emerald-600 text-emerald-600"
                                : "border-transparent text-slate-400 hover:text-slate-600"
                            }`}
                          >
                            <span>আমার একটিভ টাস্ক</span>
                            {tasksAsWorker.filter(t => t.status === "Accepted" || t.status === "Resubmission Requested").length > 0 && (
                              <span className="text-[10px] bg-indigo-100 text-indigo-800 font-bold px-1.5 py-0.5 rounded-full font-mono">
                                {tasksAsWorker.filter(t => t.status === "Accepted" || t.status === "Resubmission Requested").length}
                              </span>
                            )}
                          </button>
                          <button
                            onClick={() => setDashboardTab("task-history")}
                            className={`pb-3 font-bold text-sm border-b-2 transition-all cursor-pointer ${
                              dashboardTab === "task-history"
                                ? "border-emerald-600 text-emerald-600"
                                : "border-transparent text-slate-400 hover:text-slate-600"
                            }`}
                          >
                            আমার টাস্ক হিস্টরি
                          </button>
                          <button
                            onClick={() => setDashboardTab("received-proofs")}
                            className={`pb-3 font-bold text-sm border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                              dashboardTab === "received-proofs"
                                ? "border-emerald-600 text-emerald-600"
                                : "border-transparent text-slate-400 hover:text-slate-600"
                            }`}
                          >
                            <span>প্রাপ্ত প্রুফ রিভিউ</span>
                            {tasksAsOwner.filter(t => t.status === "Pending").length > 0 && (
                              <span className="text-[10px] bg-red-100 text-red-800 font-bold px-1.5 py-0.5 rounded-full font-mono animate-pulse">
                                {tasksAsOwner.filter(t => t.status === "Pending").length}
                              </span>
                            )}
                          </button>
                          <button
                            onClick={() => setDashboardTab("my-jobs")}
                            className={`pb-3 font-bold text-sm border-b-2 transition-all cursor-pointer ${
                              dashboardTab === "my-jobs"
                                ? "border-emerald-600 text-emerald-600"
                                : "border-transparent text-slate-400 hover:text-slate-600"
                            }`}
                          >
                            আমার পোস্টকৃত কাজ (My Jobs)
                          </button>
                          <button
                            onClick={() => setDashboardTab("wallet")}
                            className={`pb-3 font-bold text-sm border-b-2 transition-all cursor-pointer ${
                              dashboardTab === "wallet"
                                ? "border-emerald-600 text-emerald-600"
                                : "border-transparent text-slate-400 hover:text-slate-600"
                            }`}
                          >
                            পয়েন্ট ওয়ালেট (My Wallet)
                          </button>
                        </div>
                        
                        {(dashboardTab === "task-feed" || dashboardTab === "my-jobs") && (
                          <button
                            onClick={() => {
                              setJobToEdit(null);
                              setIsPostingJob(true);
                            }}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-1.5 px-3.5 rounded-xl text-xs transition-all cursor-pointer shadow-sm shadow-emerald-700/10 mb-2 sm:mb-0"
                          >
                            নতুন অফার পোস্ট করুন
                          </button>
                        )}
                      </div>

                      {/* Tab contents */}
                      {dashboardTab === "task-feed" && (
                        <TaskFeed
                          jobs={jobs}
                          currentUserId={user.id}
                          onEditJob={(job) => {
                            setJobToEdit(job);
                            setIsPostingJob(true);
                          }}
                          onDeleteJob={handleDeleteJob}
                          availableCpaNetworks={user.cpaNetworks}
                          onAcceptJobTask={handleAcceptJobTask}
                        />
                      )}

                      {dashboardTab === "active-tasks" && (
                        <ActiveTasksList
                          tasks={tasksAsWorker}
                          onSubmitProof={handleSubmitTaskProof}
                        />
                      )}

                      {dashboardTab === "task-history" && (
                        <TaskHistoryList
                          tasks={tasksAsWorker}
                        />
                      )}

                      {dashboardTab === "received-proofs" && (
                        <ReceivedSubmissionsList
                          tasks={tasksAsOwner}
                          onReviewTask={handleReviewTaskSubmission}
                        />
                      )}

                      {dashboardTab === "my-jobs" && (
                        <MyJobsList
                          jobs={jobs}
                          currentUserId={user.id}
                          onEditJob={(job) => {
                            setJobToEdit(job);
                            setIsPostingJob(true);
                          }}
                          onUpdateStatus={handleUpdateJobStatus}
                          onDeleteJob={handleDeleteJob}
                          onAddNewClick={() => {
                            setJobToEdit(null);
                            setIsPostingJob(true);
                          }}
                        />
                      )}

                      {dashboardTab === "wallet" && (
                        <WalletPage
                          currentBalance={user.surfingBalance || 0}
                        />
                      )}
                    </div>
                  )}

                  {/* Info Box */}
                  <div className="bg-slate-50 rounded-xl p-6 border border-slate-200/80 space-y-4">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <Compass className="w-4 h-4 text-emerald-600" /> লিড এক্সচেঞ্জ নির্দেশিকা:
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-600">
                      <div className="space-y-2 bg-white p-4 rounded-lg border border-slate-150">
                        <span className="font-bold text-slate-800 block">১. জব পোস্টিং নীতি:</span>
                        <p className="leading-relaxed">আপনার CPA প্যানেলের ডিরেক্ট সাইন-আপ লিংক এখানে পোস্ট করবেন। অন্যান্য ইউজাররা আপনার লিংকে গিয়ে রিয়েল ডাটা দিয়ে সাইন আপ করবে।</p>
                      </div>
                      <div className="space-y-2 bg-white p-4 rounded-lg border border-slate-150">
                        <span className="font-bold text-slate-800 block">২. এক্সচেঞ্জ নীতি:</span>
                        <p className="leading-relaxed">অন্যের জবে কাজ করার পর আপনাকে প্যানেলের সাকসেস স্ক্রিনশট এবং ইমেইল প্রুফ দিতে হবে। অ্যাডমিন সেটি দেখে পয়েন্ট রিলিজ করবে।</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* REJECTED, SUSPENDED or BANNED status */
                <div className="bg-white rounded-2xl shadow-xl border border-red-200 overflow-hidden" id="restricted-notice-card">
                  <div className="bg-red-50 p-8 border-b border-red-100 flex flex-col items-center text-center space-y-4">
                    <div className="w-16 h-16 bg-red-100 text-red-600 border border-red-200 rounded-full flex items-center justify-center animate-pulse">
                      <Ban className="w-8 h-8" />
                    </div>
                    <div className="max-w-xl space-y-2">
                      <div className="text-[10px] bg-red-600 text-white px-3 py-0.5 rounded-full font-bold uppercase tracking-wider inline-block">
                        অ্যাকাউন্ট সীমাবদ্ধতা
                      </div>
                      <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900 tracking-tight leading-snug">
                        আপনার অ্যাকাউন্টটি বর্তমানে নিষ্ক্রিয় রয়েছে।
                      </h2>
                    </div>
                  </div>

                  <div className="p-8 text-center space-y-6 max-w-2xl mx-auto">
                    <p className="text-base font-medium text-red-900 leading-relaxed bg-red-50 p-5 rounded-2xl border border-red-100 shadow-inner">
                      {user.status === "Suspended" && "আপনার অ্যাকাউন্টটি সাময়িকভাবে স্থগিত (Suspended) করা হয়েছে। পলিসি লংঘনের জন্য এই ব্যবস্থা গ্রহণ করা হতে পারে।"}
                      {user.status === "Rejected" && "আপনার মেম্বারশিপ আবেদনটি আমাদের এডমিন টিম দ্বারা প্রত্যাখ্যান (Rejected) করা হয়েছে। অনুগ্রহ করে পুনরায় সঠিক তথ্য দিয়ে আবেদন করুন।"}
                      {user.status === "Banned" && "আপনার অ্যাকাউন্টটি স্থায়ীভাবে ব্যান (Banned) করা হয়েছে। কোনো স্প্যামিং বা ফেক অ্যাক্টিভিটি পাওয়ার কারণে এটি হতে পারে।"}
                    </p>

                    <div className="text-xs text-slate-500 leading-relaxed pt-2">
                      আপনার যদি মনে হয় এটি ভুলবশত হয়েছে, তাহলে প্রয়োজনীয় প্রমাণসহ এডমিনের সাথে যোগাযোগ করুন: <strong className="text-slate-800">support@cpasignupbd.com</strong>
                    </div>

                    <div className="flex justify-center pt-2">
                      <button 
                        onClick={handleLogout} 
                        className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2.5 px-6 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>লগআউট করুন</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ==================== VIEW 6: ADMIN PANEL ==================== */}
          {view === "admin-panel" && user && user.role === "admin" && (
            <motion.div
              key="admin-view"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="w-full space-y-6"
              id="admin-dashboard-panel"
            >
              {/* Header Box */}
              <div className="bg-slate-950 text-slate-100 rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[9px] bg-emerald-500 text-slate-950 font-bold px-2.5 py-0.5 rounded-full tracking-wider uppercase font-mono">SYSTEM ACTIVE</span>
                    <span className="text-[9px] bg-indigo-950 text-indigo-400 font-semibold px-2.5 py-0.5 rounded-full tracking-wider uppercase border border-indigo-900">ADMINISTRATOR PORTAL</span>
                  </div>
                  <h2 className="text-2xl font-bold font-display text-white tracking-tight">অ্যাডমিন কন্ট্রোল সেন্টার (Admin Control Center)</h2>
                  <p className="text-xs text-slate-400 max-w-2xl">
                    প্লাটফর্মের ইউজার রেজিস্ট্রেশন, জব এপ্রুভাল, কোয়ালিটি কন্ট্রোল, ওয়ালেট ট্রানজেকশন এবং সিস্টেম সেটিংস ম্যানেজ করুন।
                  </p>
                </div>

                <button
                  onClick={() => setView("dashboard")}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-100 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border border-slate-700 cursor-pointer flex items-center gap-1"
                >
                  <span>ইউজার ড্যাশবোর্ড</span>
                  <span>→</span>
                </button>
              </div>

              {/* Multi-Tab Admin Navigation Bar */}
              <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
                {[
                  { id: "dashboard", label: "ড্যাশবোর্ড (Overview)", icon: Compass },
                  { id: "users", label: "ইউজার তালিকা", icon: Users },
                  { id: "jobs", label: "জব ম্যানেজমেন্ট", icon: Database },
                  { id: "proofs", label: "প্রুফ রিভিউ", icon: CheckCircle },
                  { id: "reports", label: "রিপোর্ট ও হিস্টরি", icon: Sparkles },
                  { id: "settings", label: "সিস্টেম সেটিংস", icon: Clock },
                  { id: "security", label: "নিরাপত্তা ও অডিট লগ", icon: ShieldAlert },
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setAdminTab(tab.id as any)}
                      className={`text-xs font-bold px-4 py-3 rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer ${
                        adminTab === tab.id
                          ? "bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/10"
                          : "bg-white hover:bg-slate-50 text-slate-600 border-slate-200"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {adminMessage && (
                <div className="bg-slate-900 border border-slate-800 text-slate-200 text-xs p-4 rounded-xl flex items-center justify-between shadow-lg">
                  <span className="font-medium">{adminMessage}</span>
                  <button onClick={() => setAdminMessage("")} className="text-slate-400 hover:text-white font-bold font-mono">X</button>
                </div>
              )}

              {/* Render Admin Tab Content */}
              {adminTab === "dashboard" && (
                <AdminDashboard
                  users={adminUsers}
                  jobs={jobs}
                  tasks={adminTasks}
                />
              )}

              {adminTab === "users" && (
                <AdminUserManagement
                  users={adminUsers}
                  jobs={jobs}
                  tasks={adminTasks}
                  onUpdateStatus={handleUpdateStatus}
                  onResetPassword={handleAdminResetUserPassword}
                />
              )}

              {adminTab === "jobs" && (
                <AdminJobManagement
                  jobs={jobs}
                  onUpdateStatus={handleUpdateJobStatus}
                  onDeleteJob={handleAdminDeleteJob}
                  onEditJob={(job) => {
                    setJobToEdit(job);
                    setIsPostingJob(true);
                    setView("dashboard");
                    setDashboardTab("my-jobs");
                  }}
                />
              )}

              {adminTab === "proofs" && (
                <AdminProofManagement
                  tasks={adminTasks}
                  onReviewTask={handleAdminReviewTask}
                />
              )}

              {adminTab === "reports" && (
                <AdminReports
                  users={adminUsers}
                  jobs={jobs}
                  tasks={adminTasks}
                  transactions={adminTransactions}
                />
              )}

              {adminTab === "settings" && (
                <AdminSettings
                  onSaveSettings={handleSaveWebsiteSettings}
                />
              )}

              {adminTab === "security" && (
                <AdminSecurity />
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* Floating Virtual Gmail Simulator Widget */}
      <Mailbox 
        onVerifySuccess={handleMailboxVerify} 
        onResetSuccess={handleMailboxReset} 
      />

      {/* Simple Footer and Credit line */}
      <footer className="bg-white border-t border-slate-200/80 py-6 text-center text-[11px] text-slate-400 mt-auto px-4 space-y-1">
        <p>© 2026 CPA Fresh Sign-up BD. All Rights Reserved. (বাংলাদেশ ভিত্তিক সাইন-আপ ও লিড জেনারেশন এক্সচেঞ্জ)</p>
        <p className="text-[9px] font-mono">SUPABASE LOCAL SIMULATOR • CORS ENABLED • TSX RENDERER</p>
      </footer>
    </div>
  );
}
