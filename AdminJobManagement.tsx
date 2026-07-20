import React, { useState } from "react";
import { Search, Filter, Edit, Play, Pause, Trash2, Briefcase, RefreshCw, Globe, Smartphone, HelpCircle } from "lucide-react";
import { Job } from "../types";

interface AdminJobManagementProps {
  jobs: Job[];
  onUpdateStatus: (jobId: string, status: "Active" | "Paused" | "Completed") => Promise<void>;
  onDeleteJob: (jobId: string) => Promise<void>;
  onEditJob: (job: Job) => void;
}

export default function AdminJobManagement({
  jobs,
  onUpdateStatus,
  onDeleteJob,
  onEditJob
}: AdminJobManagementProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Active" | "Paused" | "Completed">("All");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const filteredJobs = jobs.filter(j => {
    const matchesSearch = 
      j.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      j.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      j.cpaNetwork.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All" || j.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusToggle = async (jobId: string, currentStatus: string) => {
    try {
      setLoadingId(jobId);
      setMessage("");
      const nextStatus = currentStatus === "Active" ? "Paused" : "Active";
      await onUpdateStatus(jobId, nextStatus);
      setMessage(`অফারটি সফলভাবে ${nextStatus === "Active" ? "সক্রিয় (Active)" : "স্থগিত (Paused)"} করা হয়েছে।`);
    } catch (err: any) {
      setMessage(err.message || "স্ট্যাটাস পরিবর্তন করা সম্ভব হয়নি।");
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = async (jobId: string) => {
    if (!window.confirm("আপনি কি নিশ্চিতভাবে এই অফারটি ডিলিট করতে চান? এটি রিভার্স করা যাবে না।")) return;
    try {
      setLoadingId(jobId);
      setMessage("");
      await onDeleteJob(jobId);
      setMessage("অফারটি সফলভাবে ডিলিট করা হয়েছে।");
    } catch (err: any) {
      setMessage(err.message || "ডিলিট করা সম্ভব হয়নি।");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/85 overflow-hidden flex flex-col">
      {/* Header Controls */}
      <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 self-start sm:self-center">
          <Briefcase className="w-4 h-4 text-emerald-600" /> অফার বা জব ম্যানেজমেন্ট (Job Management)
        </h3>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Search bar */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="অফার নাম, CPA নেটওয়ার্ক বা মেম্বার নাম..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:border-emerald-500 bg-white transition-all shadow-sm focus:outline-none"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </div>

          {/* Status filtering */}
          <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200">
            {(["All", "Active", "Paused", "Completed"] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                  statusFilter === tab
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {tab === "All" ? "সব" : tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {message && (
        <div className="bg-slate-900 text-white text-xs p-3.5 border-b border-slate-800 flex items-center justify-between">
          <span>{message}</span>
          <button onClick={() => setMessage("")} className="font-bold hover:text-red-400">X</button>
        </div>
      )}

      {/* Jobs table list */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-150 bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <th className="p-4">অফার নাম ও লিঙ্ক</th>
              <th className="p-4">পোস্টকারী</th>
              <th className="p-4">প্যানেল ও টার্গেট</th>
              <th className="p-4">অবশিষ্ট স্লট</th>
              <th className="p-4">স্ট্যাটাস</th>
              <th className="p-4 text-right">মডারেট অ্যাকশন</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
            {filteredJobs.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-12 text-center text-slate-400">
                  কোনো অফার পাওয়া যায়নি।
                </td>
              </tr>
            ) : (
              filteredJobs.map((job) => (
                <tr key={job.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-slate-900">{job.title}</div>
                    <a 
                      href={job.affiliateLink} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-[10px] text-emerald-600 font-mono block mt-1 hover:underline truncate max-w-xs"
                    >
                      {job.affiliateLink}
                    </a>
                  </td>
                  <td className="p-4">
                    <div className="font-medium text-slate-800">{job.username}</div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">ID: {job.userId}</div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1 items-center">
                      <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[9px] font-semibold">{job.cpaNetwork}</span>
                      <span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded text-[9px] font-semibold flex items-center gap-0.5">
                        <Globe className="w-2.5 h-2.5" /> {job.country}
                      </span>
                      <span className="bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded text-[9px] font-semibold flex items-center gap-0.5">
                        <Smartphone className="w-2.5 h-2.5" /> {job.deviceType}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 font-mono font-bold">
                    <span className="text-slate-800">{job.remainingSlots}</span> / <span className="text-slate-400">{job.slotsLimit}</span>
                  </td>
                  <td className="p-4">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block ${
                      job.status === "Active" ? "bg-emerald-100 text-emerald-800" :
                      job.status === "Paused" ? "bg-amber-100 text-amber-800" :
                      "bg-slate-100 text-slate-500"
                    }`}>
                      {job.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Play / Pause toggle */}
                      {job.status !== "Completed" && (
                        <button
                          disabled={loadingId === job.id}
                          onClick={() => handleStatusToggle(job.id, job.status)}
                          className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                            job.status === "Active" 
                              ? "bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-700" 
                              : "bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-700"
                          }`}
                          title={job.status === "Active" ? "Pause Job" : "Activate Job"}
                        >
                          {job.status === "Active" ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                        </button>
                      )}

                      {/* Edit job */}
                      <button
                        onClick={() => onEditJob(job)}
                        className="p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 transition-all cursor-pointer"
                        title="Edit Job Info"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete job */}
                      <button
                        disabled={loadingId === job.id}
                        onClick={() => handleDelete(job.id)}
                        className="p-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg text-rose-600 transition-all cursor-pointer"
                        title="Delete Job"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="bg-slate-50 px-4 py-2.5 border-t border-slate-100 text-[10px] text-slate-400 text-right">
        মোট ফিল্টারকৃত অফার: <span className="font-bold text-slate-600 font-mono">{filteredJobs.length}</span> টি
      </div>
    </div>
  );
}
