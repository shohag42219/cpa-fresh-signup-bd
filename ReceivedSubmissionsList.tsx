import React, { useState } from "react";
import { Clock, CheckCircle, Ban, AlertTriangle, Eye, Image as ImageIcon, Check, X, Clipboard, ArrowUpRight, HelpCircle } from "lucide-react";
import { TaskSubmission } from "../types";

interface ReceivedSubmissionsListProps {
  tasks: TaskSubmission[];
  onReviewTask: (taskId: string, action: "Approve" | "Reject" | "Resubmission Requested", rejectionReason?: string) => Promise<boolean>;
}

export default function ReceivedSubmissionsList({ tasks, onReviewTask }: ReceivedSubmissionsListProps) {
  // Tabs: pending, approved, other
  const [reviewTab, setReviewTab] = useState<"pending" | "approved" | "reviewed">("pending");
  const [selectedSub, setSelectedSub] = useState<TaskSubmission | null>(null);

  // Review states
  const [reviewAction, setReviewAction] = useState<"Approve" | "Reject" | "Resubmission Requested" | null>(null);
  const [reasonText, setReasonText] = useState("");
  const [processing, setProcessing] = useState(false);

  // Image zoom state
  const [zoomImage, setZoomImage] = useState<string | null>(null);
  const [zoomIndex, setZoomIndex] = useState<number>(0);

  const pendingSubmissions = tasks.filter(t => t.status === "Pending");
  const approvedSubmissions = tasks.filter(t => t.status === "Approved");
  const reviewedOtherSubmissions = tasks.filter(t => t.status === "Rejected" || t.status === "Resubmission Requested");

  const currentTabSubmissions = 
    reviewTab === "pending" 
      ? pendingSubmissions 
      : reviewTab === "approved" 
        ? approvedSubmissions 
        : reviewedOtherSubmissions;

  const handleReviewAction = async (taskId: string) => {
    if (!reviewAction) return;

    if ((reviewAction === "Reject" || reviewAction === "Resubmission Requested") && !reasonText.trim()) {
      alert("বাতিল বা প্রুফ সংশোধনের অনুরোধ করতে অবশ্যই কারণ বা নির্দেশনা প্রদান করুন।");
      return;
    }

    setProcessing(true);
    const ok = await onReviewTask(taskId, reviewAction, reasonText);
    setProcessing(false);

    if (ok) {
      setSelectedSub(null);
      setReviewAction(null);
      setReasonText("");
    }
  };

  const getStatusBadge = (status: TaskSubmission["status"]) => {
    switch (status) {
      case "Pending":
        return <span className="text-[10px] bg-yellow-100 text-yellow-800 border border-yellow-200 px-2.5 py-0.5 rounded font-bold uppercase font-mono">পেন্ডিং</span>;
      case "Approved":
        return <span className="text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded font-bold uppercase font-mono">অনুমোদিত</span>;
      case "Rejected":
        return <span className="text-[10px] bg-red-100 text-red-800 border border-red-200 px-2.5 py-0.5 rounded font-bold uppercase font-mono">বাতিলকৃত</span>;
      case "Resubmission Requested":
        return <span className="text-[10px] bg-amber-100 text-amber-800 border border-amber-200 px-2.5 py-0.5 rounded font-bold uppercase font-mono">সংশোধন অনুরোধ</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6" id="received-submissions-container">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">প্রাপ্ত প্রুফসমূহ (Received Proof Submissions)</h2>
          <p className="text-xs text-slate-500">মেম্বারদের সম্পন্ন করা কাজের স্ক্রিনশটসমূহ যাচাই করে পয়েন্ট রিলিজ বা রিজেক্ট করুন।</p>
        </div>

        {/* Mini tabs */}
        <div className="bg-slate-100 p-1 rounded-xl flex gap-1 self-start sm:self-center">
          <button
            onClick={() => setReviewTab("pending")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              reviewTab === "pending"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <span>পেন্ডিং ({pendingSubmissions.length})</span>
            {pendingSubmissions.length > 0 && (
              <span className="w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
            )}
          </button>
          <button
            onClick={() => setReviewTab("approved")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              reviewTab === "approved"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            অনুমোদিত ({approvedSubmissions.length})
          </button>
          <button
            onClick={() => setReviewTab("reviewed")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              reviewTab === "reviewed"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            অন্যান্য ({reviewedOtherSubmissions.length})
          </button>
        </div>
      </div>

      {currentTabSubmissions.length === 0 ? (
        <div className="bg-slate-50 border border-dashed border-slate-200 rounded-3xl p-12 text-center text-slate-500">
          <ImageIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-medium">এই ট্যাবে কোনো প্রুফ সাবমিশন নেই।</p>
          <p className="text-xs text-slate-400 mt-1">মেম্বাররা কাজ সাবমিট করলে এখানে লাইভ জমা হবে।</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {currentTabSubmissions.map((sub) => (
            <div 
              key={sub.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 hover:shadow-sm transition-all space-y-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1">
                  <span className="text-[9px] bg-[#006a4e]/10 text-[#006a4e] px-2 py-0.5 rounded border border-[#006a4e]/20 font-mono uppercase tracking-wider font-bold">
                    {sub.cpaNetwork} LEAD
                  </span>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">{sub.jobTitle}</h3>
                  <div className="text-xs text-slate-500 flex flex-wrap gap-x-3 gap-y-1 pt-0.5">
                    <span>কর্মী: <strong className="text-slate-700 font-semibold">{sub.workerName}</strong></span>
                    {sub.submittedAt && (
                      <span>জমা টাইম: <strong>{new Date(sub.submittedAt).toLocaleString("bn-BD")}</strong></span>
                    )}
                  </div>
                </div>
                <div>
                  {getStatusBadge(sub.status)}
                </div>
              </div>

              {/* Review Actions triggered directly or via modal */}
              <div className="flex items-center justify-between border-t border-slate-100 pt-3.5">
                <span className="text-[11px] text-slate-400 font-mono">
                  টাস্ক আইডি: {sub.id}
                </span>

                <button
                  onClick={() => {
                    setSelectedSub(sub);
                    setReviewAction(null);
                    setReasonText("");
                  }}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-1.5 px-4 rounded-xl text-xs flex items-center gap-1 transition-all cursor-pointer shadow-sm"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>প্রুফ যাচাই ও রিভিও করুন</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review overlay modal */}
      {selectedSub && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center z-40 p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-150 overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between shrink-0">
              <div className="space-y-0.5">
                <span className="text-[9px] bg-yellow-500 text-slate-950 px-2 py-0.5 rounded font-bold uppercase tracking-wide">
                  SCREENSHOT VALIDATION PANEL
                </span>
                <h4 className="text-sm sm:text-base font-bold">{selectedSub.jobTitle}</h4>
              </div>
              <button
                onClick={() => setSelectedSub(null)}
                className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-700">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4.5 text-xs space-y-1.5 text-slate-600">
                <p>মেম্বার <strong>{selectedSub.workerName}</strong> এর আপলোডকৃত ৪টি স্ক্রিনশট নিচে ক্রমানুসারে দেওয়া হলো। স্ক্রিনশটসমূহ জুম করতে ক্লিক করুন।</p>
                <p className="text-slate-400">⚠️ সতর্কীকরণ: অনুগ্রহ করে প্রতিটি স্ক্রিনশট খুব ভালোভাবে চেক করুন। Data Clear, Landing Page, ডাউনলোড ও রেজিস্ট্রেশন প্রমাণাদি সঠিক আছে কিনা নিশ্চিত হয়ে তবেই পয়েন্ট রিলিজ করুন।</p>
              </div>

              {/* Grid of 4 screenshots */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[0, 1, 2, 3].map((idx) => {
                  const src = selectedSub.screenshots?.[idx];
                  const labels = [
                    "১ম স্ক্রিনশট (Chrome Beta-তে Data Clear)",
                    "২য় স্ক্রিনশট (Chrome Beta-তে Landing Page)",
                    "৩য় স্ক্রিনশট (অ্যাপ ডাউনলোড শুরু করার সময়)",
                    "৪র্থ স্ক্রিনশট (সফলভাবে রেজিস্ট্রেশন সম্পন্ন)"
                  ];

                  return (
                    <div key={idx} className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2 text-xs">
                      <strong className="text-slate-700 block font-bold text-[11px]">{labels[idx]}</strong>
                      <div 
                        onClick={() => {
                          if (src) {
                            setZoomImage(src);
                            setZoomIndex(idx);
                          }
                        }}
                        className="border border-slate-200 rounded-xl overflow-hidden bg-slate-100 h-60 cursor-zoom-in hover:brightness-95 transition-all flex items-center justify-center relative group"
                      >
                        {src ? (
                          <>
                            <img src={src} alt={labels[idx]} className="w-full h-full object-contain" />
                            <div className="absolute inset-0 bg-slate-950/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1">
                              <Eye className="w-4 h-4" />
                              <span>ক্লিক করে বড় করুন</span>
                            </div>
                          </>
                        ) : (
                          <span className="text-slate-400">স্ক্রিনশট আপলোড করা হয়নি</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Review status actions container */}
              {selectedSub.status === "Pending" && (
                <div className="border-t border-slate-150 pt-6 space-y-4">
                  <h5 className="text-sm font-bold text-slate-900">ফলাফল ও রিভিও অ্যাকশন গ্রহণ করুন:</h5>
                  
                  <div className="flex flex-wrap gap-2.5">
                    <button
                      onClick={() => {
                        setReviewAction("Approve");
                        setReasonText("");
                      }}
                      className={`font-bold py-2.5 px-6 rounded-xl text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                        reviewAction === "Approve"
                          ? "bg-emerald-600 text-white shadow-md shadow-emerald-700/25"
                          : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200"
                      }`}
                    >
                      <Check className="w-4 h-4" />
                      <span>অনুমোদন ও পয়েন্ট রিলিজ (Approve & Pay)</span>
                    </button>

                    <button
                      onClick={() => {
                        setReviewAction("Resubmission Requested");
                        setReasonText("");
                      }}
                      className={`font-bold py-2.5 px-6 rounded-xl text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                        reviewAction === "Resubmission Requested"
                          ? "bg-amber-600 text-white shadow-md shadow-amber-700/25"
                          : "bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200"
                      }`}
                    >
                      <AlertTriangle className="w-4 h-4" />
                      <span>প্রুফ সংশোধন অনুরোধ (Request Resubmit)</span>
                    </button>

                    <button
                      onClick={() => {
                        setReviewAction("Reject");
                        setReasonText("");
                      }}
                      className={`font-bold py-2.5 px-6 rounded-xl text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                        reviewAction === "Reject"
                          ? "bg-red-600 text-white shadow-md shadow-red-700/25"
                          : "bg-red-50 text-red-800 hover:bg-red-100 border border-red-200"
                      }`}
                    >
                      <Ban className="w-4 h-4" />
                      <span>সরাসরি রিজেক্ট/বাতিল করুন (Reject)</span>
                    </button>
                  </div>

                  {/* Input for Reject or Resubmit instructions */}
                  {(reviewAction === "Reject" || reviewAction === "Resubmission Requested") && (
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4.5 space-y-2 animate-in fade-in slide-in-from-top-3 duration-150">
                      <label className="text-xs font-bold text-slate-800 block">
                        {reviewAction === "Reject" ? "রিজেক্ট করার যথাযথ কারণ উল্লেখ করুন:" : "সংশোধনের স্পষ্ট নির্দেশনা/ফিডব্যাক লিখুন:"}
                      </label>
                      <textarea
                        value={reasonText}
                        onChange={(e) => setReasonText(e.target.value)}
                        rows={3}
                        placeholder={reviewAction === "Reject" ? "যেমন: ৪ নম্বর স্ক্রিনশটটি স্পষ্ট নয় বা ভুল সাইন-আপ প্রুফ।" : "যেমন: অনুগ্রহ করে ২য় স্ক্রিনশটটি সঠিক ল্যান্ডিং পেজের দিন এবং পুনরায় সাবমিট করুন।"}
                        className="w-full p-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-xs bg-white resize-none shadow-inner"
                      />
                      <p className="text-[11px] text-slate-400">⚠️ এই টেক্সটটি মেম্বার তার অ্যাক্টিভ বা হিস্টরি তালিকায় সরাসরি দেখতে পাবেন এবং সেই অনুযায়ী সংশোধন করার সুযোগ পাবেন।</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 p-4 border-t border-slate-150 flex items-center justify-between shrink-0">
              <span className="text-slate-400 text-xs">
                কর্মী আইডি: <strong className="font-mono">{selectedSub.workerId}</strong>
              </span>

              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedSub(null)}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-2 px-5 rounded-xl text-xs transition-colors cursor-pointer"
                >
                  বন্ধ করুন
                </button>
                {selectedSub.status === "Pending" && reviewAction && (
                  <button
                    onClick={() => handleReviewAction(selectedSub.id)}
                    disabled={processing}
                    className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 px-6 rounded-xl text-xs transition-colors cursor-pointer shadow-sm flex items-center gap-1.5"
                  >
                    <span>{processing ? "সাবমিট হচ্ছে..." : "রিভিও নিশ্চিত করুন"}</span>
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Image zoom lightbox overlay */}
      {zoomImage && (
        <div className="fixed inset-0 bg-slate-950/95 flex flex-col items-center justify-center z-50 p-4 animate-in fade-in duration-150">
          <button 
            onClick={() => setZoomImage(null)}
            className="absolute top-5 right-5 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="max-w-4xl w-full max-h-[80vh] flex items-center justify-center">
            <img 
              src={zoomImage} 
              alt="Zoomed Proof" 
              className="max-w-full max-h-[80vh] object-contain rounded-lg border border-white/10 shadow-2xl"
            />
          </div>

          <div className="mt-4 text-center space-y-1">
            <span className="text-[11px] bg-emerald-600 text-white px-3 py-1 rounded-full font-mono font-bold uppercase tracking-wider">
              Screenshot {zoomIndex + 1}
            </span>
            <p className="text-white/80 text-xs sm:text-sm font-medium mt-1">
              {[
                "১ম স্ক্রিনশট (Chrome Beta-তে Data Clear)",
                "২য় স্ক্রিনশট (Chrome Beta-তে Landing Page)",
                "৩য় স্ক্রিনশট (অ্যাপ ডাউনলোড শুরু করার সময়)",
                "৪র্থ স্ক্রিনশট (সফলভাবে রেজিস্ট্রেশন সম্পন্ন)"
              ][zoomIndex]}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
