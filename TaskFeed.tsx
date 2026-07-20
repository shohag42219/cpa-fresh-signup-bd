import React, { useState } from "react";
import { Search, Filter, Smartphone, Globe, Compass, ExternalLink, Calendar, CheckSquare, Clock, Copy, Check, Users, ArrowUpRight, HelpCircle, X, AlertCircle } from "lucide-react";
import { Job } from "../types";

interface TaskFeedProps {
  jobs: Job[];
  currentUserId: string;
  onEditJob?: (job: Job) => void;
  onDeleteJob?: (jobId: string) => void;
  availableCpaNetworks: string[];
  onAcceptJobTask?: (jobId: string) => Promise<boolean>;
}

export default function TaskFeed({
  jobs,
  currentUserId,
  onEditJob,
  onDeleteJob,
  availableCpaNetworks,
  onAcceptJobTask
}: TaskFeedProps) {
  // Filters & Search State
  const [searchTerm, setSearchTerm] = useState("");
  const [networkFilter, setNetworkFilter] = useState("All");
  const [deviceFilter, setDeviceFilter] = useState("All");
  const [countryFilter, setCountryFilter] = useState("All");

  // Selected job for detail expansion modal
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Extract unique countries from jobs for the filter select
  const countries = ["All", ...Array.from(new Set(jobs.map((j) => j.country)))];

  const handleCopyLink = (link: string, id: string) => {
    navigator.clipboard.writeText(link);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filter & sort logic (Newest First)
  const filteredJobs = jobs
    .filter((job) => {
      // Show only active jobs in feed (paused or completed jobs can be managed in User's own jobs panel)
      const isActive = job.status === "Active";
      const matchesSearch =
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.cpaNetwork.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesNetwork = networkFilter === "All" || job.cpaNetwork === networkFilter;
      const matchesDevice = deviceFilter === "All" || job.deviceType === deviceFilter;
      const matchesCountry = countryFilter === "All" || job.country === countryFilter;

      return isActive && matchesSearch && matchesNetwork && matchesDevice && matchesCountry;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Formatter for relative time
  const getRelativeTime = (isoString: string) => {
    try {
      const diffMs = Date.now() - new Date(isoString).getTime();
      const diffMins = Math.round(diffMs / 60000);
      const diffHours = Math.round(diffMs / 3600000);
      const diffDays = Math.round(diffMs / 86400000);

      if (diffMins < 1) return "এইমাত্র";
      if (diffMins < 60) return `${diffMins} মিনিট আগে`;
      if (diffHours < 24) return `${diffHours} ঘণ্টা আগে`;
      return `${diffDays} দিন আগে`;
    } catch (e) {
      return "কিছুক্ষণ আগে";
    }
  };

  return (
    <div className="space-y-6" id="task-feed-container">
      
      {/* Search and Filters Header Widget */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4 shadow-inner">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
            <Filter className="w-4 h-4 text-emerald-600" />
            <span>অফার ফিল্টারিং ও সার্চ প্যানেল</span>
          </h4>
          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full font-mono">
            লাইভ অফার: {filteredJobs.length} টি
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          
          {/* Search Text input */}
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="টাইটেল, কি-ওয়ার্ড বা নেটওয়ার্ক সার্চ করুন..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-xs outline-none bg-white transition-all shadow-sm placeholder:text-slate-400"
            />
          </div>

          {/* Filter by CPA Network */}
          <div>
            <select
              value={networkFilter}
              onChange={(e) => setNetworkFilter(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 text-xs outline-none bg-white transition-all shadow-sm"
            >
              <option value="All">CPA নেটওয়ার্ক: All</option>
              {availableCpaNetworks.map((net) => (
                <option key={net} value={net}>
                  {net}
                </option>
              ))}
            </select>
          </div>

          {/* Filter by Device Requirement */}
          <div>
            <select
              value={deviceFilter}
              onChange={(e) => setDeviceFilter(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 text-xs outline-none bg-white transition-all shadow-sm"
            >
              <option value="All">ডিভাইস: All</option>
              <option value="All Devices">যেকোনো ডিভাইস</option>
              <option value="Android">Android</option>
              <option value="iPhone">iPhone</option>
              <option value="Desktop">Desktop</option>
            </select>
          </div>

        </div>

        <div className="flex items-center gap-2 pt-1 border-t border-slate-200/50">
          <span className="text-[10px] font-bold text-slate-400 uppercase">দেশ ফিল্টার:</span>
          <div className="flex flex-wrap gap-1.5">
            {countries.map((country) => (
              <button
                key={country}
                onClick={() => setCountryFilter(country)}
                className={`text-[10px] px-2.5 py-1 rounded-lg font-semibold border transition-all cursor-pointer ${
                  countryFilter === country
                    ? "bg-emerald-600 text-white border-emerald-600"
                    : "bg-white hover:bg-slate-100 text-slate-600 border-slate-200"
                }`}
              >
                {country === "All" ? "সকল দেশ" : country}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Task Feed Cards List */}
      {filteredJobs.length === 0 ? (
        <div className="text-center py-16 bg-white border border-dashed border-slate-200 rounded-2xl text-slate-400 space-y-3">
          <Compass className="w-12 h-12 text-slate-300 mx-auto stroke-[1.2]" />
          <div className="space-y-1">
            <p className="text-sm font-bold text-slate-600">কোনো একটিভ অফার পাওয়া যায়নি</p>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              আপনার ফিল্টারের সাথে মিলে এমন কোনো একটিভ CPA সাইন-আপ এক্সচেঞ্জ কাজ এই মুহূর্তে নেই। দয়া করে অন্য ফিল্টার সিলেক্ট করে চেষ্টা করুন।
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredJobs.map((job) => {
            const isOwner = job.userId === currentUserId;
            return (
              <div
                key={job.id}
                className="bg-white border border-slate-200/90 rounded-2xl p-5 hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between group relative"
                id={`job-card-${job.id}`}
              >
                {/* Top Badge Indicators */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5">
                    <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-md border border-emerald-100 uppercase">
                      {job.cpaNetwork}
                    </span>
                    <span className="bg-slate-50 text-slate-600 text-[10px] font-medium px-2 py-0.5 rounded border border-slate-150 flex items-center gap-0.5">
                      <Globe className="w-3 h-3" />
                      {job.country}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {getRelativeTime(job.createdAt)}
                  </span>
                </div>

                {/* Offer Title & Info */}
                <div className="space-y-1.5 flex-1">
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors leading-snug">
                    {job.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {job.description}
                  </p>
                </div>

                {/* Requirements Detail Chips */}
                <div className="grid grid-cols-2 gap-2 my-4 bg-slate-50 p-2.5 rounded-xl border border-slate-150 text-[11px] text-slate-600">
                  <div className="flex items-center gap-1">
                    <Smartphone className="w-3.5 h-3.5 text-slate-400" />
                    <span>ডিভাইস: <strong className="text-slate-800">{job.deviceType}</strong></span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Compass className="w-3.5 h-3.5 text-slate-400" />
                    <span>ব্রাউজার: <strong className="text-slate-800">{job.browser}</strong></span>
                  </div>
                </div>

                {/* Posted By & Slots Tracker */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">পোস্ট করেছেন</span>
                    <span className="font-semibold text-slate-800 flex items-center gap-1">
                      {job.username}
                      {isOwner && (
                        <span className="text-[8px] bg-slate-200 text-slate-700 px-1 py-0.2 rounded font-bold">আমার নিজের</span>
                      )}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">অবশিষ্ট স্লট</span>
                    <span className="font-bold font-mono text-slate-900 flex items-center gap-1 justify-end">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-emerald-600">{job.remainingSlots}</span>/{job.slotsLimit}
                    </span>
                  </div>
                </div>

                {/* CTA Active Buttons */}
                <div className="mt-4 flex items-center gap-2">
                  <button
                    onClick={() => setSelectedJob(job)}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 rounded-xl transition-all text-xs flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>কাজ করুন (Start Task)</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>

                  {isOwner && (
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => onEditJob && onEditJob(job)}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold p-2 rounded-xl border border-slate-200 transition-all text-xs cursor-pointer"
                        title="Edit Offer"
                      >
                        এডিট
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Task Execution Instructions Overlay Modal */}
      {selectedJob && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="bg-[#006a4e] text-white p-6 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[9px] bg-[#f42a41] text-white px-2 py-0.5 rounded font-bold uppercase tracking-wider font-mono">
                  {selectedJob.cpaNetwork} LEAD EXCHANGE
                </span>
                <h3 className="text-lg font-bold tracking-tight leading-snug">{selectedJob.title}</h3>
              </div>
              <button
                onClick={() => setSelectedJob(null)}
                className="bg-white/10 hover:bg-white/25 text-white p-2 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs sm:text-sm text-slate-600">
              
              {/* Device and Location constraints warnings */}
              <div className="grid grid-cols-3 gap-2.5 bg-slate-50 p-4 rounded-2xl border border-slate-150">
                <div className="space-y-1">
                  <span className="text-[9px] text-slate-400 block uppercase font-bold">ডিভাইস রিকোয়ারমেন্ট</span>
                  <strong className="text-slate-800 text-xs flex items-center gap-1">
                    <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                    {selectedJob.deviceType}
                  </strong>
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] text-slate-400 block uppercase font-bold">ব্রাউজার</span>
                  <strong className="text-slate-800 text-xs flex items-center gap-1">
                    <Compass className="w-3.5 h-3.5 text-emerald-600" />
                    {selectedJob.browser}
                  </strong>
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] text-slate-400 block uppercase font-bold">টার্গেট কান্ট্রি</span>
                  <strong className="text-slate-800 text-xs flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5 text-emerald-600" />
                    {selectedJob.country}
                  </strong>
                </div>
              </div>

              {/* Offer Link Card with copy block */}
              <div className="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-950 flex items-center gap-1">
                    <ExternalLink className="w-4 h-4 text-emerald-600" />
                    <span>সিপিএ অফার লিংক (CPA Link)</span>
                  </span>
                  <span className="text-[10px] text-emerald-700 bg-white border border-emerald-200/60 px-2 py-0.5 rounded font-mono font-medium">
                    RLS Checked
                  </span>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="bg-white border border-emerald-200 rounded-xl px-4 py-2.5 font-mono text-[11px] text-slate-600 break-all select-all flex-1 shadow-inner">
                    {selectedJob.affiliateLink}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => handleCopyLink(selectedJob.affiliateLink, selectedJob.id)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1 shadow-sm transition-all cursor-pointer"
                    >
                      {copiedId === selectedJob.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedId === selectedJob.id ? "অনুলিপি করা হয়েছে" : "Copy Link"}</span>
                    </button>
                    <a
                      href={selectedJob.affiliateLink}
                      target="_blank"
                      rel="noopener noreferrer referrer"
                      className="bg-slate-900 hover:bg-slate-800 text-white font-bold p-2.5 rounded-xl text-xs flex items-center justify-center transition-all shadow-sm"
                      title="Visit Link"
                    >
                      <ArrowUpRight className="w-5 h-5" />
                    </a>
                  </div>
                </div>
                <p className="text-[10px] text-emerald-800 leading-relaxed">
                  ⚠️ <strong>সতর্কতা:</strong> প্রক্সি বা ভিপিএন অন করে লিংকে প্রবেশ করবেন না। অন্যথা অ্যাকাউন্ট এবং এক্সচেঞ্জ পয়েন্ট বাতিল করা হবে।
                </p>
              </div>

              {/* Short description & instructions */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <h4 className="font-bold text-slate-900 flex items-center gap-1 text-xs uppercase tracking-wider text-slate-400">
                    <HelpCircle className="w-4 h-4 text-emerald-600" /> কাজটির বিবরণ (Job Description):
                  </h4>
                  <p className="bg-slate-50 p-4 rounded-xl border border-slate-150 text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {selectedJob.description}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <h4 className="font-bold text-slate-900 flex items-center gap-1 text-xs uppercase tracking-wider text-slate-400">
                    <CheckSquare className="w-4 h-4 text-[#f42a41]" /> গুরুত্বপূর্ণ কাজের ধাপসমূহ (Instructions):
                  </h4>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 text-slate-700 leading-relaxed whitespace-pre-wrap font-medium">
                    {selectedJob.instructions}
                  </div>
                </div>
              </div>

              {/* Step 3 Preview Info */}
              <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4 text-amber-900 text-xs leading-relaxed flex items-start gap-2.5">
                <AlertCircle className="w-4.5 h-4.5 text-amber-600 mt-0.5 shrink-0" />
                <div>
                  <strong>প্রুফ সাবমিট করার নির্দেশনা (Step 3 Preview):</strong>
                  <p className="mt-1 text-amber-800">
                    কাজটি সঠিকভাবে সম্পন্ন করার পর সাকসেস স্ক্রিনশট সংগ্রহ করে রাখুন। আগামী **Step 3 (Proof Submission)** মডিউল অবমুক্ত হলে আপনি সেখানে আপনার প্রুফ আপলোড করে আপনার পয়েন্ট দাবী করতে পারবেন।
                  </p>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 p-4 border-t border-slate-150 flex items-center justify-between text-xs gap-3">
              <span className="text-slate-400 font-medium">
                পোস্ট করেছেন: <strong className="text-slate-700 font-semibold">{selectedJob.username}</strong>
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedJob(null)}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-2 px-4 rounded-xl shadow-sm transition-all cursor-pointer"
                >
                  বন্ধ করুন
                </button>
                {selectedJob.userId !== currentUserId && onAcceptJobTask ? (
                  <button
                    onClick={async () => {
                      const ok = await onAcceptJobTask(selectedJob.id);
                      if (ok) {
                        setSelectedJob(null);
                      }
                    }}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-5 rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <CheckSquare className="w-4 h-4" />
                    <span>কাজটি গ্রহণ করুন (Accept Task)</span>
                  </button>
                ) : selectedJob.userId === currentUserId ? (
                  <span className="text-amber-600 font-bold bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200 text-xs flex items-center">
                    নিজের কাজ
                  </span>
                ) : null}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
