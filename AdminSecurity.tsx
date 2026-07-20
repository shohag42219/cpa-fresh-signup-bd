import React, { useState, useEffect } from "react";
import { ShieldCheck, Lock, Users, Terminal, Clipboard, Check, RefreshCw } from "lucide-react";
import { AuditLog } from "../types";
import SupabaseConsole from "./SupabaseConsole";

export default function AdminSecurity() {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("cpa_user_id");
      const res = await fetch("/api/admin/audit-logs", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAuditLogs(data.auditLogs || []);
      } else {
        setError(data.error || "অডিট লগ লোড করতে ব্যর্থ হয়েছে।");
      }
    } catch (err) {
      setError("নেটওয়ার্ক সংযোগ ব্যর্থ হয়েছে।");
    } finally {
      setLoading(false);
    }
  };

  const sqlPolicies = `-- 1. Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE website_settings ENABLE ROW LEVEL SECURITY;

-- 2. User Policies
CREATE POLICY "Users can view their own profile" 
ON users FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON users FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Admins have unrestricted select" 
ON users FOR SELECT 
USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- 3. Jobs Policies
CREATE POLICY "Anyone approved can view jobs" 
ON jobs FOR SELECT 
USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND status = 'Approved'));

CREATE POLICY "Approved users can insert jobs" 
ON jobs FOR INSERT 
WITH CHECK (auth.uid() = user_id AND EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND status = 'Approved'));

CREATE POLICY "Owners and admins can edit/delete jobs" 
ON jobs FOR ALL 
USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- 4. Transactions Policies
CREATE POLICY "Users can view their own transactions" 
ON transactions FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins have unrestricted access to transactions" 
ON transactions FOR ALL 
USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));`;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
      {/* Left Column: Security overview and copyable SQL console */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Supabase console with RLS copy-paste schema */}
        <div className="bg-slate-950 text-slate-100 rounded-2xl border border-slate-800 p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-850 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-emerald-400" /> সুপাবেস নিরাপত্তা কমান্ড ও RLS পলিসি
            </h3>
            <button
              onClick={() => copyToClipboard(sqlPolicies, "rls-sql")}
              className="px-3 py-1 bg-slate-900 border border-slate-800 hover:bg-slate-850 text-[10px] text-slate-300 font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer"
            >
              {copiedId === "rls-sql" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Clipboard className="w-3.5 h-3.5" />}
              <span>{copiedId === "rls-sql" ? "Copied SQL!" : "Copy Policies"}</span>
            </button>
          </div>

          <p className="text-slate-400 leading-relaxed text-[11px]">
            নিচের SQL কোয়েরি কপি করে সরাসরি Supabase SQL Editor এ রান করুন। এটি Row Level Security (RLS) সক্রিয় করবে এবং মেম্বার ও এডমিনদের জন্য সঠিক পলিসি নির্ধারণ করবে।
          </p>

          <pre className="bg-slate-900 border border-slate-850 p-4 rounded-xl font-mono text-[10px] text-emerald-400 max-h-72 overflow-y-auto leading-relaxed shadow-inner">
            {sqlPolicies}
          </pre>
        </div>

        {/* Existing Supabase console components or schema diagram */}
        <SupabaseConsole />
      </div>

      {/* Right Column: Live Admin Audit Logs */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/85 p-5 space-y-5 flex flex-col h-fit">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" /> অ্যাডমিন অডিট ট্রেইল (Audit Trails)
          </h3>
          <button
            onClick={fetchAuditLogs}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-950 transition-colors"
            title="Reload Logs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        <p className="text-slate-400 leading-relaxed text-[10px] bg-slate-50 p-3 rounded-lg border border-slate-150">
          সিকিউরিটি রুলস অনুযায়ী প্রতিটি সেনসিটিভ অ্যাডমিন অ্যাকশন (ইউজার স্ট্যাটাস এডিট, পাসওয়ার্ড রিসেট লিংক জেনারেট এবং সেটিংস পরিবর্তন) এখানে রিয়েল-টাইম লগ হয়ে থাকে।
        </p>

        {loading ? (
          <div className="p-8 text-center text-slate-400 space-y-2">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto text-emerald-600" />
            <p className="text-[10px] font-medium">অডিট লগ লোড হচ্ছে...</p>
          </div>
        ) : error ? (
          <p className="text-rose-500 text-center font-bold p-4">{error}</p>
        ) : auditLogs.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-1">
            <Lock className="w-8 h-8 mx-auto text-slate-300 stroke-[1.2]" />
            <p className="font-bold text-[11px]">কোনো লগ হিস্টরি নেই</p>
            <p className="text-[9px] text-slate-400 leading-relaxed">কোনো মডারেটর বা এডমিন কার্যকলাপ এখনো সম্পন্ন করেনি।</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
            {auditLogs.map((log) => (
              <div key={log.id} className="border border-slate-150 rounded-xl p-3.5 space-y-1 bg-slate-50/30 text-slate-600 hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] bg-slate-900 text-white font-bold px-1.5 py-0.2 rounded font-mono">
                    {log.action}
                  </span>
                  <span className="text-[9px] text-slate-400 font-mono">
                    {new Date(log.createdAt).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-[11px] font-semibold text-slate-900 leading-relaxed pt-1">{log.details}</p>
                <div className="text-[9px] text-slate-400 font-mono pt-1">
                  বাই: {log.adminName} (ID: {log.adminId})
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
