import React, { useState } from "react";
import { Search, UserCheck, UserX, Ban, ShieldCheck, Mail, Clock, RefreshCw, Eye, KeyRound, CheckCircle, XCircle } from "lucide-react";
import { User, Job, TaskSubmission } from "../types";

interface AdminUserManagementProps {
  users: User[];
  jobs: Job[];
  tasks: TaskSubmission[];
  onUpdateStatus: (userId: string, action: string) => Promise<void>;
  onResetPassword: (userId: string) => Promise<string>;
}

export default function AdminUserManagement({
  users,
  jobs,
  tasks,
  onUpdateStatus,
  onResetPassword
}: AdminUserManagementProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Pending" | "Approved" | "Rejected" | "Suspended" | "Banned">("All");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Filter users based on search and tab selection
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.district.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = statusFilter === "All" || u.status === statusFilter;
    return matchesSearch && matchesFilter;
  });

  const handleAction = async (userId: string, action: string) => {
    try {
      setActionLoading(true);
      setMessage("");
      await onUpdateStatus(userId, action);
      setMessage(`ব্যবহারকারীকে সফলভাবে ${action === "Approve" ? "অনুমোদন" : action === "Reject" ? "প্রত্যাখ্যান" : action === "Suspend" ? "স্থগিত" : action === "Ban" ? "ব্যান" : "একটিভ"} করা হয়েছে।`);
      
      // Update selected user view if active
      if (selectedUser && selectedUser.id === userId) {
        const updatedUser = users.find(u => u.id === userId);
        if (updatedUser) {
          setSelectedUser({
            ...updatedUser,
            status: (action === "Approve" || action === "Unban") ? "Approved" : action as any
          });
        }
      }
    } catch (err: any) {
      setMessage(err.message || "কার্যক্রম সম্পন্ন করা সম্ভব হয়নি।");
    } finally {
      setActionLoading(false);
    }
  };

  const handleResetPass = async (userId: string) => {
    try {
      setActionLoading(true);
      setMessage("");
      const info = await onResetPassword(userId);
      setMessage(info);
    } catch (err: any) {
      setMessage(err.message || "পাসওয়ার্ড রিসেট করতে ব্যর্থ হয়েছে।");
    } finally {
      setActionLoading(false);
    }
  };

  // Compute activity details for selected user
  const userJobs = selectedUser ? jobs.filter(j => j.userId === selectedUser.id) : [];
  const userTasksAsWorker = selectedUser ? tasks.filter(t => t.workerId === selectedUser.id) : [];
  const userTasksAsOwner = selectedUser ? tasks.filter(t => t.ownerId === selectedUser.id) : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Columns: Search, Filters & User List */}
      <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200/85 overflow-hidden flex flex-col">
        {/* Search & Filter Bar */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="নাম, ইমেইল বা জেলা দিয়ে খুঁজুন..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 focus:border-emerald-500 text-xs outline-none bg-white transition-all shadow-sm"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
          </div>

          <div className="flex flex-wrap gap-1 bg-slate-200/60 p-1 rounded-xl">
            {(["All", "Pending", "Approved", "Rejected", "Suspended", "Banned"] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                  statusFilter === tab 
                    ? "bg-white text-slate-900 shadow-sm" 
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {tab === "Approved" ? "Active" : tab === "All" ? "সব" : tab}
              </button>
            ))}
          </div>
        </div>

        {/* User Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-150 bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="p-4">ব্যবহারকারী মেম্বার</th>
                <th className="p-4">এলাকা</th>
                <th className="p-4">পয়েন্ট</th>
                <th className="p-4">স্ট্যাটাস</th>
                <th className="p-4 text-right">কার্যক্রম</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-400">
                    কোনো ব্যবহারকারী পাওয়া যায়নি।
                  </td>
                </tr>
              ) : (
                filteredUsers.map((item) => (
                  <tr 
                    key={item.id} 
                    onClick={() => setSelectedUser(item)}
                    className={`hover:bg-slate-50 cursor-pointer transition-colors ${selectedUser?.id === item.id ? "bg-emerald-50/40" : ""}`}
                  >
                    <td className="p-4">
                      <div className="font-bold text-slate-900">{item.username}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">{item.email}</div>
                    </td>
                    <td className="p-4">
                      <div>{item.district}</div>
                      <div className="text-[10px] text-slate-400">{item.upazila}</div>
                    </td>
                    <td className="p-4 font-mono font-semibold text-slate-800">
                      {item.surfingBalance || 0} PT
                    </td>
                    <td className="p-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block ${
                        item.status === "Approved" ? "bg-emerald-100 text-emerald-800" :
                        item.status === "Pending" ? "bg-amber-100 text-amber-800 animate-pulse" :
                        item.status === "Rejected" ? "bg-rose-100 text-rose-800" :
                        item.status === "Suspended" ? "bg-amber-200/50 text-amber-800" :
                        "bg-slate-200 text-slate-800"
                      }`}>
                        {item.status === "Approved" ? "Active" : item.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedUser(item);
                        }}
                        className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-2.5 py-1 rounded transition-all cursor-pointer"
                      >
                        বিস্তারিত
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="bg-slate-50 px-4 py-2.5 border-t border-slate-100 text-[10px] text-slate-400 text-right">
          ফিল্টারকৃত ব্যবহারকারী: <span className="font-bold text-slate-600 font-mono">{filteredUsers.length}</span> জন
        </div>
      </div>

      {/* Right Column: Detailed User Activity, Info and Actions */}
      <div className="space-y-4">
        {message && (
          <div className="bg-slate-950 text-white text-[11px] p-3 rounded-xl border border-slate-800 flex items-center justify-between shadow">
            <span className="font-medium">{message}</span>
            <button onClick={() => setMessage("")} className="font-bold hover:text-red-400 ml-1">X</button>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/85 p-5 space-y-6 flex flex-col h-fit">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-1.5">
            <Eye className="w-4 h-4 text-emerald-600" /> মেম্বারশিপ কার্যকলাপ ও অ্যাকশন
          </h3>

          {selectedUser ? (
            <div className="space-y-5">
              {/* Header */}
              <div className="space-y-1 bg-slate-50 p-4 rounded-xl border border-slate-200/60 relative overflow-hidden">
                <span className="text-[9px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold uppercase font-mono">
                  {selectedUser.role}
                </span>
                <h4 className="text-base font-bold text-slate-900 mt-1">{selectedUser.username}</h4>
                <span className="text-xs text-slate-500 font-mono block truncate">{selectedUser.email}</span>
                <span className="text-[10px] text-slate-400 block mt-1">যোগদান: {new Date(selectedUser.createdAt).toLocaleDateString()}</span>
              </div>

              {/* Stats Counters */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 border border-slate-150 p-3 rounded-xl text-center">
                  <span className="text-[9px] text-slate-400 font-bold block">পোস্টকৃত অফার</span>
                  <strong className="text-lg font-mono text-slate-800">{userJobs.length} টি</strong>
                </div>
                <div className="bg-slate-50 border border-slate-150 p-3 rounded-xl text-center">
                  <span className="text-[9px] text-slate-400 font-bold block">কাজ সম্পন্ন করেছে</span>
                  <strong className="text-lg font-mono text-slate-800">{userTasksAsWorker.filter(t => t.status === "Approved").length} টি</strong>
                </div>
              </div>

              {/* User Address */}
              <div className="space-y-1 text-xs">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">ঠিকানা ও কন্টাক্ট:</span>
                <div className="bg-slate-50/50 border border-slate-150 rounded-xl p-3 space-y-1.5 text-slate-600">
                  <p><strong>জেলা:</strong> {selectedUser.district}</p>
                  <p><strong>থানা/উপজেলা:</strong> {selectedUser.upazila}</p>
                  <p><strong>গ্রাম/মহল্লা:</strong> {selectedUser.village}</p>
                  <p><strong>পোস্ট কোড:</strong> {selectedUser.postalCode}</p>
                </div>
              </div>

              {/* CPA networks */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">সিপিএ প্যানেলসমূহ:</span>
                <div className="flex flex-wrap gap-1">
                  {selectedUser.cpaNetworks.map(n => (
                    <span key={n} className="text-[10px] bg-slate-900 text-white font-semibold px-2 py-0.5 rounded">
                      {n}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions Section */}
              <div className="border-t border-slate-100 pt-4 space-y-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">অ্যাডমিন অ্যাকশন প্যানেল:</span>

                {/* Approve / Reject */}
                {selectedUser.status === "Pending" && (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      disabled={actionLoading}
                      onClick={() => handleAction(selectedUser.id, "Approve")}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold py-2 rounded-lg flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      অনুমোদন দিন
                    </button>
                    <button
                      disabled={actionLoading}
                      onClick={() => handleAction(selectedUser.id, "Reject")}
                      className="bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-[11px] font-bold py-2 rounded-lg flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      বাতিল করুন
                    </button>
                  </div>
                )}

                {/* General Maintenance Actions */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    disabled={actionLoading || selectedUser.status === "Suspended"}
                    onClick={() => handleAction(selectedUser.id, "Suspend")}
                    className="bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700 text-[10px] font-bold py-2 rounded-lg flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    স্থগিত (Suspend)
                  </button>
                  {selectedUser.status === "Banned" ? (
                    <button
                      disabled={actionLoading}
                      onClick={() => handleAction(selectedUser.id, "Unban")}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-[10px] font-bold py-2 rounded-lg flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      ব্যান সরান
                    </button>
                  ) : (
                    <button
                      disabled={actionLoading}
                      onClick={() => handleAction(selectedUser.id, "Ban")}
                      className="bg-slate-900 hover:bg-slate-850 text-white text-[10px] font-bold py-2 rounded-lg flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      <Ban className="w-3.5 h-3.5 text-rose-500" />
                      ব্যান করুন (Ban)
                    </button>
                  )}
                </div>

                {/* Reset User Password */}
                <button
                  disabled={actionLoading}
                  onClick={() => handleResetPass(selectedUser.id)}
                  className="w-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-[11px] font-bold py-2 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <KeyRound className="w-3.5 h-3.5 text-emerald-600" />
                  ইউজার পাসওয়ার্ড রিসেট লিংক পাঠান
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center p-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200/80 text-slate-400">
              <Search className="w-8 h-8 text-slate-300 mx-auto mb-2 stroke-[1.5]" />
              <p className="text-[11px] font-medium">কোনো মেম্বার সিলেক্ট করা নেই</p>
              <p className="text-[9px] text-slate-400 mt-1">বামদিকের মেম্বার তালিকা থেকে যেকোনো নামের উপর ক্লিক করে তার সম্পূর্ণ কার্যবিবরণী ও অ্যাডমিন অ্যাকশন কন্ট্রোল পরিচালনা করুন।</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
