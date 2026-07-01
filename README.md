# 🚀 JobScout AI

> **An AI-powered career platform that helps job seekers discover opportunities, analyze resume compatibility, identify skill gaps, and manage their entire job search journey.**

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react" />
  <img src="https://img.shields.io/badge/Node.js-Express-339933?logo=node.js" />
  <img src="https://img.shields.io/badge/Supabase-Database-3ECF8E?logo=supabase" />
  <img src="https://img.shields.io/badge/Google-Gemini_AI-4285F4?logo=google" />
  <img src="https://img.shields.io/badge/Frontend-Vercel-black?logo=vercel" />
  <img src="https://img.shields.io/badge/Backend-Render-46E3B7" />
</p>

---

## 🌐 Live Demo

🔗 **Frontend:** https://jobscout-ai-nine.vercel.app

💻 **Backend API:** https://jobscout-backend-8ytl.onrender.com

📂 **GitHub Repository:** https://github.com/indrajithkss/jobscout-ai

---

# 📖 About

JobScout AI is a full-stack AI-powered career assistant designed to simplify the job search process.

It intelligently discovers relevant job opportunities, analyzes resume compatibility, provides career insights, recommends skills to learn, and helps users manage applications through a modern dashboard.

---

# ✨ Features

### 🤖 AI Copilot
- AI-powered career assistant
- Career guidance & recommendations
- Interactive job actions

### 🔍 Smart Job Discovery
- AI-ranked job recommendations
- Resume & preference matching
- Save and track applications

### 📄 Resume Intelligence
- PDF Resume Upload
- Resume Parsing
- Skill Extraction
- Resume Match Analysis

### 🧠 Career Intelligence
- Career Readiness Score
- Skill Gap Analysis
- Weekly Learning Roadmap
- Market Demand Insights

### 💼 AI Job Advisor
- Why you should apply
- Missing skills
- Resume suggestions
- Interview preparation topics

### 📊 Analytics Dashboard
- Application tracking
- Interview & offer rates
- Pipeline analytics
- Daily career summary

### ⚡ Automation
- Daily job discovery using **GitHub Actions**
- Automatic scout execution
- Daily summary generation

---

# 🏗️ Architecture

```text
GitHub Actions
        │
        ▼
Express Backend (Render)
        │
 ┌──────┼──────────┐
 ▼      ▼          ▼
Jobs  Gemini AI  Supabase
        │
        ▼
React + Vite (Vercel)
```

---

# 🛠️ Tech Stack

### Frontend
- React
- Vite
- Tailwind CSS
- React Router
- Axios

### Backend
- Node.js
- Express.js
- Multer
- PDF Parse

### Database
- Supabase

### AI
- Google Gemini API

### Deployment
- Vercel
- Render
- GitHub Actions

---

# 🚀 Getting Started

## Clone the repository

```bash
git clone https://github.com/indrajithkss/jobscout-ai.git

cd jobscout-ai
```

## Backend

```bash
cd backend

npm install

npm run dev
```

Create a `.env` file:

```env
PORT=5000

SUPABASE_URL=

SUPABASE_KEY=

GEMINI_API_KEY=
```

## Frontend

```bash
cd frontend

npm install

npm run dev
```

Create a `.env` file:

```env
VITE_API_URL=http://localhost:5000/api
```

---

# 📸 Screenshots

> Add screenshots here after deployment.

- Dashboard
- AI Copilot
- Career Hub
- Analytics
- Resume Upload
- Job Advisor

---

# 🚧 Future Improvements

- AI Resume Tailoring
- AI Cover Letter Generator
- User Authentication
- Email Notifications
- Browser Extension
- Mobile Application

---

# 💡 Skills Demonstrated

- Full Stack Development
- REST API Development
- AI Integration
- Resume Parsing
- Prompt Engineering
- Database Design
- GitHub Actions Automation
- Production Deployment
- Responsive UI Development

---

# 👨‍💻 Author

**Indrajith KS**


## 📄 License

This project is licensed under the **MIT License**.
