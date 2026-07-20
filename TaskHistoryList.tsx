import React, { useState } from "react";
import { Clock, CheckCircle, Ban, AlertTriangle, Image as ImageIcon, Eye, Calendar, CalendarCheck, HelpCircle, X } from "lucide-react";
import { TaskSubmission } from "../types";

interface TaskHistoryListProps {
  tasks: TaskSubmission[];
}

export default function TaskHistoryList({ tasks }: TaskHistoryListProps) {
  // Sort tasks by latest submission / creation date first
  const sortedTasks = [...tasks].sort((a, b) => {
    const dateA = new Date(a.submittedAt || a.createdAt).getTime();
    const dateB = new Date(b.submittedAt || b.createdAt).getTime();
    return dateB - dateA;
  });

  const [viewScreenshots, setViewScreenshots] = useState<string[] | null>(null);
  const [selectedTitle, setSelectedTitle] = useState<string>("");

  const getStatusBadge = (status: TaskSubmission["status"]) => {
    switch (status) {
      case "Accepted":
        return (
          <span className="text-[10px] bg-slate-100 text-slate-800 font-bold px-2.5 py-1 rounded border border-slate-200 uppercase font-mono tracking-wider">
            গৃহীত (Accepted)
          </span>
        );
      case "Pending":
        return (
          <span className="text-[10px] bg-yellow-100 text-yellow-800 font-bold px-2.5 py-1 rounded border border-yellow-200 uppercase font-mono tracking-wider flex items-center gap-1">
            <Clock className="w-3 h-3" /> পেন্ডিং (Pending)
          </span>
        );
      case "Approved":
        return (
          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded border border-emerald-200 uppercase font-mono tracking-wider flex items-center gap-1 animate-pulse">
            <CheckCircle className="w-3 h-3" /> অনুমোদিত (Approved)
          </span>
        );
      case "Rejected":
        return (
          <span className="text-[10px] bg-red-100 text-red-800 font-bold px-2.5 py-1 rounded border border-red-200 uppercase font-mono tracking-wider flex items-center gap-1">
            <Ban className="w-3 h-3" /> বাতিলকৃত (Rejected)
          </span>
        );
      case "Resubmission Requested":
        return (
          <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2.5 py-1 rounded border border-amber-200 uppercase font-mono tracking-wider flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> সংশোধন অনুরোধ (Feedback)
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6" id="task-history-container">
      <div>
        <h2 className="text-base font-bold text-slate-900">আমার কাজের ইতিহাস (Task Submission History)</h2>
        <p className="text-xs text-slate-500">আপনার সম্পন্ন করা সকল কাজের রিয়েল-টাইম স্ট্যাটাস ও ইতিহাস ট্র্যাক করুন।</p>
      </div>

      {sortedTasks.length === 0 ? (
        <div className="bg-slate-50 border border-dashed border-slate-200 rounded-3xl p-12 text-center text-slate-500">
          <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-medium">কোনো পূর্ববর্তী কাজের ইতিহাস পাওয়া যায়নি।</p>
          <p className="text-xs text-slate-400 mt-1">জবে জয়েন করে প্রুফ সাবমিট করার পর রিয়েল-টাইম তথ্য এখানে পাবেন।</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedTasks.map((task) => (
            <div 
              key={task.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4"
            >
              {/* Header and status */}
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1">
                  <span className="text-[9px] bg-indigo-50 text-indigo-700 font-bold px-2.5 py-0.5 rounded border border-indigo-150 uppercase tracking-wider font-mono">
                    {task.cpaNetwork} Lead Exchange
                  </span>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">{task.jobTitle}</h3>
                </div>
                <div>
                  {getStatusBadge(task.status)}
                </div>
              </div>

              {/* Timestamp Logs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-150 text-[11px] sm:text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span>গৃহীত হয়েছে: <strong>{new Date(task.createdAt).toLocaleString("bn-BD")}</strong></span>
                </div>
                {task.submittedAt && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span>প্রুফ জমা: <strong>{new Date(task.submittedAt).toLocaleString("bn-BD")}</strong></span>
                  </div>
                )}
                {task.reviewedAt && (
                  <div className="flex items-center gap-2">
                    <CalendarCheck className="w-4 h-4 text-emerald-600" />
                    <span>পর্যালোচনা: <strong>{new Date(task.reviewedAt).toLocaleString("bn-BD")}</strong></span>
                  </div>
                )}
              </div>

              {/* Owner Rejection Feedback */}
              {(task.status === "Rejected" || task.status === "Resubmission Requested") && task.rejectionReason && (
                <div className="bg-red-50/50 border border-red-100 rounded-xl p-4 text-xs">
                  <div className="flex items-center gap-1.5 text-red-900 font-bold mb-1">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <span>কাজ বাতিল বা সংশোধনের কারণ (Owner Feedback):</span>
                  </div>
                  <p className="text-red-700 bg-white border border-red-150 p-3 rounded-lg leading-relaxed font-semibold">
                    {task.rejectionReason}
                  </p>
                </div>
              )}

              {/* Action: view submitted screenshots */}
              {task.screenshots && task.screenshots.length > 0 && (
                <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                  <span className="text-[11px] text-slate-400">
                    পোস্টকার্ড আইডি: <strong className="font-mono text-slate-500">{task.id}</strong>
                  </span>
                  
                  <button
                    onClick={() => {
                      setViewScreenshots(task.screenshots);
                      setSelectedTitle(task.jobTitle);
                    }}
                    className="text-slate-700 hover:text-emerald-700 bg-slate-100 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 rounded-xl py-1.5 px-4 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>সাবমিটকৃত ৪টি প্রুফ দেখুন</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Screen Shot lightbox modal */}
      {viewScreenshots && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div>
                <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider">
                  Proof Gallery
                </span>
                <h4 className="font-bold text-sm sm:text-base leading-snug mt-1">{selectedTitle}</h4>
              </div>
              <button
                onClick={() => setViewScreenshots(null)}
                className="text-white/60 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <p className="text-xs text-slate-500 text-center">
                আপনার আপলোডকৃত ৪টি প্রমাণ স্ক্রিনশটের গ্যালারী ভিউ:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {viewScreenshots.map((scr, idx) => (
                  <div key={idx} className="bg-slate-50 border border-slate-200 rounded-2xl p-3 space-y-2">
                    <span className="text-[10px] font-bold bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-mono uppercase tracking-wider block w-max">
                      Screenshot {idx + 1}
                    </span>
                    <div className="border border-slate-150 rounded-xl overflow-hidden bg-slate-100 h-64 flex items-center justify-center">
                      {scr ? (
                        <img 
                          src={scr} 
                          alt={`Proof Screenshot ${idx + 1}`}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <span className="text-xs text-slate-400">কোনো প্রুফ নেই</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-50 p-4 border-t border-slate-150 flex justify-end">
              <button
                onClick={() => setViewScreenshots(null)}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 px-6 rounded-xl text-xs transition-colors cursor-pointer shadow-sm"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
