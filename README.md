# JobScout AI — Intelligent Job Discovery and Career Agent

JobScout AI is a production-ready application designed to streamline the career hunt. It discovers live jobs, calculates resume/preference alignment scores, flags potential matches, and leverages an autonomous **Scout Agent** to automate status tracking, cover letter drafting, skill gap analyses, and interview preparation.

---

## 🚀 Key Features

*   **Scout AI Agent (Autonomous)**: An interactive mentor that can execute database commands, find/save roles, build personalized cover letters, analyze skill alignment, and conduct mock interview prep.
*   **ATS Optimization Engine**: Interactive visualizations highlighting exact skill gaps, difficulty levels, and estimated score increases upon learning new skills.
*   **n8n Daily Automated Discovery**: Orchestrates regular job searches at **5:00 AM daily**, updating matches and sending digests.
*   **India-Focused Filtering**: Native parsing that optimizes listings specifically for India-based and remote worldwide candidates.

---

## 🛠️ Tech Stack & Architecture

*   **Frontend**: React (Vite), Tailwind CSS, Lucide icons, responsive sidebar & drawer layouts.
*   **Backend**: Node.js, Express, Gemini 2.5 Flash (for agent function-calling and prep generation), Supabase client.
*   **Database**: Supabase PostgreSQL (handling tables for `jobs`, `job_preferences`, `profiles`, and `scout_runs` history).

---

## 📦 Local Installation & Setup

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org) and [npm](https://npmjs.com) installed.

### 2. Database Setup (Supabase)
Create a new project on [Supabase](https://supabase.com) and execute the SQL script in `backend/migrations/add_health_columns.sql` in your Supabase SQL Editor.

### 3. Backend Configuration
Navigate to the `backend/` folder and install dependencies:
```bash
cd backend
npm install
```

Create a `.env` file inside the `backend/` directory:
```env
PORT=5000
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_or_service_key
GEMINI_API_KEY=your_gemini_api_key

# Optional RapidAPI / Jooble / Adzuna keys:
JSEARCH_API_KEY=your_rapidapi_key
JOOBLE_API_KEY=your_jooble_key
ADZUNA_APP_ID=your_adzuna_app_id
ADZUNA_APP_KEY=your_adzuna_app_key
```

Start the backend development server:
```bash
npm run dev
```

### 4. Frontend Configuration
Navigate to the `frontend/` folder and install dependencies:
```bash
cd ../frontend
npm install
```

Start the Vite development server:
```bash
npm run dev
```

The frontend will run at `http://localhost:5173`.

---

## ⚙️ n8n Automation Setup

To enable fully hands-free daily scouting, JobScout AI includes an n8n workflow file configured to run **every morning at 5:00 AM**.

### Workflow Actions
1.  **5:00 AM Cron Trigger**: Fires automatically to trigger the discovery scan when provider rate limits are lowest.
2.  **HTTP Request (Scout Run API)**: Issues a `POST` request to the backend `/api/scout/run` endpoint to scan free job boards (Remotive, Arbeitnow, The Muse) and active API providers (JSearch, Jooble, Adzuna).
3.  **HTTP Request (Get Daily Summary)**: Queries `/api/jobs/daily-summary` to aggregate high-match listings, resume alignments, and AI recommendations.
4.  **Notifications Digest**: Integrates with notification placeholders (Slack, WhatsApp, Email) to push summaries directly to your inbox.

### How to Import & Configure the Workflow
1.  Launch your local or cloud n8n instance (e.g., run `n8n start` or sign in to n8n Cloud).
2.  Create a new workflow and select **Import from File...** from the settings menu.
3.  Choose the `automation/JobScout_Daily_Discovery.json` file.
4.  Configure the environment variables in n8n or edit the URL parameter on the **HTTP Request** nodes to match your backend host (e.g., `http://localhost:5000` or your deployed API URL).
5.  Activate the workflow to start daily discovery at 5:00 AM.
