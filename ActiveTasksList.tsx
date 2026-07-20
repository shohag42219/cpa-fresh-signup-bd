import React, { useState, useRef } from "react";
import { Smartphone, Compass, Globe, ExternalLink, ArrowUpRight, Upload, X, CheckSquare, AlertTriangle, MessageSquare, Copy, Check } from "lucide-react";
import { TaskSubmission } from "../types";

interface ActiveTasksListProps {
  tasks: TaskSubmission[];
  onSubmitProof: (taskId: string, screenshots: string[]) => Promise<boolean>;
}

export default function ActiveTasksList({ tasks, onSubmitProof }: ActiveTasksListProps) {
  const activeTasks = tasks.filter(t => t.status === "Accepted" || t.status === "Resubmission Requested");

  const [submittingTaskId, setSubmittingTaskId] = useState<string | null>(null);
  const [screenshots, setScreenshots] = useState<string[]>(["", "", "", ""]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

  const fileInputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null)
  ];

  const handleCopyLink = (link: string, id: string) => {
    navigator.clipboard.writeText(link);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const bengaliInstructions = [
    "১. প্রথমে Chrome Beta ব্রাউজারে গিয়ে **Data Clear** করে সেই পেজের একটি স্ক্রিনশট নিয়ে জমা দিন।",
    "২. এরপর আমার দেওয়া CPA লিংক Chrome Beta ব্রাউজারে পেস্ট করে যে Landing Page আসবে, সেই পেজের একটি স্ক্রিনশট নিয়ে জমা দিন।",
    "৩. এরপর অ্যাপ **ডাউনলোড শুরু করার সময়** একটি স্ক্রিনশট নিয়ে জমা দিন।",
    "৪. অ্যাপে প্রবেশ করে সফলভাবে রেজিস্ট্রেশন সম্পন্ন করার পর সেই পেজের একটি স্ক্রিনশট নিয়ে জমা দিন।"
  ];

  const processFile = (file: File, index: number) => {
    if (!file.type.startsWith("image/")) {
      alert("শুধুমাত্র ইমেজ ফাইল আপলোড করা সম্ভব।");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setScreenshots(prev => {
        const next = [...prev];
        next[index] = base64;
        return next;
      });
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file, index);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file, index);
    }
  };

  const handleRemoveScreenshot = (index: number) => {
    setScreenshots(prev => {
      const next = [...prev];
      next[index] = "";
      return next;
    });
    if (fileInputRefs[index].current) {
      fileInputRefs[index].current!.value = "";
    }
  };

  const handleSubmit = async (taskId: string) => {
    if (screenshots.some(s => !s)) {
      alert("টাস্ক সাবমিট করতে ৪টি স্ক্রিনশটই সফলভাবে আপলোড করা আবশ্যক।");
      return;
    }

    setUploadingIndex(999); // Show loading spinner on button
    const success = await onSubmitProof(taskId, screenshots);
    setUploadingIndex(null);

    if (success) {
      setSubmittingTaskId(null);
      setScreenshots(["", "", "", ""]);
    }
  };

  return (
    <div className="space-y-6" id="active-tasks-container">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div>
          <h2 className="text-base font-bold text-slate-900">আমার একটিভ টাস্কসমূহ (Active Tasks)</h2>
          <p className="text-xs text-slate-500">আপনার গৃহীত ও চলমান কাজসমূহের তালিকা এখানে দেখুন এবং প্রুফ জমা দিন।</p>
        </div>
        <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-full font-mono">
          মোট কাজ: {activeTasks.length} টি
        </span>
      </div>

      {activeTasks.length === 0 ? (
        <div className="bg-slate-50 border border-dashed border-slate-200 rounded-3xl p-12 text-center text-slate-500">
          <CheckSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-medium">বর্তমানে কোনো সচল কাজ বা টাস্ক নেই।</p>
          <p className="text-xs text-slate-400 mt-1">নতুন কাজ গ্রহণ করতে 'সকল অফার (Task Feed)' ট্যাবে যান।</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {activeTasks.map((task) => {
            const isSubmittingThis = submittingTaskId === task.id;

            return (
              <div 
                key={task.id}
                className="bg-white rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all overflow-hidden"
              >
                {/* Header info */}
                <div className="bg-slate-50 p-6 border-b border-slate-100">
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                    <span className="text-[10px] bg-indigo-100 text-indigo-800 font-bold px-2.5 py-0.5 rounded uppercase font-mono tracking-wider">
                      {task.cpaNetwork} Offer
                    </span>
                    <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${
                      task.status === "Resubmission Requested"
                        ? "bg-amber-100 text-amber-800 border border-amber-200"
                        : "bg-blue-100 text-blue-800 border border-blue-200"
                    }`}>
                      {task.status === "Resubmission Requested" ? "সংশোধন অনুরোধ (Resubmission)" : "চলমান (Accepted)"}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-950 mb-1">{task.jobTitle}</h3>
                  <p className="text-xs text-slate-400">
                    কাজটি নিয়েছেন: <strong>{new Date(task.createdAt).toLocaleString("bn-BD")}</strong>
                  </p>
                </div>

                {/* Resubmission requested feedback alert */}
                {task.status === "Resubmission Requested" && task.rejectionReason && (
                  <div className="bg-amber-50 border-b border-amber-100 p-5 text-amber-900 text-xs sm:text-sm flex gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-amber-800 font-bold block mb-1">কাজ সংশোধন ফিডব্যাক (Owner Feedback):</strong>
                      <p className="text-amber-700 bg-white border border-amber-200 p-3.5 rounded-xl font-medium leading-relaxed">
                        {task.rejectionReason}
                      </p>
                      <span className="text-[10px] text-amber-500 block mt-2">
                        ⚠️ অনুগ্রহ করে উপরের নির্দেশনা মেনে ৪টি নতুন সঠিক স্ক্রিনশট আপলোড করে পুনরায় সাবমিট করুন।
                      </span>
                    </div>
                  </div>
                )}

                {/* Offer detail & Copy block */}
                <div className="p-6 space-y-4">
                  <div className="bg-emerald-50/60 border border-emerald-100/80 rounded-2xl p-4.5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-950 flex items-center gap-1">
                        <ExternalLink className="w-4 h-4 text-emerald-600" />
                        <span>সিপিএ অফার লিংক (CPA Link)</span>
                      </span>
                      <span className="text-[10px] text-emerald-700 bg-white px-2.5 py-0.5 rounded border border-emerald-100 font-mono">
                        Secure Redirect
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="bg-white border border-emerald-200 rounded-xl px-4 py-2.5 font-mono text-[11px] text-slate-600 break-all select-all flex-1 shadow-inner">
                        {task.affiliateLink}
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => handleCopyLink(task.affiliateLink, task.id)}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1 shadow-sm transition-all cursor-pointer"
                        >
                          {copiedId === task.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedId === task.id ? "অনুলিপি করা হয়েছে" : "Copy Link"}</span>
                        </button>
                        <a
                          href={task.affiliateLink}
                          target="_blank"
                          rel="noopener noreferrer referrer"
                          className="bg-slate-900 hover:bg-slate-800 text-white font-bold p-2.5 rounded-xl text-xs flex items-center justify-center transition-all shadow-sm"
                        >
                          <ArrowUpRight className="w-5 h-5" />
                        </a>
                      </div>
                    </div>
                  </div>

                  {!isSubmittingThis ? (
                    <div className="flex justify-end pt-2">
                      <button
                        onClick={() => {
                          setSubmittingTaskId(task.id);
                          setScreenshots(task.screenshots && task.screenshots.length === 4 ? [...task.screenshots] : ["", "", "", ""]);
                        }}
                        className="bg-slate-950 hover:bg-slate-850 text-white font-bold py-2.5 px-6 rounded-xl text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                      >
                        <Upload className="w-4 h-4" />
                        <span>প্রুফ জমা দিন (Submit Proofs)</span>
                      </button>
                    </div>
                  ) : (
                    // SCREENSHOTS UPLOAD MODULE
                    <div className="border-t border-slate-100 pt-6 space-y-6">
                      <div className="flex items-center justify-between bg-slate-50 px-4 py-3.5 rounded-xl border border-slate-150">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5">
                          <Upload className="w-4 h-4 text-emerald-600" />
                          <span>প্রুফ স্ক্রিনশট আপলোড প্যানেল</span>
                        </h4>
                        <button
                          onClick={() => setSubmittingTaskId(null)}
                          className="text-slate-400 hover:text-slate-600 text-xs font-semibold cursor-pointer"
                        >
                          বন্ধ করুন
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {bengaliInstructions.map((inst, index) => {
                          const uploadedData = screenshots[index];

                          return (
                            <div 
                              key={index}
                              className="bg-slate-50/55 border border-slate-200 rounded-2xl p-4.5 flex flex-col space-y-3.5"
                            >
                              <div className="space-y-1">
                                <span className="text-[10px] font-bold bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-mono uppercase tracking-wider">
                                  Screenshot {index + 1}
                                </span>
                                <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                                  {inst}
                                </p>
                              </div>

                              {uploadedData ? (
                                <div className="relative border border-slate-250 rounded-xl overflow-hidden bg-white group h-40">
                                  <img 
                                    src={uploadedData} 
                                    alt={`Proof Screenshot ${index + 1}`}
                                    className="w-full h-full object-contain bg-slate-100"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveScreenshot(index)}
                                    className="absolute top-2.5 right-2.5 bg-red-600 hover:bg-red-500 text-white p-1.5 rounded-full transition-colors cursor-pointer shadow-md"
                                    title="Remove Image"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ) : (
                                <div
                                  onDragOver={handleDragOver}
                                  onDrop={(e) => handleDrop(e, index)}
                                  onClick={() => fileInputRefs[index].current?.click()}
                                  className="border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-white rounded-xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center h-40 space-y-2 group"
                                >
                                  <Upload className="w-8 h-8 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                                  <div>
                                    <span className="text-xs text-slate-600 font-bold block">
                                      ক্লিক অথবা ড্র্যাগ-অ্যান্ড-ড্রপ করুন
                                    </span>
                                    <span className="text-[10px] text-slate-400 block mt-0.5">
                                      PNG, JPG বা JPEG ফরম্যাট
                                    </span>
                                  </div>
                                  <input 
                                    type="file"
                                    ref={fileInputRefs[index]}
                                    onChange={(e) => handleFileChange(e, index)}
                                    className="hidden"
                                    accept="image/*"
                                  />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between border-t border-slate-100 pt-5">
                        <span className="text-[11px] text-slate-400 leading-normal flex items-center gap-1">
                          ⚠️ সঠিক কাজ প্রমাণে ব্যর্থ হলে এক্সচেঞ্জ পয়েন্ট বাতিল হবে।
                        </span>
                        
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setSubmittingTaskId(null)}
                            className="bg-slate-100 hover:bg-slate-200 border border-slate-250 text-slate-700 font-bold py-2 px-5 rounded-xl text-xs cursor-pointer"
                          >
                            বাতিল
                          </button>
                          <button
                            type="button"
                            disabled={screenshots.some(s => !s) || uploadingIndex !== null}
                            onClick={() => handleSubmit(task.id)}
                            className={`font-bold py-2 px-6 rounded-xl text-xs transition-all cursor-pointer flex items-center gap-1 ${
                              screenshots.some(s => !s)
                                ? "bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300"
                                : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm"
                            }`}
                          >
                            {uploadingIndex === 999 ? (
                              <span>জমা হচ্ছে...</span>
                            ) : (
                              <>
                                <CheckSquare className="w-4 h-4" />
                                <span>প্রুফ জমা দিন (Submit Now)</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
