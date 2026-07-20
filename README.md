# CPA Fresh Sign-up BD

CPA Fresh Sign-up BD is a state-of-the-art, full-stack, Signup-to-Signup (S2S) CPA Lead Exchange Platform tailored for the Bangladeshi freelance community. It allows members to cross-exchange CPA offers (Gmail Sign-ups, App installs, surveys, game registrations) and secure authentic local leads while maintaining strict validation guidelines.

---

## 🎨 Visual Identity & Theme
- **Theme**: Slate Dark & Emerald Accent, creating a modern, safe, and professional environment for active freelancers.
- **Typography**: Space Grotesk (display headings) and Inter (UI typography), accented by JetBrains Mono for system codes and transaction details.
- **Interactivity**: Fluid Framer Motion transitions, real-time sync, micro-interactions, and beautiful feedback notifications.

---

## 🚀 Key Features

### 👥 User Authentication & Onboarding
- **Comprehensive Profile Setup**: Register with precise location parameters (District, Upazila, Village, Postal Code) and preferred CPA networks.
- **Simulated Mailbox Integration**: Instant, server-generated activation emails delivered to an in-app verification mailbox for local debugging without real SMTP configuration.
- **Strict Approval Guard**: New profiles enter a pending review stage, requiring manual administrative review.

### 📋 CPA Task Feed & Campaign Manager
- **Filterable Offer Wall**: Easily query active offers by targeting country, device type (All Devices, Android, iPhone, Desktop), browser preferences, and specific CPA networks.
- **Task Claim & Timer System**: "Accept" offers with dynamic cooldown timers to prevent click-spamming and duplicate leads.
- **Dual-sided Points Flow**: Points are seamlessly transferred from campaign owners to completing workers on successful verification.

### 📸 Quad-Screenshot Proof Upload Engine
- **Rich Upload Interface**: Supports seamless drag-and-drop or manual click file selectors.
- **Step-by-Step Proof Verification**: Mandates exactly 4 screenshot uploads outlining different stages of the lead signup process.
- **Flexible Reviews**: Offers are sent to campaign posters, who can Approve, Reject (with reason), or ask for Resubmission if the screenshots are blurry or incomplete.

### 💼 Campaign Poster Dashboard ("My Jobs")
- Create, Edit, Pause, Resume, or Delete custom lead generation campaigns.
- Allocate dynamic slots, set point rewards per signup, and view ongoing completion rates.

### 💳 Point Wallet System
- Deposit simulated points to launch new campaigns.
- Deep transaction ledger tracking every point earned, spent, and pending review.

### 🛡️ Administrative Command Center
- **Admin Dashboard**: Aggregates vital system telemetry, active workers, pending queues, and active jobs.
- **User Management Console**: Administrative powers to Approve, Suspend, Ban, Unban, or reset user passwords instantly.
- **Job Moderator**: Oversee posted jobs to block malicious or abusive external campaigns.
- **Unified Proof Reviews**: Direct intervention capabilities to review and bypass disputed task submissions.
- **Reports and Financial Auditing**: Tracks point flow, user registrations, and system-wide task conversions.
- **Website Settings Controls**: Dynamically toggle Maintenance Mode, change default platform reward coefficients, adjust global cooldowns, customize site banners, and add supported CPA networks.
- **Supabase RLS Console Simulator**: Highlights the underlying Row Level Security (RLS) and database policies powering authentic high-scale operations.

---

## 📁 Clean Production Folder Structure

```
├── server.ts              # Full-stack Node.js / Express backend entry point
├── database.json          # High-performance server-side simulated database file
├── package.json           # Project manifest, scripts, and production dependencies
├── vite.config.ts         # Vite bundler, asset, and dev server configurations
├── tsconfig.json          # Strict TypeScript configurations
├── .env.example           # Secure template outlining all required environment keys
├── .gitignore             # Excluded files list (node_modules, builds, databases)
├── metadata.json          # Native Applet identifiers and framework permissions
│
└── src/
    ├── main.tsx           # Client React entry point
    ├── App.tsx            # Core application router and state coordinator
    ├── types.ts           # Unified type declarations, interfaces, and enums
    ├── index.css          # Tailwind CSS global styling and font configuration
    │
    └── components/        # Modular, self-contained UI modules
        ├── TaskFeed.tsx                 # Core CPA Offer Wall & Campaign browsing
        ├── ActiveTasksList.tsx          # Active worker timers & proof-upload gateways
        ├── ReceivedSubmissionsList.tsx  # Poster review board for worker proof submissions
        ├── MyJobsList.tsx               # Posted campaign monitors & edit dialogs
        ├── JobPostingForm.tsx           # Interactive multi-step campaign designer
        ├── WalletPage.tsx               # Point Wallet panel & ledger table
        ├── Mailbox.tsx                  # In-app verification email inbox
        ├── NotificationCenter.tsx       # Floating notification board
        │
        ├── AdminDashboard.tsx           # Global telemetry widgets and charts
        ├── AdminUserManagement.tsx      # Comprehensive account bans & activations
        ├── AdminJobManagement.tsx       # System-wide campaign moderation
        ├── AdminProofManagement.tsx     # Dispute coordinator and proof bypasses
        ├── AdminReports.tsx             # Audit records, point flow, and analytics
        ├── AdminSettings.tsx            # Global parameters, maintenance, and network toggles
        ├── AdminSecurity.tsx            # Security policy and schema document viewer
        └── SupabaseConsole.tsx          # SQL playground and RLS console simulator
```

---

## 🛠️ Installation & Setup Guide

Ensure you have **Node.js (v18+)** installed.

### 1. Clone & Preparation
```bash
# Navigate to the workspace
cd cpa-fresh-signup-bd

# Copy environment variables file
cp .env.example .env
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Development Server
Spins up both the Vite client asset processor and Express backend server in a hot-reload container.
```bash
npm run dev
```
The app will be accessible at: `http://localhost:3000`

### 4. Build for Production
Compiles client-side React assets with high-compression tree shaking and bundles backend Express modules using `esbuild` into high-performance standalone files.
```bash
npm run build
```

### 5. Start Production Server
Executes the bundled applet under high performance.
```bash
npm run start
```

---

## 🔒 Environment Configurations (`.env.example`)
To configure the application, define these keys inside your active environment or local `.env` file:
- `GEMINI_API_KEY`: Secrets credential used for server-side AI model processing.
- `APP_URL`: Canonical deployment domain, utilized for safe callback redirections.

---

## 🎯 Technologies & Frameworks
- **Frontend**: React 19, Tailwind CSS, Lucide React, Framer Motion
- **Backend**: Node.js, Express, tsx, esbuild
- **Language**: TypeScript
- **Database**: Local JSON Database Engine

- 
