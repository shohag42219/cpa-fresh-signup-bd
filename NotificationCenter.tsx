import React from "react";
import { Bell, Check, Trash, CheckSquare, Clock, Calendar, X } from "lucide-react";
import { Notification } from "../types";

interface NotificationCenterProps {
  notifications: Notification[];
  onMarkRead: (notifId?: string) => void;
  onClose?: () => void;
}

export default function NotificationCenter({ notifications, onMarkRead, onClose }: NotificationCenterProps) {
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200 max-w-md w-full flex flex-col max-h-[500px]">
      
      {/* Header */}
      <div className="bg-slate-900 text-white p-4.5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Bell className="w-5 h-5 text-emerald-400" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-slate-900 animate-pulse"></span>
            )}
          </div>
          <span className="font-bold text-sm">বিজ্ঞপ্তি কেন্দ্র (Notifications)</span>
        </div>
        
        <div className="flex items-center gap-1.5">
          {unreadCount > 0 && (
            <button
              onClick={() => onMarkRead()}
              className="text-[10px] bg-white/10 hover:bg-white/20 text-emerald-300 font-bold py-1 px-2.5 rounded transition-colors cursor-pointer"
            >
              সব পড়ুন
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="text-white/60 hover:text-white p-1 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          )}
        </div>
      </div>

      {/* Body List */}
      <div className="overflow-y-auto divide-y divide-slate-100 flex-1">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs flex flex-col items-center justify-center space-y-2">
            <Bell className="w-8 h-8 text-slate-200" />
            <p>আপনার কোনো নতুন বিজ্ঞপ্তি বা নোটিফিকেশন নেই।</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div 
              key={notif.id}
              onClick={() => {
                if (!notif.read) {
                  onMarkRead(notif.id);
                }
              }}
              className={`p-4 text-xs transition-colors cursor-pointer flex gap-3 items-start hover:bg-slate-50 ${
                !notif.read ? "bg-emerald-50/25 border-l-2 border-emerald-600 font-medium" : ""
              }`}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" style={{ opacity: notif.read ? 0 : 1 }}></div>
              <div className="space-y-1 flex-1">
                <div className="flex items-center justify-between">
                  <strong className="text-slate-800 text-[11px] font-bold block">{notif.title}</strong>
                  <span className="text-[9px] text-slate-400 font-mono">
                    {new Date(notif.createdAt).toLocaleTimeString("bn-BD", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <p className="text-slate-600 leading-relaxed font-normal">{notif.message}</p>
                <span className="text-[9px] text-slate-400 block pt-0.5">
                  {new Date(notif.createdAt).toLocaleDateString("bn-BD")}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="bg-slate-50 p-3 text-center border-t border-slate-100 shrink-0">
        <span className="text-[10px] text-slate-400 font-medium">CPA Fresh Sign-up BD Notification Center</span>
      </div>

    </div>
  );
}
