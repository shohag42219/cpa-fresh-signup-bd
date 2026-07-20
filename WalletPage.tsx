import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Sparkles, ArrowUpRight, ArrowDownLeft, History, Search, Filter, AlertCircle, TrendingUp, Wallet } from "lucide-react";
import { Transaction } from "../types";

interface WalletPageProps {
  currentBalance: number;
}

export default function WalletPage({ currentBalance }: WalletPageProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"All" | "Earned" | "Spent">("All");

  useEffect(() => {
    fetchTransactions();
  }, [currentBalance]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("cpa_user_id");
      const res = await fetch("/api/transactions", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTransactions(data.transactions || []);
      } else {
        setError(data.error || "ট্রানজেকশন লোড করতে ব্যর্থ হয়েছে।");
      }
    } catch (err) {
      setError("নেটওয়ার্ক সংযোগে সমস্যা হচ্ছে। পুনরায় চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  };

  // Stats calculation
  const totalEarned = transactions
    .filter(tx => tx.type === "Earned" && tx.status === "Completed")
    .reduce((sum, tx) => sum + tx.points, 0);

  const totalSpent = transactions
    .filter(tx => tx.type === "Spent" && tx.status === "Completed")
    .reduce((sum, tx) => sum + tx.points, 0);

  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = tx.jobTitle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "All" || tx.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="space-y-6"
    >
      {/* Wallet Balance Hero Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Balance */}
        <div className="bg-emerald-600 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[160px] border border-emerald-500">
          <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-32 h-32 bg-emerald-500/30 rounded-full blur-2xl"></div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-100 flex items-center gap-1.5">
              <Wallet className="w-4 h-4" /> আমার সার্ফিং ব্যালেন্স
            </span>
            <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
          </div>
          <div>
            <span className="text-4xl font-extrabold font-mono tracking-tight">{currentBalance}</span>
            <span className="text-sm font-bold ml-1.5 text-emerald-100">পয়েন্ট</span>
          </div>
          <div className="text-[10px] text-emerald-100">
            রিয়েল-টাইম এক্সচেঞ্জে ব্যবহারযোগ্য পয়েন্ট
          </div>
        </div>

        {/* Card 2: Total Earned */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 flex flex-col justify-between min-h-[160px]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-500" /> মোট অর্জিত ব্যালেন্স
            </span>
            <div className="bg-emerald-50 p-2 rounded-xl text-emerald-600">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-bold text-slate-900 font-mono">{totalEarned}</span>
            <span className="text-xs font-bold ml-1 text-slate-500"> পয়েন্ট</span>
          </div>
          <div className="text-[10px] text-slate-500">
            টাস্ক সম্পূর্ণ করে প্রাপ্ত মোট পয়েন্ট বোনাস
          </div>
        </div>

        {/* Card 3: Total Spent */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 flex flex-col justify-between min-h-[160px]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-indigo-500 rotate-180" /> মোট ব্যয়িত ব্যালেন্স
            </span>
            <div className="bg-indigo-50 p-2 rounded-xl text-indigo-600">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-bold text-slate-900 font-mono">{totalSpent}</span>
            <span className="text-xs font-bold ml-1 text-slate-500"> পয়েন্ট</span>
          </div>
          <div className="text-[10px] text-slate-500">
            অন্যান্য কাজের জন্য ব্যয়িত পয়েন্ট
          </div>
        </div>
      </div>

      {/* Transaction History Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <History className="w-4 h-4 text-emerald-600" /> ট্রানজেকশন হিস্টরি (Transaction History)
          </h3>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search input */}
            <div className="relative">
              <input
                type="text"
                placeholder="অফারের নাম দিয়ে খুঁজুন..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:border-emerald-500 focus:outline-none w-full sm:w-48 bg-slate-50/50"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>

            {/* Filter buttons */}
            <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200">
              {(["All", "Earned", "Spent"] as const).map(type => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    filterType === type
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {type === "All" ? "সবগুলো" : type === "Earned" ? "প্রাপ্ত" : "ব্যয়িত"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content Box */}
        {loading ? (
          <div className="p-16 text-center text-slate-400 space-y-2">
            <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs font-medium">ট্রানজেকশন হিস্টরি লোড হচ্ছে...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center text-rose-500 space-y-2">
            <AlertCircle className="w-8 h-8 mx-auto stroke-[1.5]" />
            <p className="text-xs font-bold">{error}</p>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="p-16 text-center text-slate-400 space-y-2">
            <History className="w-10 h-10 mx-auto stroke-[1.2] text-slate-300" />
            <p className="text-xs font-bold">কোনো ট্রানজেকশন রেকর্ড পাওয়া যায়নি।</p>
            <p className="text-[10px] text-slate-400 max-w-sm mx-auto">অন্যদের CPA অফারে সফলভাবে জয়েন করুন এবং এডমিন অনুমোদন করার পর এখানে রিয়েল-টাইম হিস্টরি দেখতে পাবেন।</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="p-4">তারিখ ও সময়</th>
                  <th className="p-4">ধরণ (Type)</th>
                  <th className="p-4">বিবরণ / অফার নাম</th>
                  <th className="p-4">পয়েন্ট (Points)</th>
                  <th className="p-4">স্ট্যাটাস</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
                {filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 font-mono text-[10px] text-slate-400">
                      {new Date(tx.date).toLocaleString()}
                    </td>
                    <td className="p-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 w-fit ${
                        tx.type === "Earned" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-indigo-50 text-indigo-700 border border-indigo-100"
                      }`}>
                        {tx.type === "Earned" ? (
                          <>
                            <ArrowUpRight className="w-3 h-3" />
                            <span>আয় হয়েছে</span>
                          </>
                        ) : (
                          <>
                            <ArrowDownLeft className="w-3 h-3" />
                            <span>ব্যয় হয়েছে</span>
                          </>
                        )}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-slate-900">{tx.jobTitle}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">ID: {tx.id}</div>
                    </td>
                    <td className="p-4 font-mono font-bold text-slate-900">
                      {tx.type === "Earned" ? "+" : "-"}{tx.points} PT
                    </td>
                    <td className="p-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block ${
                        tx.status === "Completed" ? "bg-emerald-100 text-emerald-800" :
                        tx.status === "Pending" ? "bg-amber-100 text-amber-800 animate-pulse" :
                        "bg-slate-100 text-slate-500"
                      }`}>
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  );
}
