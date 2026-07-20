import React from "react";
import { Users, UserCheck, UserPlus, Briefcase, FileCheck, FileX, Sparkles, TrendingUp, HelpCircle, CheckCircle } from "lucide-react";
import { User, Job, TaskSubmission } from "../types";

interface AdminDashboardProps {
  users: User[];
  jobs: Job[];
  tasks: TaskSubmission[];
}

export default function AdminDashboard({ users, jobs, tasks }: AdminDashboardProps) {
  // Statistics computations
  const totalUsers = users.length;
  const pendingUsers = users.filter(u => u.status === "Pending").length;
  const approvedUsers = users.filter(u => u.status === "Approved").length;

  const activeJobs = jobs.filter(j => j.status === "Active").length;
  const pendingProofs = tasks.filter(t => t.status === "Pending").length;
  const approvedProofs = tasks.filter(t => t.status === "Approved").length;
  const rejectedProofs = tasks.filter(t => t.status === "Rejected").length;

  const totalSurfingBalanceIssued = users.reduce((sum, u) => sum + (u.surfingBalance || 0), 0);
  const totalJobsCompleted = tasks.filter(t => t.status === "Approved").length;

  const stats = [
    {
      title: "মোট ব্যবহারকারী (Total Users)",
      value: totalUsers,
      desc: "নিবন্ধিত সকল মেম্বার",
      icon: Users,
      color: "bg-blue-50 text-blue-600 border-blue-100",
      vColor: "text-blue-950"
    },
    {
      title: "অপেক্ষমাণ আবেদন (Pending)",
      value: pendingUsers,
      desc: "রিভিও এর জন্য পেন্ডিং",
      icon: UserPlus,
      color: pendingUsers > 0 ? "bg-amber-50 text-amber-600 border-amber-100 animate-pulse" : "bg-amber-50 text-amber-600 border-amber-100",
      vColor: "text-amber-750"
    },
    {
      title: "অনুমোদিত ব্যবহারকারী (Approved)",
      value: approvedUsers,
      desc: "সক্রিয় মেম্বারশিপ",
      icon: UserCheck,
      color: "bg-emerald-50 text-emerald-600 border-emerald-100",
      vColor: "text-emerald-950"
    },
    {
      title: "চলতি কাজসমূহ (Active Jobs)",
      value: activeJobs,
      desc: "টাস্ক ফিডে সক্রিয় অফার",
      icon: Briefcase,
      color: "bg-indigo-50 text-indigo-600 border-indigo-100",
      vColor: "text-indigo-950"
    },
    {
      title: "পর্যালোচনাধীন প্রুফ (Pending Proofs)",
      value: pendingProofs,
      desc: "৪ স্ক্রিনশট রিভিউ পেন্ডিং",
      icon: HelpCircle,
      color: pendingProofs > 0 ? "bg-red-50 text-red-600 border-red-150 animate-pulse" : "bg-slate-50 text-slate-600 border-slate-100",
      vColor: "text-red-950"
    },
    {
      title: "অনুমোদিত প্রুফ (Approved Proofs)",
      value: approvedProofs,
      desc: "সফলভাবে এক্সচেঞ্জ সম্পন্ন",
      icon: FileCheck,
      color: "bg-teal-50 text-teal-600 border-teal-100",
      vColor: "text-teal-950"
    },
    {
      title: "বাতিলকৃত প্রুফ (Rejected)",
      value: rejectedProofs,
      desc: "বাতিল হওয়া টাস্ক সাবমিশন",
      icon: FileX,
      color: "bg-rose-50 text-rose-600 border-rose-100",
      vColor: "text-rose-950"
    },
    {
      title: "মোট ইস্যুকৃত ব্যালেন্স",
      value: `${totalSurfingBalanceIssued} PT`,
      desc: "সিস্টেমের মোট পয়েন্ট প্রবাহ",
      icon: Sparkles,
      color: "bg-amber-100/50 text-amber-700 border-amber-200",
      vColor: "text-amber-950"
    },
    {
      title: "সম্পূর্ণ হওয়া কাজের স্লট",
      value: totalJobsCompleted,
      desc: "মোট অনুমোদিত সাকসেস লিড",
      icon: CheckCircle,
      color: "bg-slate-900 text-white border-slate-800",
      vColor: "text-white"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Real-time stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {stats.map((item, idx) => {
          const IconComponent = item.icon;
          return (
            <div
              key={idx}
              className={`border p-5 rounded-2xl space-y-3 shadow-sm transition-all hover:shadow-md ${item.color}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider opacity-80 block">
                  {item.title}
                </span>
                <div className="p-2 bg-white/60 rounded-xl backdrop-blur-sm border border-black/5">
                  <IconComponent className="w-4 h-4" />
                </div>
              </div>
              <div>
                <span className={`text-3xl font-extrabold font-mono tracking-tight ${item.vColor}`}>
                  {item.value}
                </span>
                <p className="text-[10px] opacity-75 mt-1">{item.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Visual Analytics Quick View */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 space-y-4">
        <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
          <TrendingUp className="w-4 h-4 text-emerald-600" /> সিস্টেম ভলিউম ও কার্যক্রম অনুপাত
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-600">
          {/* Proof approval ratio */}
          <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-150">
            <span className="font-bold text-slate-800 block">১. প্রুফ অনুমোদন অনুপাত (Proof Acceptance Ratio)</span>
            <div className="flex items-center gap-3 mt-1.5">
              <div className="flex-1 h-2.5 bg-slate-200 rounded-full overflow-hidden flex">
                <div 
                  className="bg-emerald-500 h-full" 
                  style={{ width: `${approvedProofs + rejectedProofs > 0 ? (approvedProofs / (approvedProofs + rejectedProofs)) * 100 : 100}%` }}
                ></div>
                <div 
                  className="bg-rose-500 h-full" 
                  style={{ width: `${approvedProofs + rejectedProofs > 0 ? (rejectedProofs / (approvedProofs + rejectedProofs)) * 100 : 0}%` }}
                ></div>
              </div>
              <span className="font-bold font-mono">
                {approvedProofs + rejectedProofs > 0 
                  ? Math.round((approvedProofs / (approvedProofs + rejectedProofs)) * 100) 
                  : 100}%
              </span>
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed mt-2">
              অনুমোদিত বনাম বাতিলকৃত প্রুফ অনুপাত। উচ্চ অনুপাত ইঙ্গিত করে ব্যবহারকারীরা সঠিক নিয়মে স্ক্রিনশট আপলোড করছেন।
            </p>
          </div>

          {/* User conversion ratio */}
          <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-150">
            <span className="font-bold text-slate-800 block">২. মেম্বার অনুমোদন অনুপাত (User Approval Ratio)</span>
            <div className="flex items-center gap-3 mt-1.5">
              <div className="flex-1 h-2.5 bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-600 h-full" 
                  style={{ width: `${totalUsers > 0 ? (approvedUsers / totalUsers) * 100 : 100}%` }}
                ></div>
              </div>
              <span className="font-bold font-mono">
                {totalUsers > 0 ? Math.round((approvedUsers / totalUsers) * 100) : 100}%
              </span>
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed mt-2">
              নিবন্ধিত ব্যবহারকারীদের মধ্যে অনুমোদিত অ্যাকাউন্টের হার। এটি উচ্চ রাখা প্যানেলের এক্সচেঞ্জ কোয়ালিটি রক্ষা করে।
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
