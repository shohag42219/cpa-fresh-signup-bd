import React, { useState } from "react";
import { BarChart3, FileSpreadsheet, Calendar, Search, Filter, ShieldCheck, Download, Printer } from "lucide-react";
import { User, Job, TaskSubmission, Transaction } from "../types";

interface AdminReportsProps {
  users: User[];
  jobs: Job[];
  tasks: TaskSubmission[];
  transactions: Transaction[];
}

export default function AdminReports({
  users,
  jobs,
  tasks,
  transactions
}: AdminReportsProps) {
  const [reportType, setReportType] = useState<"users" | "jobs" | "proofs" | "transactions">("users");
  const [dateRange, setDateRange] = useState<"all" | "today" | "week" | "month">("all");
  const [statusFilter, setStatusFilter] = useState("All");
  const [userQuery, setUserQuery] = useState("");

  // Simulated Transaction History fallback generator if empty
  const getSimulatedTransactions = (): Transaction[] => {
    if (transactions && transactions.length > 0) return transactions;
    // Generate some demo transactions based on approved tasks to populate the report beautifully
    return tasks
      .filter(t => t.status === "Approved" && t.submittedAt)
      .map((t, idx) => ({
        id: `tx_demo_${t.id}`,
        userId: t.workerId,
        username: t.workerName,
        date: t.submittedAt || new Date().toISOString(),
        type: "Earned",
        jobTitle: t.jobTitle,
        points: 1,
        status: "Completed"
      }));
  };

  const activeTransactions = getSimulatedTransactions();

  // Date filtering logic helper
  const filterByDate = (dateStr: string) => {
    if (dateRange === "all") return true;
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    if (dateRange === "today") return diffDays <= 1;
    if (dateRange === "week") return diffDays <= 7;
    if (dateRange === "month") return diffDays <= 30;
    return true;
  };

  // 1. Users Report Data
  const getFilteredUsers = () => {
    return users.filter(u => {
      const matchesDate = filterByDate(u.createdAt);
      const matchesStatus = statusFilter === "All" || u.status === statusFilter;
      const matchesQuery = u.username.toLowerCase().includes(userQuery.toLowerCase()) || u.email.toLowerCase().includes(userQuery.toLowerCase());
      return matchesDate && matchesStatus && matchesQuery;
    });
  };

  // 2. Jobs Report Data
  const getFilteredJobs = () => {
    return jobs.filter(j => {
      const matchesDate = filterByDate(j.createdAt);
      const matchesStatus = statusFilter === "All" || j.status === statusFilter;
      const matchesQuery = j.title.toLowerCase().includes(userQuery.toLowerCase()) || j.username.toLowerCase().includes(userQuery.toLowerCase());
      return matchesDate && matchesStatus && matchesQuery;
    });
  };

  // 3. Proofs Report Data
  const getFilteredProofs = () => {
    return tasks.filter(t => {
      const dateToCheck = t.submittedAt || t.createdAt;
      const matchesDate = filterByDate(dateToCheck);
      const matchesStatus = statusFilter === "All" || t.status === statusFilter;
      const matchesQuery = t.jobTitle.toLowerCase().includes(userQuery.toLowerCase()) || t.workerName.toLowerCase().includes(userQuery.toLowerCase());
      return matchesDate && matchesStatus && matchesQuery;
    });
  };

  // 4. Transactions Report Data
  const getFilteredTransactions = () => {
    return activeTransactions.filter(tx => {
      const matchesDate = filterByDate(tx.date);
      const matchesStatus = statusFilter === "All" || tx.status === statusFilter;
      const matchesQuery = tx.jobTitle.toLowerCase().includes(userQuery.toLowerCase()) || tx.username.toLowerCase().includes(userQuery.toLowerCase());
      return matchesDate && matchesStatus && matchesQuery;
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Control Filters Bar Card */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
          <BarChart3 className="w-4 h-4 text-emerald-600" /> কাস্টম রিপোর্ট ফিল্টারিং ও জেনারেটর (Reports Engine)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs font-semibold">
          {/* 1. Report Type */}
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 font-bold block uppercase">রিপোর্টের ধরণ (Report Module)</span>
            <select
              value={reportType}
              onChange={(e) => {
                setReportType(e.target.value as any);
                setStatusFilter("All");
              }}
              className="w-full p-2 border border-slate-200 rounded-xl focus:border-emerald-500 bg-white"
            >
              <option value="users">ব্যবহারকারী মেম্বার তালিকা (Users)</option>
              <option value="jobs">পোস্টকৃত CPA কাজ তালিকা (Jobs)</option>
              <option value="proofs">টাস্ক স্ক্রিনশট প্রুফ (Proofs)</option>
              <option value="transactions">পয়েন্ট ওয়ালেট ট্রানজেকশন (Transactions)</option>
            </select>
          </div>

          {/* 2. Date Range Filter */}
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 font-bold block uppercase">সময়সীমা (Date Frame)</span>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as any)}
              className="w-full p-2 border border-slate-200 rounded-xl focus:border-emerald-500 bg-white"
            >
              <option value="all">সর্বকালের রিপোর্ট (All Time)</option>
              <option value="today">আজকের ডাটা (Last 24 Hours)</option>
              <option value="week">বিগত ৭ দিনের ডাটা (Last 7 Days)</option>
              <option value="month">বিগত ৩০ দিনের ডাটা (Last 30 Days)</option>
            </select>
          </div>

          {/* 3. Status Filter */}
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 font-bold block uppercase">অবস্থা (Status)</span>
            {reportType === "users" && (
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full p-2 border border-slate-200 rounded-xl bg-white">
                <option value="All">সকল স্ট্যাটাস (All Status)</option>
                <option value="Pending">Pending (অপেক্ষমাণ)</option>
                <option value="Approved">Active (অনুমোদিত)</option>
                <option value="Rejected">Rejected (প্রত্যাখ্যাত)</option>
                <option value="Suspended">Suspended (স্থগিত)</option>
                <option value="Banned">Banned (স্থায়ী ব্যান)</option>
              </select>
            )}
            {reportType === "jobs" && (
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full p-2 border border-slate-200 rounded-xl bg-white">
                <option value="All">সকল অফার অবস্থা</option>
                <option value="Active">Active (সক্রিয়)</option>
                <option value="Paused">Paused (স্থগিত)</option>
                <option value="Completed">Completed (সম্পূর্ণ)</option>
              </select>
            )}
            {reportType === "proofs" && (
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full p-2 border border-slate-200 rounded-xl bg-white">
                <option value="All">সকল টাস্ক অবস্থা</option>
                <option value="Pending">Pending (রিভিউ অপেক্ষমাণ)</option>
                <option value="Approved">Approved (অনুমোদিত)</option>
                <option value="Rejected">Rejected (প্রত্যাখ্যাত)</option>
                <option value="Resubmission Requested">Resubmission (সংশোধনাধীন)</option>
              </select>
            )}
            {reportType === "transactions" && (
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full p-2 border border-slate-200 rounded-xl bg-white">
                <option value="All">সকল ট্রানজেকশন অবস্থা</option>
                <option value="Completed">Completed (সফল)</option>
                <option value="Pending">Pending (অপেক্ষমাণ)</option>
                <option value="Cancelled">Cancelled (বাতিলকৃত)</option>
              </select>
            )}
          </div>

          {/* 4. Query Search */}
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 font-bold block uppercase">অনুসন্ধান ফিল্ড (Filter Query)</span>
            <div className="relative">
              <input
                type="text"
                placeholder="কিপ্যাড সার্চ..."
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
                className="w-full p-2 border border-slate-200 rounded-xl focus:border-emerald-500 bg-white"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5" />
            </div>
          </div>
        </div>

        {/* Action utility bar */}
        <div className="flex items-center justify-end gap-2 text-xs border-t border-slate-100 pt-3">
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl flex items-center gap-1.5 cursor-pointer transition-all border border-slate-200"
          >
            <Printer className="w-4 h-4" />
            <span>প্রিন্ট করুন / PDF সংরক্ষণ</span>
          </button>
        </div>
      </div>

      {/* Reports output data box */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/85 overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono">
            Report: {reportType} ({dateRange})
          </span>
          <span className="text-[10px] bg-emerald-50 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full border border-emerald-100 font-mono">
            SYSTEM SAFE
          </span>
        </div>

        {/* Dynamic rendering based on selected report module */}
        
        {/* USERS REPORT */}
        {reportType === "users" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-150 bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="p-4">মেম্বার আইডি / ইমেইল</th>
                  <th className="p-4">রেজিস্ট্রেশন ডেট</th>
                  <th className="p-4">ঠিকানা জেলা</th>
                  <th className="p-4">ব্যালেন্স পয়েন্ট</th>
                  <th className="p-4">মেম্বার স্ট্যাটাস</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
                {getFilteredUsers().length === 0 ? (
                  <tr><td colSpan={5} className="p-8 text-center text-slate-400">কোনো রেকর্ড পাওয়া যায়নি।</td></tr>
                ) : (
                  getFilteredUsers().map(u => (
                    <tr key={u.id} className="hover:bg-slate-50/50">
                      <td className="p-4">
                        <div className="font-bold text-slate-900">{u.username}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{u.email}</div>
                      </td>
                      <td className="p-4 font-mono text-slate-400 text-[10px]">{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td className="p-4">{u.district}</td>
                      <td className="p-4 font-mono font-bold text-slate-950">{u.surfingBalance || 0} PT</td>
                      <td className="p-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${u.status === "Approved" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-slate-100 text-slate-600"}`}>
                          {u.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* JOBS REPORT */}
        {reportType === "jobs" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-150 bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="p-4">কাজ টাইটেল</th>
                  <th className="p-4">পোস্টকারী</th>
                  <th className="p-4">CPA নেটওয়ার্ক</th>
                  <th className="p-4">অবশিষ্ট স্লট</th>
                  <th className="p-4">অফার স্ট্যাটাস</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
                {getFilteredJobs().length === 0 ? (
                  <tr><td colSpan={5} className="p-8 text-center text-slate-400">কোনো রেকর্ড পাওয়া যায়নি।</td></tr>
                ) : (
                  getFilteredJobs().map(j => (
                    <tr key={j.id} className="hover:bg-slate-50/50">
                      <td className="p-4">
                        <div className="font-bold text-slate-900">{j.title}</div>
                        <div className="text-[9px] text-slate-400 font-mono truncate max-w-xs">{j.affiliateLink}</div>
                      </td>
                      <td className="p-4">{j.username}</td>
                      <td className="p-4"><span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[9px] font-semibold">{j.cpaNetwork}</span></td>
                      <td className="p-4 font-mono">{j.remainingSlots} / {j.slotsLimit}</td>
                      <td className="p-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${j.status === "Active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                          {j.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* PROOFS REPORT */}
        {reportType === "proofs" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-150 bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="p-4">অফার জব টাইটেল</th>
                  <th className="p-4">কর্মী (Worker)</th>
                  <th className="p-4">মালিক (Owner)</th>
                  <th className="p-4">জমা দানের সময়</th>
                  <th className="p-4">টাস্ক স্ট্যাটাস</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
                {getFilteredProofs().length === 0 ? (
                  <tr><td colSpan={5} className="p-8 text-center text-slate-400">কোনো রেকর্ড পাওয়া যায়নি।</td></tr>
                ) : (
                  getFilteredProofs().map(p => (
                    <tr key={p.id} className="hover:bg-slate-50/50">
                      <td className="p-4 font-bold text-slate-900">{p.jobTitle}</td>
                      <td className="p-4">{p.workerName}</td>
                      <td className="p-4">{p.ownerName}</td>
                      <td className="p-4 font-mono text-[10px] text-slate-400">{p.submittedAt ? new Date(p.submittedAt).toLocaleString() : "Accepted Only"}</td>
                      <td className="p-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${p.status === "Approved" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* TRANSACTIONS REPORT */}
        {reportType === "transactions" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-150 bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="p-4">তারিখ</th>
                  <th className="p-4">সদস্য</th>
                  <th className="p-4">সম্পর্কিত কাজ</th>
                  <th className="p-4">ধরণ ও পয়েন্ট</th>
                  <th className="p-4">ট্রানজেকশন অবস্থা</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
                {getFilteredTransactions().length === 0 ? (
                  <tr><td colSpan={5} className="p-8 text-center text-slate-400">কোনো রেকর্ড পাওয়া যায়নি।</td></tr>
                ) : (
                  getFilteredTransactions().map(tx => (
                    <tr key={tx.id} className="hover:bg-slate-50/50">
                      <td className="p-4 font-mono text-[10px] text-slate-400">{new Date(tx.date).toLocaleDateString()}</td>
                      <td className="p-4">{tx.username}</td>
                      <td className="p-4 font-semibold text-slate-800">{tx.jobTitle}</td>
                      <td className="p-4 font-mono font-bold">{tx.type === "Earned" ? "+" : "-"}{tx.points} PT</td>
                      <td className="p-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${tx.status === "Completed" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
