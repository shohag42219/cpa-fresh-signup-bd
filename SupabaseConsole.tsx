import React, { useState } from "react";
import { Terminal, Copy, Check, Database, ShieldAlert, KeyRound } from "lucide-react";

export default function SupabaseConsole() {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copyToClipboard = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const sqlSchema = `-- 1. Create a custom status enum for Bangladesh-based User Approval
CREATE TYPE user_status AS ENUM ('Pending', 'Approved', 'Rejected', 'Suspended', 'Banned');

-- 2. Create the profiles table linked to Supabase Auth.users
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  district TEXT NOT NULL,
  upazila_thana TEXT NOT NULL,
  village TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  cpa_networks TEXT[] NOT NULL DEFAULT '{}',
  status user_status NOT NULL DEFAULT 'Pending',
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create the jobs table for lead exchange offers
CREATE TABLE public.jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  affiliate_link TEXT NOT NULL,
  cpa_network TEXT NOT NULL,
  country TEXT NOT NULL,
  device_type TEXT NOT NULL CHECK (device_type IN ('Android', 'iPhone', 'Desktop', 'All Devices')),
  browser TEXT NOT NULL,
  description TEXT NOT NULL,
  instructions TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Paused', 'Completed')),
  slots_limit INT NOT NULL CHECK (slots_limit > 0),
  remaining_slots INT NOT NULL CHECK (remaining_slots >= 0),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);`;

  const sqlRls = `-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS Policies for Profiles
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Admins have full access to profiles" 
ON public.profiles 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- 6. Create RLS Policies for Jobs
-- Select Policy: Only Approved users and Admins can view jobs
CREATE POLICY "Approved users can select jobs"
ON public.jobs
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() 
    AND (profiles.status = 'Approved' OR profiles.role = 'admin')
  )
);

-- Insert Policy: Only Approved users can post jobs
CREATE POLICY "Approved users can insert jobs"
ON public.jobs
FOR INSERT
WITH CHECK (
  auth.uid() = user_id 
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.status = 'Approved'
  )
);

-- Update Policy: Users can only update their own jobs
CREATE POLICY "Users can update own jobs"
ON public.jobs
FOR UPDATE
USING (
  auth.uid() = user_id 
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.status = 'Approved'
  )
)
WITH CHECK (auth.uid() = user_id);

-- Delete Policy: Users can delete their own jobs or Admin can delete any
CREATE POLICY "Users can delete own jobs"
ON public.jobs
FOR DELETE
USING (
  auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);`;

  const sqlTrigger = `-- 5. Create a trigger to automatically create a profile after Supabase sign-up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    username, 
    email, 
    district, 
    upazila_thana, 
    village, 
    postal_code, 
    cpa_networks, 
    status, 
    role
  )
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'username', 'New User'),
    new.email,
    COALESCE(new.raw_user_meta_data->>'district', ''),
    COALESCE(new.raw_user_meta_data->>'upazila', ''),
    COALESCE(new.raw_user_meta_data->>'village', ''),
    COALESCE(new.raw_user_meta_data->>'postalCode', ''),
    ARRAY(SELECT jsonb_array_elements_text(COALESCE(new.raw_user_meta_data->'cpaNetworks', '[]'::jsonb))),
    'Pending',
    'user'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();`;

  return (
    <div className="bg-slate-900 text-slate-100 rounded-xl border border-slate-800 shadow-2xl p-6 overflow-hidden max-w-4xl mx-auto my-6" id="supabase-console">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-950 text-emerald-400 rounded-lg">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white tracking-tight">Supabase Config & RLS Policies</h2>
            <p className="text-xs text-slate-400">Production-ready database code for Bangladesh-based CPA Lead Exchange</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-emerald-950/50 border border-emerald-900/50 rounded-full px-3 py-1">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-[10px] font-mono font-semibold text-emerald-400 tracking-wider">SUPABASE READY</span>
        </div>
      </div>

      <div className="space-y-6">
        {/* SQL Tables Schema */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="flex items-center gap-2 text-xs font-semibold text-slate-300 font-mono">
              <Terminal className="w-4 h-4 text-emerald-400" /> [1] Profiles Table & Status Enum
            </span>
            <button
              onClick={() => copyToClipboard(sqlSchema, "schema")}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded transition-colors"
            >
              {copiedSection === "schema" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              {copiedSection === "schema" ? "অনুলিপি করা হয়েছে" : "Copy SQL"}
            </button>
          </div>
          <pre className="p-4 bg-slate-950 text-slate-300 rounded-lg text-xs font-mono overflow-x-auto border border-slate-850 max-h-48 leading-relaxed">
            {sqlSchema}
          </pre>
        </div>

        {/* SQL RLS Policies */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="flex items-center gap-2 text-xs font-semibold text-slate-300 font-mono">
              <ShieldAlert className="w-4 h-4 text-emerald-400" /> [2] Row Level Security (RLS) & Policies
            </span>
            <button
              onClick={() => copyToClipboard(sqlRls, "rls")}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded transition-colors"
            >
              {copiedSection === "rls" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              {copiedSection === "rls" ? "অনুলিপি করা হয়েছে" : "Copy SQL"}
            </button>
          </div>
          <pre className="p-4 bg-slate-950 text-slate-300 rounded-lg text-xs font-mono overflow-x-auto border border-slate-850 max-h-48 leading-relaxed">
            {sqlRls}
          </pre>
        </div>

        {/* SQL Auth Sync Trigger */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="flex items-center gap-2 text-xs font-semibold text-slate-300 font-mono">
              <KeyRound className="w-4 h-4 text-emerald-400" /> [3] Auth Sign-up Profile Trigger
            </span>
            <button
              onClick={() => copyToClipboard(sqlTrigger, "trigger")}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded transition-colors"
            >
              {copiedSection === "trigger" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              {copiedSection === "trigger" ? "অনুলিপি করা হয়েছে" : "Copy SQL"}
            </button>
          </div>
          <pre className="p-4 bg-slate-950 text-slate-300 rounded-lg text-xs font-mono overflow-x-auto border border-slate-850 max-h-48 leading-relaxed">
            {sqlTrigger}
          </pre>
        </div>
      </div>

      <div className="mt-6 p-4 bg-slate-950/60 rounded-lg border border-slate-850 text-xs text-slate-400 space-y-2">
        <div className="font-semibold text-slate-200">💡 কিভাবে এই SQL কোডটি ব্যবহার করবেন:</div>
        <p className="leading-relaxed">
          আপনার Supabase প্রজেক্টের **SQL Editor** এ গিয়ে একটি নতুন কোয়েরি খুলুন। উপরের কোডগুলো কপি করে সেখানে রান করুন। 
          এটি আপনার জন্য রিয়েল-টাইম বাংলাদেশ ভিত্তিক ডিস্ট্রিক্ট, থানা এবং CPA নেটওয়ার্ক নির্বাচন সংবলিত সম্পূর্ণ `profiles` টেবিল তৈরি করবে, আর RLS পলিসিগুলোর মাধ্যমে ইউজারের তথ্যকে সুরক্ষিত করবে যেন কেউ অন্য কোনো ইউজারের সংবেদনশীল তথ্য দেখতে না পারে।
        </p>
      </div>
    </div>
  );
}
