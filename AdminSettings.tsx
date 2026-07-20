import React, { useState, useEffect } from "react";
import { Settings, Shield, Plus, X, Save, AlertCircle, RefreshCw } from "lucide-react";
import { WebsiteSettings } from "../types";

interface AdminSettingsProps {
  onSaveSettings: (settings: WebsiteSettings) => Promise<void>;
}

export default function AdminSettings({ onSaveSettings }: AdminSettingsProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [websiteName, setWebsiteName] = useState("CPA Fresh Sign-up BD");
  const [logo, setLogo] = useState("");
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [defaultCooldownTime, setDefaultCooldownTime] = useState(24);
  const [defaultSurfingBalanceReward, setDefaultSurfingBalanceReward] = useState(1);
  const [supportedCpaNetworks, setSupportedCpaNetworks] = useState<string[]>([]);
  const [newNetwork, setNewNetwork] = useState("");
  const [homepageBannerText, setHomepageBannerText] = useState("");
  const [contactEmail, setContactEmail] = useState("");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch("/api/admin/website-settings");
      const data = await res.json();
      if (res.ok && data.success && data.websiteSettings) {
        const s = data.websiteSettings;
        setWebsiteName(s.websiteName);
        setLogo(s.logo || "");
        setMaintenanceMode(s.maintenanceMode || false);
        setDefaultCooldownTime(s.defaultCooldownTime || 24);
        setDefaultSurfingBalanceReward(s.defaultSurfingBalanceReward || 1);
        setSupportedCpaNetworks(s.supportedCpaNetworks || []);
        setHomepageBannerText(s.homepageBannerText || "");
        setContactEmail(s.contactEmail || "");
      } else {
        setError("ওয়েবসাইট সেটিংস লোড করতে ব্যর্থ হয়েছে।");
      }
    } catch (err) {
      setError("নেটওয়ার্ক সংযোগ ব্যর্থ হয়েছে।");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError("");
      setSuccessMsg("");

      const updated: WebsiteSettings = {
        websiteName,
        logo,
        maintenanceMode,
        defaultCooldownTime: Number(defaultCooldownTime),
        defaultSurfingBalanceReward: Number(defaultSurfingBalanceReward),
        supportedCpaNetworks,
        homepageBannerText,
        contactEmail
      };

      const token = localStorage.getItem("cpa_user_id");
      const res = await fetch("/api/admin/website-settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updated)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg("ওয়েবসাইট সেটিংস সফলভাবে সেভ করা হয়েছে এবং অ্যাডমিন অডিট ট্রেইলে লগ করা হয়েছে!");
      } else {
        setError(data.error || "সেভ করতে ব্যর্থ হয়েছে।");
      }
    } catch (err) {
      setError("নেটওয়ার্ক সমস্যার কারণে সেভ করা সম্ভব হয়নি।");
    } finally {
      setSaving(false);
    }
  };

  const handleAddNetwork = () => {
    if (!newNetwork.trim()) return;
    if (supportedCpaNetworks.includes(newNetwork.trim())) return;
    setSupportedCpaNetworks([...supportedCpaNetworks, newNetwork.trim()]);
    setNewNetwork("");
  };

  const handleRemoveNetwork = (net: string) => {
    setSupportedCpaNetworks(supportedCpaNetworks.filter(n => n !== net));
  };

  if (loading) {
    return (
      <div className="p-16 text-center text-slate-400 space-y-2">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto text-emerald-600" />
        <p className="text-xs font-medium">ওয়েবসাইট কনফিগারেশন লোড হচ্ছে...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/85 p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
          <Settings className="w-4 h-4 text-emerald-600" /> ওয়েবসাইট সিস্টেম কনফিগারেশন (Website Settings)
        </h3>
        <span className="text-[10px] bg-red-50 text-red-700 font-bold px-2 py-0.5 rounded border border-red-100 uppercase">
          SYSTEM PREFERENCE
        </span>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-150 p-4 rounded-xl text-rose-600 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-150 p-4 rounded-xl text-emerald-700 text-xs font-semibold flex items-center gap-2">
          <Save className="w-4 h-4 flex-shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-5 text-xs font-semibold text-slate-700">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Website Name */}
          <div className="space-y-1">
            <label className="text-[10px] text-slate-400 font-bold block uppercase">ওয়েবসাইটের নাম (Website Name)</label>
            <input
              type="text"
              value={websiteName}
              onChange={(e) => setWebsiteName(e.target.value)}
              className="w-full p-2.5 border border-slate-200 rounded-xl focus:border-emerald-500 font-medium"
              required
            />
          </div>

          {/* Logo Input */}
          <div className="space-y-1">
            <label className="text-[10px] text-slate-400 font-bold block uppercase">লোগো বা ব্রান্ড ইমেজ URL (Logo URL)</label>
            <input
              type="text"
              placeholder="https://..."
              value={logo}
              onChange={(e) => setLogo(e.target.value)}
              className="w-full p-2.5 border border-slate-200 rounded-xl focus:border-emerald-500 font-mono"
            />
          </div>

          {/* Default Cooldown Time */}
          <div className="space-y-1">
            <label className="text-[10px] text-slate-400 font-bold block uppercase">ডিফল্ট কুলডাউন সময় (Default Cooldown - Hours)</label>
            <input
              type="number"
              value={defaultCooldownTime}
              onChange={(e) => setDefaultCooldownTime(Number(e.target.value))}
              className="w-full p-2.5 border border-slate-200 rounded-xl focus:border-emerald-500 font-mono"
              min="0"
              required
            />
          </div>

          {/* Default Reward points */}
          <div className="space-y-1">
            <label className="text-[10px] text-slate-400 font-bold block uppercase">ডিফল্ট টাস্ক রিওয়ার্ড পয়েন্ট (Default Reward - Points)</label>
            <input
              type="number"
              value={defaultSurfingBalanceReward}
              onChange={(e) => setDefaultSurfingBalanceReward(Number(e.target.value))}
              className="w-full p-2.5 border border-slate-200 rounded-xl focus:border-emerald-500 font-mono"
              min="0"
              required
            />
          </div>

          {/* Homepage Banner text */}
          <div className="col-span-1 md:col-span-2 space-y-1">
            <label className="text-[10px] text-slate-400 font-bold block uppercase">হোমপেজ ব্যানার স্লোগান টেক্সট (Homepage Banner Text)</label>
            <input
              type="text"
              value={homepageBannerText}
              onChange={(e) => setHomepageBannerText(e.target.value)}
              className="w-full p-2.5 border border-slate-200 rounded-xl focus:border-emerald-500 font-medium"
              required
            />
          </div>

          {/* Contact Support Email */}
          <div className="space-y-1">
            <label className="text-[10px] text-slate-400 font-bold block uppercase">সাপোর্ট বা কন্টাক্ট ইমেইল (Contact Email)</label>
            <input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className="w-full p-2.5 border border-slate-200 rounded-xl focus:border-emerald-500 font-mono"
              required
            />
          </div>

          {/* Maintenance mode toggle switch */}
          <div className="space-y-1 flex flex-col justify-center">
            <label className="text-[10px] text-slate-400 font-bold block uppercase">মেইনটেন্যান্স মোড (Maintenance Mode)</label>
            <div className="flex items-center gap-3 mt-2">
              <input
                type="checkbox"
                id="mMode"
                checked={maintenanceMode}
                onChange={(e) => setMaintenanceMode(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded border-slate-200 focus:ring-emerald-500 cursor-pointer"
              />
              <label htmlFor="mMode" className="cursor-pointer text-slate-600 text-xs font-bold select-none">
                {maintenanceMode ? "🔴 মেইনটেন্যান্স মোড সক্রিয় (সিস্টেম অফলাইন থাকবে)" : "🟢 সিস্টেম সক্রিয় এবং অনলাইন রয়েছে"}
              </label>
            </div>
          </div>
        </div>

        {/* CPA Networks manager */}
        <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50 space-y-3">
          <label className="text-[10px] text-slate-400 font-bold block uppercase">সমর্থিত CPA নেটওয়ার্কসমূহ (Supported CPA Networks)</label>
          <div className="flex flex-wrap gap-1.5 min-h-[40px] bg-white border border-slate-200 p-2.5 rounded-xl">
            {supportedCpaNetworks.length === 0 ? (
              <span className="text-[10px] text-slate-400">কোনো নেটওয়ার্ক যুক্ত নেই।</span>
            ) : (
              supportedCpaNetworks.map((net, idx) => (
                <span key={idx} className="bg-slate-900 text-white px-2.5 py-1 rounded-lg flex items-center gap-1.5 font-semibold text-[11px]">
                  <span>{net}</span>
                  <button type="button" onClick={() => handleRemoveNetwork(net)} className="text-red-400 hover:text-red-300 font-bold">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))
            )}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="নতুন CPA নেটওয়ার্ক নাম..."
              value={newNetwork}
              onChange={(e) => setNewNetwork(e.target.value)}
              className="p-2 border border-slate-200 rounded-xl text-xs flex-1 bg-white focus:outline-none"
            />
            <button
              type="button"
              onClick={handleAddNetwork}
              className="bg-slate-900 hover:bg-slate-800 text-white px-4 rounded-xl font-bold flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>যোগ করুন</span>
            </button>
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-6 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>ওয়েবসাইট কনফিগারেশন সেভ করুন</span>
          </button>
        </div>
      </form>
    </div>
  );
}
