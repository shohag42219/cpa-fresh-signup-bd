import React, { useEffect, useState } from "react";
import { Mail, X, Trash2, ExternalLink, Inbox, RefreshCw, AlertCircle } from "lucide-react";
import { SimulatedEmail } from "../types";

interface MailboxProps {
  onVerifySuccess: (token: string) => void;
  onResetSuccess: (token: string) => void;
}

export default function Mailbox({ onVerifySuccess, onResetSuccess }: MailboxProps) {
  const [emails, setEmails] = useState<SimulatedEmail[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeEmail, setActiveEmail] = useState<SimulatedEmail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [badgeCount, setBadgeCount] = useState(0);

  const fetchEmails = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/simulated/emails");
      if (response.ok) {
        const data = await response.json();
        setEmails(data.emails);
        setBadgeCount(data.emails.length);
      }
    } catch (err) {
      console.error("Error fetching simulated emails:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const clearEmails = async () => {
    try {
      await fetch("/api/simulated/clear-emails");
      setEmails([]);
      setBadgeCount(0);
      setActiveEmail(null);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchEmails();
    // Poll for new emails every 4 seconds so verification codes pop up instantly
    const interval = setInterval(fetchEmails, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleLinkClick = async (email: SimulatedEmail) => {
    // Determine link action
    if (email.link.includes("verify-email")) {
      const urlParams = new URLSearchParams(email.link.split("?")[1]);
      const token = urlParams.get("token");
      if (token) {
        onVerifySuccess(token);
        setIsOpen(false);
      }
    } else if (email.link.includes("reset-password")) {
      const urlParams = new URLSearchParams(email.link.split("?")[1]);
      const token = urlParams.get("token");
      if (token) {
        onResetSuccess(token);
        setIsOpen(false);
      }
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans" id="mailbox-simulator">
      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative bg-red-600 hover:bg-red-700 text-white p-4 rounded-full shadow-2xl flex items-center justify-center transition-transform hover:scale-110 border-2 border-white/20 active:scale-95 cursor-pointer"
        title="Open Simulated Mailbox"
        id="mailbox-toggle-btn"
      >
        <Mail className="w-6 h-6" />
        {badgeCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-white text-red-600 text-[11px] font-bold px-2 py-0.5 rounded-full border-2 border-red-600 animate-bounce">
            {badgeCount}
          </span>
        )}
      </button>

      {/* Mailbox Drawer Panel */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-96 max-w-[calc(100vw-2rem)] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[500px]" id="mailbox-drawer">
          {/* Header */}
          <div className="bg-slate-950 p-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-red-950 rounded text-red-500">
                <Inbox className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">ভার্চুয়াল জিমেইল ইনবক্স</h3>
                <p className="text-[10px] text-slate-400">Supabase Auth ইমেইল সিমুলেটর</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={fetchEmails}
                className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded transition-colors"
                title="Refresh Inbox"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
              </button>
              <button
                onClick={clearEmails}
                className="p-1 hover:bg-slate-800 text-slate-400 hover:text-red-400 rounded transition-colors"
                title="Clear All Emails"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Email Content Details */}
          {activeEmail ? (
            <div className="flex-1 flex flex-col bg-slate-950 text-slate-200 overflow-y-auto" id="mailbox-detail">
              <div className="p-4 border-b border-slate-800 bg-slate-900 flex items-center justify-between">
                <button
                  onClick={() => setActiveEmail(null)}
                  className="text-xs text-red-400 hover:text-red-300 font-medium flex items-center gap-1"
                >
                  ← ইনবক্সে ফিরে যান
                </button>
                <span className="text-[10px] text-slate-500">
                  {new Date(activeEmail.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>
              <div className="p-4 space-y-4 flex-1">
                <div>
                  <div className="text-xs text-slate-400"><span className="font-semibold text-slate-300">To:</span> {activeEmail.to}</div>
                  <div className="text-sm font-bold text-white mt-1">{activeEmail.subject}</div>
                </div>
                <div className="text-xs text-slate-300 leading-relaxed bg-slate-900 p-3 rounded border border-slate-800/80 whitespace-pre-line">
                  {activeEmail.body}
                </div>
                <div className="pt-2">
                  <button
                    onClick={() => handleLinkClick(activeEmail)}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 shadow-lg hover:shadow-emerald-900/20 active:scale-98 transition-all cursor-pointer"
                  >
                    <span>ভেরিফিকেশন সম্পন্ন করুন</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Email List */
            <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60 bg-slate-900/60" id="mailbox-list">
              {emails.length === 0 ? (
                <div className="p-12 text-center flex flex-col items-center justify-center space-y-3">
                  <Mail className="w-10 h-10 text-slate-600 stroke-[1.5]" />
                  <div>
                    <p className="text-xs font-medium text-slate-300">ইনবক্স ফাকা রয়েছে</p>
                    <p className="text-[10px] text-slate-500 mt-1 max-w-[200px] mx-auto">
                      নতুন অ্যাকাউন্ট রেজিস্টার করুন বা পাসওয়ার্ড রিসেট করুন। ভেরিফিকেশন ইমেইলটি এখানে জমা হবে।
                    </p>
                  </div>
                </div>
              ) : (
                emails.map((email) => (
                  <div
                    key={email.id}
                    onClick={() => setActiveEmail(email)}
                    className="p-3.5 hover:bg-slate-850 cursor-pointer transition-colors flex items-start gap-3 group"
                  >
                    <div className="p-2 bg-red-950/40 rounded-full text-red-400 mt-0.5 group-hover:bg-red-950 transition-colors">
                      <Mail className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-slate-200 truncate pr-2">{email.to}</span>
                        <span className="text-[9px] text-slate-500 shrink-0">
                          {new Date(email.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-white truncate mt-0.5">{email.subject}</p>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">{email.body}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Footer Warning */}
          <div className="bg-slate-950 px-4 py-2 border-t border-slate-850 flex items-center gap-1.5 text-[10px] text-slate-500">
            <AlertCircle className="w-3 h-3 text-red-500 shrink-0" />
            <span>সুপাবেস ইমেইল ট্রিগারটি রানিং আছে। লিংকে ক্লিক করে ইউজার টেস্ট করুন।</span>
          </div>
        </div>
      )}
    </div>
  );
}
