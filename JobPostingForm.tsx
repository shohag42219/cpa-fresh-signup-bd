import React, { useState, useEffect } from "react";
import { PlusCircle, Save, X, Network, Globe, Smartphone, Compass, ListTodo, AlertCircle, Link2, Users } from "lucide-react";
import { Job, JobStatus } from "../types";

interface JobPostingFormProps {
  jobToEdit?: Job | null;
  onSave: (jobData: any) => Promise<void>;
  onCancel: () => void;
  availableCpaNetworks: string[];
}

export default function JobPostingForm({
  jobToEdit,
  onSave,
  onCancel,
  availableCpaNetworks
}: JobPostingFormProps) {
  const [title, setTitle] = useState("");
  const [affiliateLink, setAffiliateLink] = useState("");
  const [cpaNetwork, setCpaNetwork] = useState("");
  const [country, setCountry] = useState("Bangladesh");
  const [deviceType, setDeviceType] = useState<"Android" | "iPhone" | "Desktop" | "All Devices">("All Devices");
  const [browser, setBrowser] = useState("Chrome");
  const [description, setDescription] = useState("");
  const [instructions, setInstructions] = useState("");
  const [slotsLimit, setSlotsLimit] = useState(50);
  const [status, setStatus] = useState<JobStatus>("Active");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Bangladesh and popular countries
  const popularCountries = [
    "Bangladesh", "United States", "United Kingdom", "Canada", "Germany", "Saudi Arabia", "United Arab Emirates", "India", "Global"
  ];

  // Popular browsers
  const popularBrowsers = [
    "Chrome", "Safari", "Firefox", "Opera", "Microsoft Edge", "Any Browser"
  ];

  useEffect(() => {
    if (jobToEdit) {
      setTitle(jobToEdit.title);
      setAffiliateLink(jobToEdit.affiliateLink);
      setCpaNetwork(jobToEdit.cpaNetwork);
      setCountry(jobToEdit.country);
      setDeviceType(jobToEdit.deviceType);
      setBrowser(jobToEdit.browser);
      setDescription(jobToEdit.description);
      setInstructions(jobToEdit.instructions);
      setSlotsLimit(jobToEdit.slotsLimit);
      setStatus(jobToEdit.status);
    }
  }, [jobToEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title || !affiliateLink || !cpaNetwork || !country || !deviceType || !browser || !description || !instructions || !slotsLimit) {
      setError("সবগুলো ঘর অবশ্যই সঠিকভাবে পূরণ করতে হবে।");
      return;
    }

    if (!affiliateLink.startsWith("http://") && !affiliateLink.startsWith("https://")) {
      setError("সঠিক অফার লিংক প্রদান করুন (http:// বা https:// দিয়ে শুরু হতে হবে)।");
      return;
    }

    if (slotsLimit <= 0) {
      setError("Slots এর সংখ্যা কমপক্ষে ১ হতে হবে।");
      return;
    }

    setLoading(true);
    try {
      const jobData: any = {
        title,
        affiliateLink,
        cpaNetwork,
        country,
        deviceType,
        browser,
        description,
        instructions,
        slotsLimit
      };

      if (jobToEdit) {
        jobData.id = jobToEdit.id;
        jobData.status = status;
      }

      await onSave(jobData);
    } catch (err: any) {
      setError(err.message || "সংরক্ষণ করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-md space-y-6" id="job-form-container">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-emerald-600" />
            {jobToEdit ? "CPA অফার এডিট করুন" : "নতুন CPA অফার পোস্ট করুন"}
          </h3>
          <p className="text-xs text-slate-500">আপনার সিপিএ লিড এক্সচেঞ্জ অফারের তথ্যগুলো সঠিক ও নির্ভুলভাবে পূরণ করুন।</p>
        </div>
        <button
          onClick={onCancel}
          className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-lg transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-4 rounded-xl flex items-start gap-2.5">
          <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5 text-rose-600" />
          <div>
            <span className="font-semibold">ত্রুটি:</span> {error}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
        
        {/* Job Title */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
            অফার টাইটেল (Job Title) <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="উদাঃ CPAGrip Gmail Sign-up (Instant Approval)"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-xs outline-none transition-all placeholder:text-slate-400"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Affiliate Link */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
              সিপিএ অ্যাফিলিয়েট লিংক (CPA Affiliate Link) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Link2 className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input
                type="url"
                value={affiliateLink}
                onChange={(e) => setAffiliateLink(e.target.value)}
                placeholder="https://www.cpagrip.com/show.php?l=..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-xs outline-none transition-all placeholder:text-slate-400 font-mono"
                required
              />
            </div>
            <p className="text-[10px] text-slate-400">আপনার CPA প্যানেলের প্রোমোশনাল লিংকটি দিন।</p>
          </div>

          {/* CPA Network */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
              সিপিএ নেটওয়ার্কের নাম (CPA Network Name) <span className="text-red-500">*</span>
            </label>
            <select
              value={cpaNetwork}
              onChange={(e) => setCpaNetwork(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-xs outline-none transition-all bg-white"
              required
            >
              <option value="">নির্বাচন করুন</option>
              {availableCpaNetworks.map(net => (
                <option key={net} value={net}>{net}</option>
              ))}
              <option value="Other">Other Network</option>
            </select>
          </div>

        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          {/* Target Country */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
              টার্গেট দেশ (Country) <span className="text-red-500">*</span>
            </label>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-xs outline-none transition-all bg-white"
              required
            >
              {popularCountries.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Device Type */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
              ডিভাইসের ধরন (Device Type) <span className="text-red-500">*</span>
            </label>
            <select
              value={deviceType}
              onChange={(e) => setDeviceType(e.target.value as any)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-xs outline-none transition-all bg-white"
              required
            >
              <option value="All Devices">All Devices (যেকোনো ডিভাইস)</option>
              <option value="Android">Android Mobile Only</option>
              <option value="iPhone">iPhone / iOS Only</option>
              <option value="Desktop">Desktop / Laptop Only</option>
            </select>
          </div>

          {/* Browser Requirement */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
              ব্রাউজার রিকোয়ারমেন্ট <span className="text-red-500">*</span>
            </label>
            <select
              value={browser}
              onChange={(e) => setBrowser(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-xs outline-none transition-all bg-white"
              required
            >
              {popularBrowsers.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Slots Limit */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
              মোট স্লট বা কোটা (Total Slots Limit) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Users className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input
                type="number"
                value={slotsLimit}
                onChange={(e) => setSlotsLimit(Math.max(1, parseInt(e.target.value, 10) || 0))}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-xs outline-none transition-all font-bold font-mono"
                min={1}
                required
              />
            </div>
            <p className="text-[10px] text-slate-400">এই কাজটিতে আপনি সর্বোচ্চ কতজন মেম্বারকে জয়েন করাতে চান।</p>
          </div>

          {/* Status (Only when editing) */}
          {jobToEdit && (
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                কাজটির বর্তমান অবস্থা (Offer Status)
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as JobStatus)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-xs outline-none transition-all bg-white font-semibold text-slate-800"
              >
                <option value="Active">Active (সবাই কাজ করতে পারবে)</option>
                <option value="Paused">Paused (সাময়িকভাবে বন্ধ)</option>
                <option value="Completed">Completed (সম্পূর্ণ সমাপ্ত)</option>
              </select>
            </div>
          )}

        </div>

        {/* Short Description */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
            সংক্ষিপ্ত বিবরণ (Short Description) <span className="text-red-500">*</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="উদাঃ এটি একটি জিমেইল সাইন-আপ করার কাজ। জিমেইল দিয়ে রেজিস্ট্রেশন করে ৫ সেকেন্ড অপেক্ষা করতে হবে..."
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-xs outline-none transition-all placeholder:text-slate-400 h-20 resize-none"
            maxLength={250}
            required
          />
        </div>

        {/* Important Instructions */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
            গুরুত্বপূর্ণ নির্দেশনা (Important Instructions) <span className="text-red-500">*</span>
          </label>
          <textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="১. ভিপিএন অফ রাখতে হবে।&#10;২. রিয়েল জিমেইল অ্যাড্রেস ব্যবহার করতে হবে।&#10;৩. ব্রাউজারের হিস্ট্রি ক্লিয়ার করে কাজ শুরু করবেন।"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-xs outline-none transition-all placeholder:text-slate-400 h-28"
            required
          />
          <p className="text-[10px] text-slate-400">প্রতিটি স্টেপ সুন্দরভাবে সিরিয়াল নম্বর অনুযায়ী লিখুন যেন মেম্বাররা কোনো ভুল না করে।</p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold transition-all text-xs cursor-pointer"
          >
            বাতিল করুন
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 py-2.5 rounded-xl shadow-md transition-all text-xs flex items-center gap-1.5 cursor-pointer disabled:bg-slate-300 disabled:shadow-none"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? "সংরক্ষণ করা হচ্ছে..." : jobToEdit ? "আপডেট সংরক্ষণ করুন" : "অফার পাবলিশ করুন"}</span>
          </button>
        </div>

      </form>
    </div>
  );
}
