-- CPA Fresh Sign-up BD — Initial Database Schema and RLS Policies

-- 1. Profiles Table (Linked to Supabase Auth)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text not null,
  email text not null,
  district text not null,
  upazila text not null,
  village text not null,
  postal_code text not null,
  cpa_networks text[] not null default '{}',
  status text not null default 'Pending', -- 'Pending', 'Approved', 'Rejected', 'Suspended', 'Banned'
  role text not null default 'user',      -- 'user', 'admin'
  surfing_balance numeric not null default 0,
  email_verified boolean not null default false,
  verification_token text not null default '',
  created_at timestamptz not null default now()
);

-- Enable RLS on Profiles
alter table public.profiles enable row level security;

-- Profiles Policies
create policy "Users can view all approved profiles"
  on public.profiles for select
  using (auth.role() = 'authenticated');

create policy "Users can update their own profile fields"
  on public.profiles for update
  using (id = auth.uid());

create policy "Admins have full access to profiles"
  on public.profiles for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- 2. CPA Campaigns (Jobs) Table
create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  affiliate_link text not null,
  cpa_network text not null,
  country text not null,
  device_type text not null, -- 'Android', 'iPhone', 'Desktop', 'All Devices'
  browser text not null,
  description text not null,
  instructions text not null,
  status text not null default 'Active', -- 'Active', 'Paused', 'Completed'
  slots_limit integer not null,
  remaining_slots integer not null,
  user_id uuid references auth.users on delete cascade not null,
  username text not null,
  created_at timestamptz not null default now()
);

-- Enable RLS on Jobs
alter table public.jobs enable row level security;

-- Jobs Policies
create policy "Authenticated users can view jobs"
  on public.jobs for select
  using (auth.role() = 'authenticated');

create policy "Users can insert their own jobs"
  on public.jobs for insert
  with check (user_id = auth.uid());

create policy "Users can update their own jobs"
  on public.jobs for update
  using (user_id = auth.uid() or exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  ));

create policy "Users can delete their own jobs"
  on public.jobs for delete
  using (user_id = auth.uid() or exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  ));

-- 3. Task Submissions (Tasks) Table
create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references public.jobs on delete cascade not null,
  job_title text not null,
  cpa_network text not null,
  affiliate_link text not null,
  worker_id uuid references auth.users on delete cascade not null,
  worker_name text not null,
  owner_id uuid references auth.users on delete cascade not null,
  owner_name text not null,
  screenshots text[] not null,
  status text not null default 'Accepted', -- 'Accepted', 'Pending', 'Approved', 'Rejected', 'Resubmission Requested'
  rejection_reason text,
  created_at timestamptz not null default now(),
  submitted_at timestamptz,
  reviewed_at timestamptz
);

-- Enable RLS on Tasks
alter table public.tasks enable row level security;

-- Tasks Policies
create policy "Workers can view their tasks"
  on public.tasks for select
  using (worker_id = auth.uid() or owner_id = auth.uid() or exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  ));

create policy "Workers can insert tasks"
  on public.tasks for insert
  with check (worker_id = auth.uid());

create policy "Workers and owners can update their tasks"
  on public.tasks for update
  using (worker_id = auth.uid() or owner_id = auth.uid() or exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  ));

-- 4. Notifications Table
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  message text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

-- Enable RLS on Notifications
alter table public.notifications enable row level security;

-- Notifications Policies
create policy "Users can view their own notifications"
  on public.notifications for select
  using (user_id = auth.uid());

create policy "Users can update their own notifications"
  on public.notifications for update
  using (user_id = auth.uid());

create policy "System can create notifications"
  on public.notifications for insert
  with check (auth.role() = 'authenticated');

-- 5. Points Transactions Table
create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  username text not null,
  type text not null, -- 'Earned', 'Spent'
  job_title text not null,
  points numeric not null,
  status text not null default 'Completed', -- 'Completed', 'Pending', 'Cancelled'
  date timestamptz not null default now()
);

-- Enable RLS on Transactions
alter table public.transactions enable row level security;

-- Transactions Policies
create policy "Users can view their own transactions"
  on public.transactions for select
  using (user_id = auth.uid() or exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  ));

create policy "Admins can manage transactions"
  on public.transactions for all
  using (exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  ));

-- 6. Website Settings Table (Singleton)
create table public.website_settings (
  id integer primary key default 1 check (id = 1),
  website_name text not null default 'CPA Fresh Sign-up BD',
  logo text not null default '',
  maintenance_mode boolean not null default false,
  default_cooldown_time integer not null default 24,
  default_surfing_balance_reward integer not null default 100,
  supported_cpa_networks text[] not null default '{"CPAGrip", "MyLead", "ogads"}',
  homepage_banner_text text not null default 'স্বাগতম CPA Fresh Sign-up BD মেম্বারশিপ প্যানেলে!',
  contact_email text not null default 'admin@cpafreshbd.com',
  created_at timestamptz not null default now()
);

-- Enable RLS on Website Settings
alter table public.website_settings enable row level security;

-- Website Settings Policies
create policy "Anyone can view website settings"
  on public.website_settings for select
  using (true);

create policy "Admins can update website settings"
  on public.website_settings for update
  using (exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  ));

-- Insert default website settings
insert into public.website_settings (id, website_name, maintenance_mode, default_cooldown_time, default_surfing_balance_reward, supported_cpa_networks, homepage_banner_text)
values (1, 'CPA Fresh Sign-up BD', false, 24, 100, '{"CPAGrip", "MyLead", "ogads"}', 'স্বাগতম CPA Fresh Sign-up BD মেম্বারশিপ প্যানেলে!')
on conflict (id) do nothing;

-- 7. Simulated Emails Table (Local simulation in Supabase)
create table public.simulated_emails (
  id uuid primary key default gen_random_uuid(),
  "to" text not null,
  subject text not null,
  body text not null,
  link text not null,
  created_at timestamptz not null default now()
);

-- Enable RLS on Simulated Emails
alter table public.simulated_emails enable row level security;

-- Simulated Emails Policies
create policy "Users can view their own simulated emails"
  on public.simulated_emails for select
  using ("to" = (select email from public.profiles where id = auth.uid()) or exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  ));

create policy "Anyone can insert simulated emails"
  on public.simulated_emails for insert
  with check (true);

-- 8. Audit Logs Table
create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  action text not null,
  admin_id uuid not null,
  admin_name text not null,
  details text not null,
  created_at timestamptz not null default now()
);

-- Enable RLS on Audit Logs
alter table public.audit_logs enable row level security;

-- Audit Logs Policies
create policy "Admins can manage audit logs"
  on public.audit_logs for all
  using (exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  ));

-- 9. Storage Bucket setup for screenshots
insert into storage.buckets (id, name, public)
values ('screenshots', 'screenshots', true)
on conflict (id) do nothing;

-- Storage Policies for screenshots bucket
create policy "Allow public viewing of screenshots"
  on storage.objects for select
  using (bucket_id = 'screenshots');

create policy "Allow authenticated users to upload screenshots"
  on storage.objects for insert
  with check (bucket_id = 'screenshots' and auth.role() = 'authenticated');

-- 10. Profile Trigger function on Auth User Signup
create or replace function public.handle_new_user()
returns trigger as $$
declare
  is_admin boolean;
begin
  -- Set role as admin if it's the designated admin email
  if new.email = 'admin@gmail.com' then
    insert into public.profiles (
      id,
      username,
      email,
      district,
      upazila,
      village,
      postal_code,
      cpa_networks,
      status,
      role,
      surfing_balance,
      email_verified,
      verification_token,
      created_at
    ) values (
      new.id,
      coalesce(new.raw_user_meta_data->>'username', 'System Admin'),
      new.email,
      coalesce(new.raw_user_meta_data->>'district', 'Dhaka'),
      coalesce(new.raw_user_meta_data->>'upazila', 'Ramna'),
      coalesce(new.raw_user_meta_data->>'village', 'Siddheswari'),
      coalesce(new.raw_user_meta_data->>'postalCode', '1217'),
      array['CPAGrip', 'MyLead', 'ogads'],
      'Approved',
      'admin',
      5000,
      true,
      '',
      new.created_at
    );
  else
    insert into public.profiles (
      id,
      username,
      email,
      district,
      upazila,
      village,
      postal_code,
      cpa_networks,
      status,
      role,
      surfing_balance,
      email_verified,
      verification_token,
      created_at
    ) values (
      new.id,
      coalesce(new.raw_user_meta_data->>'username', ''),
      new.email,
      coalesce(new.raw_user_meta_data->>'district', ''),
      coalesce(new.raw_user_meta_data->>'upazila', ''),
      coalesce(new.raw_user_meta_data->>'village', ''),
      coalesce(new.raw_user_meta_data->>'postalCode', ''),
      array(select jsonb_array_elements_text(coalesce(new.raw_user_meta_data->'cpaNetworks', '[]'::jsonb))),
      'Pending',
      'user',
      100, -- Default signup points
      false,
      coalesce(new.raw_user_meta_data->>'verificationToken', ''),
      new.created_at
    );
  end if;
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to execute on auth user creation
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
