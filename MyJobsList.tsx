import React from "react";
import { PlusCircle, Edit2, Play, Pause, Trash2, Users, Calendar, AlertCircle, RefreshCw } from "lucide-react";
import { Job } from "../types";

interface MyJobsListProps {
  jobs: Job[];
  currentUserId: string;
  onEditJob: (job: Job) => void;
  onUpdateStatus: (jobId: string, newStatus: "Active" | "Paused" | "Completed") => Promise<void>;
  onDeleteJob: (jobId: string) => Promise<void>;
  onAddNewClick: () => void;
}

export default function MyJobsList({
  jobs,
  currentUserId,
  onEditJob,
  onUpdateStatus,
  onDeleteJob,
  onAddNewClick
}: MyJobsListProps) {
  // Filter only jobs owned by the logged-in user
  const myJobs = jobs.filter((j) => j.userId === currentUserId);

  return (
    <div className="space-y-6" id="my-jobs-panel">
      <div className="flex items-center justify-between border-b border-slate-150 pb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">আমার পোস্টকৃত অফারসমূহ</h3>
          <p className="text-xs text-slate-500">আপনার পোস্ট করা ক্যাম্পেইনগুলোর বর্তমান অবস্থা ট্র্যাক করুন ও এডিট/ডিলিট করুন।</p>
        </div>
        <button
          onClick={onAddNewClick}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-4 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm shadow-emerald-700/10"
        >
          <PlusCircle className="w-4 h-4" />
          <span>নতুন অফার পোস্ট করুন</span>
        </button>
      </div>

      {myJobs.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-slate-400 space-y-4">
          <AlertCircle className="w-10 h-10 text-slate-300 mx-auto stroke-[1.5]" />
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-600">আপনি এখনো কোনো CPA অফার পোস্ট করেননি!</p>
            <p className="text-[10px] text-slate-400 max-w-xs mx-auto leading-relaxed">
              আপনার CPA প্যানেলের লিংক ব্যবহার করে লিড এক্সচেঞ্জ শুরু করতে এখনই উপরের "নতুন অফার পোস্ট করুন" বাটনে ক্লিক করুন।
            </p>
          </div>
          <button
            onClick={onAddNewClick}
            className="text-xs text-emerald-600 hover:text-emerald-500 font-bold border border-emerald-200 hover:bg-emerald-50/50 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            নতুন অফার তৈরি করুন
          </button>
        </div>
      ) : (
        <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-150 bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="p-4">অফারের নাম / টাইটেল</th>
                  <th className="p-4">সিপিএ নেটওয়ার্ক</th>
                  <th className="p-4">অবশিষ্ট স্লট</th>
                  <th className="p-4">স্ট্যাটাস</th>
                  <th className="p-4 text-right">কার্যক্রম (Actions)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
                {myJobs.map((job) => (
                  <tr key={job.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-slate-900 line-clamp-1">{job.title}</div>
                      <div className="text-[9px] text-slate-400 mt-1 font-mono flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>পোস্ট করা হয়েছে: {new Date(job.createdAt).toLocaleDateString("bn-BD")}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="bg-slate-100 border border-slate-200 px-2 py-0.5 rounded font-semibold text-slate-700">
                        {job.cpaNetwork}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1 font-mono font-bold text-slate-800">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span>{job.remainingSlots} / {job.slotsLimit}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full inline-block ${
                        job.status === "Active" ? "bg-emerald-100 text-emerald-800 border border-emerald-200" :
                        job.status === "Paused" ? "bg-amber-100 text-amber-800 border border-amber-200" :
                        "bg-slate-100 text-slate-800 border border-slate-200"
                      }`}>
                        {job.status === "Active" ? "সক্রিয়" : job.status === "Paused" ? "স্থগিত" : "সমাপ্ত"}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-1.5 whitespace-nowrap">
                      {job.status === "Active" ? (
                        <button
                          onClick={() => onUpdateStatus(job.id, "Paused")}
                          className="text-[10px] bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 px-2 py-1 rounded-lg font-semibold transition-all cursor-pointer inline-flex items-center gap-0.5"
                          title="Pause Offer"
                        >
                          <Pause className="w-3 h-3" />
                          <span>পজ</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => onUpdateStatus(job.id, "Active")}
                          className="text-[10px] bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-2 py-1 rounded-lg font-semibold transition-all cursor-pointer inline-flex items-center gap-0.5"
                          title="Resume Offer"
                        >
                          <Play className="w-3 h-3" />
                          <span>চালু</span>
                        </button>
                      )}

                      <button
                        onClick={() => onEditJob(job)}
                        className="text-[10px] bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 px-2 py-1 rounded-lg font-semibold transition-all cursor-pointer inline-flex items-center gap-0.5"
                        title="Edit Offer"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>এডিট</span>
                      </button>

                      <button
                        onClick={() => {
                          if (confirm("আপনি কি নিশ্চিতভাবে এই অফারটি চিরতরে ডিলিট করতে চান?")) {
                            onDeleteJob(job.id);
                          }
                        }}
                        className="text-[10px] bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 px-2 py-1 rounded-lg font-semibold transition-all cursor-pointer inline-flex items-center gap-0.5"
                        title="Delete Offer"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>ডিলিট</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
