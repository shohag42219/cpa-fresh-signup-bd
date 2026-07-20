import React, { useState } from "react";
import { FileCheck, FileX, ShieldAlert, Check, X, RefreshCw, AlertTriangle, Eye, HelpCircle } from "lucide-react";
import { TaskSubmission } from "../types";

interface AdminProofManagementProps {
  tasks: TaskSubmission[];
  onReviewTask: (taskId: string, action: "Approve" | "Reject" | "Resubmission Requested", rejectionReason?: string) => Promise<void>;
}

export default function AdminProofManagement({
  tasks,
  onReviewTask
}: AdminProofManagementProps) {
  const [statusFilter, setStatusFilter] = useState<"All" | "Pending" | "Approved" | "Rejected" | "Resubmission Requested">("All");
  const [selectedTask, setSelectedTask] = useState<TaskSubmission | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState("");

  const filteredTasks = tasks.filter(t => statusFilter === "All" || t.status === statusFilter);

  const handleReview = async (action: "Approve" | "Reject" | "Resubmission Requested") => {
    if (!selectedTask) return;
    if ((action === "Reject" || action === "Resubmission Requested") && !rejectionReason.trim()) {
      alert("বাতিল বা সংশোধনের জন্য অবশ্যই কারণ বা ফিডব্যাক প্রদান করুন।");
      return;
    }

    try {
      setActionLoading(true);
      setMessage("");
      await onReviewTask(selectedTask.id, action, rejectionReason);
      
      const actionName = action === "Approve" ? "অনুমোদন" : action === "Reject" ? "প্রত্যাখ্যান" : "সংশোধন অনুরোধ";
      setMessage(`টাস্কটি সফলভাবে ${actionName} করা হয়েছে!`);
      setSelectedTask(null);
      setRejectionReason("");
    } catch (err: any) {
      alert(err.message || "রিভিউ সম্পন্ন করা সম্ভব হয়নি।");
    } finally {
      setActionLoading(false);
    }
  };

  const bengaliInstructions = [
    "১. প্রথমে Chrome Beta ব্রাউজারে গিয়ে Data Clear করে সেই পেজের একটি স্ক্রিনশট নিয়ে জমা দিন।",
    "২. এরপর আমার দেওয়া CPA লিংক Chrome Beta ব্রাউজারে পেস্ট করে যে Landing Page আসবে, সেই পেজের একটি স্ক্রিনশট নিয়ে জমা দিন।",
    "৩. এরপর অ্যাপ ডাউনলোড শুরু করার সময় একটি স্ক্রিনশট নিয়ে জমা দিন।",
    "৪. অ্যাপে প্রবেশ করে সফলভাবে রেজিস্ট্রেশন সম্পন্ন করার পর সেই পেজের একটি স্ক্রিনশট নিয়ে জমা দিন।"
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Left Column: List of submissions */}
      <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200/85 overflow-hidden flex flex-col">
        {/* Filter header */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 self-start sm:self-center">
            <FileCheck className="w-4 h-4 text-emerald-600" /> সকল প্রুফ সাবমিশন তালিকা (All Proofs)
          </h3>

          <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200">
            {(["All", "Pending", "Approved", "Rejected", "Resubmission Requested"] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                  statusFilter === tab
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {tab === "All" ? "সব" : tab === "Resubmission Requested" ? "Resubmit" : tab}
              </button>
            ))}
          </div>
        </div>

        {message && (
          <div className="bg-slate-950 text-white text-xs p-3 border-b border-slate-850 flex items-center justify-between">
            <span>{message}</span>
            <button onClick={() => setMessage("")} className="font-bold hover:text-red-400">X</button>
          </div>
        )}

        {/* Proofs list table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-150 bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="p-4">মেম্বার (Worker)</th>
                <th className="p-4">পোস্টকৃত অফার</th>
                <th className="p-4">জমা দেওয়ার সময়</th>
                <th className="p-4">স্ট্যাটাস</th>
                <th className="p-4 text-right">মডারেট</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-400">
                    কোনো প্রুফ সাবমিশন রেকর্ড পাওয়া যায়নি।
                  </td>
                </tr>
              ) : (
                filteredTasks.map((task) => (
                  <tr 
                    key={task.id}
                    onClick={() => setSelectedTask(task)}
                    className={`hover:bg-slate-50 cursor-pointer transition-colors ${selectedTask?.id === task.id ? "bg-emerald-50/40" : ""}`}
                  >
                    <td className="p-4">
                      <div className="font-bold text-slate-900">{task.workerName}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">ID: {task.workerId}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-slate-800 line-clamp-1">{task.jobTitle}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">মালিক: {task.ownerName}</div>
                    </td>
                    <td className="p-4 font-mono text-[10px] text-slate-400">
                      {task.submittedAt ? new Date(task.submittedAt).toLocaleString() : "N/A"}
                    </td>
                    <td className="p-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block ${
                        task.status === "Approved" ? "bg-emerald-100 text-emerald-800" :
                        task.status === "Pending" ? "bg-amber-100 text-amber-800 animate-pulse" :
                        task.status === "Rejected" ? "bg-rose-100 text-rose-800" :
                        "bg-indigo-100 text-indigo-800"
                      }`}>
                        {task.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTask(task);
                        }}
                        className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-2.5 py-1 rounded transition-all cursor-pointer"
                      >
                        রিভিউ
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="bg-slate-50 px-4 py-2.5 border-t border-slate-100 text-[10px] text-slate-400 text-right">
          মোট ফিল্টারকৃত প্রুফ: <span className="font-bold text-slate-600 font-mono">{filteredTasks.length}</span> টি
        </div>
      </div>

      {/* Right Column: Detailed Proof reviewer */}
      <div className="space-y-4">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/85 p-5 space-y-6 flex flex-col h-fit">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-1.5">
            <Eye className="w-4 h-4 text-emerald-600" /> স্ক্রিনশট ও রিভিউ ওয়ার্কস্পেস
          </h3>

          {selectedTask ? (
            <div className="space-y-5" id="proof-inspector-panel">
              <div className="space-y-1 bg-slate-50 p-4 rounded-xl border border-slate-200/60 text-xs">
                <p><strong>অফার:</strong> {selectedTask.jobTitle}</p>
                <p><strong>মেম্বার:</strong> {selectedTask.workerName} ({selectedTask.workerId})</p>
                <p><strong>পোস্টকারী:</strong> {selectedTask.ownerName} ({selectedTask.ownerId})</p>
                <p><strong>স্ট্যাটাস:</strong> <span className="font-bold text-indigo-700">{selectedTask.status}</span></p>
                {selectedTask.rejectionReason && (
                  <p className="text-rose-600 font-bold bg-rose-50 p-2 rounded border border-rose-100 mt-2">
                    রিজেকশন/সংশোধন কারণ: {selectedTask.rejectionReason}
                  </p>
                )}
              </div>

              {/* Exact 4 Screenshots displays */}
              <div className="space-y-4">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">জমা দেওয়া ৪টি স্ক্রিনশট:</span>
                {selectedTask.screenshots && selectedTask.screenshots.length === 4 ? (
                  <div className="space-y-3.5">
                    {selectedTask.screenshots.map((url, idx) => (
                      <div key={idx} className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-700 block bg-slate-50 border border-slate-200 p-2.5 rounded-lg leading-relaxed">
                          {bengaliInstructions[idx]}
                        </span>
                        <div className="border border-slate-200 rounded-xl overflow-hidden shadow-inner max-h-56 bg-slate-100 flex items-center justify-center">
                          <img 
                            src={url || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80"} 
                            alt={`Screenshot ${idx + 1}`} 
                            className="object-contain max-h-56 w-full"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-6 bg-amber-50 text-amber-700 rounded-xl border border-dashed border-amber-200 text-xs flex flex-col items-center gap-1">
                    <ShieldAlert className="w-5 h-5 text-amber-600 animate-bounce" />
                    <span>প্রুফ স্ক্রিনশট এখনো সম্পূর্ণভাবে আপলোড করা হয়নি।</span>
                  </div>
                )}
              </div>

              {/* Review Buttons Actions if pending */}
              {selectedTask.status === "Pending" ? (
                <div className="space-y-3.5 border-t border-slate-100 pt-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">রিভিউ সিদ্ধান্ত গ্রহণ করুন:</span>
                  
                  {/* Feedback Textarea */}
                  <textarea
                    rows={2}
                    placeholder="রিজেক্ট বা সংশোধনের জন্য ফিডব্যাক কারণ লিখুন..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full p-2.5 text-xs border border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none bg-slate-50 focus:bg-white transition-all shadow-sm resize-none"
                  ></textarea>

                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      disabled={actionLoading}
                      onClick={() => handleReview("Approve")}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold py-2 rounded-lg flex flex-col items-center justify-center gap-0.5 cursor-pointer disabled:opacity-50"
                      title="Approve Submission"
                    >
                      <Check className="w-4 h-4" />
                      <span>অনুমোদন</span>
                    </button>
                    <button
                      disabled={actionLoading}
                      onClick={() => handleReview("Reject")}
                      className="bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-bold py-2 rounded-lg flex flex-col items-center justify-center gap-0.5 cursor-pointer disabled:opacity-50"
                      title="Reject Submission"
                    >
                      <X className="w-4 h-4" />
                      <span>রিজেক্ট</span>
                    </button>
                    <button
                      disabled={actionLoading}
                      onClick={() => handleReview("Resubmission Requested")}
                      className="bg-amber-100 hover:bg-amber-200 text-amber-800 text-[10px] font-bold py-2 rounded-lg flex flex-col items-center justify-center gap-0.5 cursor-pointer disabled:opacity-50"
                      title="Request Correction"
                    >
                      <AlertTriangle className="w-4 h-4" />
                      <span>সংশোধন</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="border-t border-slate-150 pt-4 text-center text-[10px] text-slate-400 font-medium">
                  এই টাস্কটি ইতিমধ্যেই সম্পন্ন হয়েছে। পুনরায় রিভিউ করা সম্ভব নয়।
                </div>
              )}
            </div>
          ) : (
            <div className="text-center p-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200/80 text-slate-400">
              <Eye className="w-8 h-8 text-slate-300 mx-auto mb-2 stroke-[1.5]" />
              <p className="text-[11px] font-medium">কোনো প্রুফ সিলেক্ট করা নেই</p>
              <p className="text-[9px] text-slate-400 mt-1">বামদিকের প্রুফ তালিকা থেকে রিভিউ করতে যেকোনো লাইনের উপর ক্লিক করুন। আপনি ৪টি স্ক্রিনশট এবং ইন্সট্রাকশন মিলিয়ে দেখতে পারবেন।</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
