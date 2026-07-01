/**
 * agentService.js
 * Autonomous AI Career Agent — uses Gemini function calling to
 * take real actions in the job search pipeline.
 */

const { GoogleGenAI } = require("@google/genai");
const { supabase } = require("../config/supabase");
const { getLatestProfile } = require("./profileService");

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// ─── Tool Declarations ───────────────────────────────────────────────────────

const TOOLS = [
  {
    name: "search_jobs",
    description:
      "Search the job database for matching opportunities. Use when the user asks to find, list, or show jobs.",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Role or keyword to search for (e.g. 'React Developer', 'remote backend')",
        },
        limit: {
          type: "integer",
          description: "Maximum number of results to return. Default 5.",
        },
        min_score: {
          type: "integer",
          description: "Minimum match score (0-100). Default 60.",
        },
      },
      required: [],
    },
  },
  {
    name: "save_job",
    description:
      "Save / shortlist a job for the candidate by its job ID. Use when the user says 'save this job', 'shortlist it', or 'bookmark it'.",
    parameters: {
      type: "object",
      properties: {
        job_id: { type: "string", description: "The ID of the job to save." },
      },
      required: ["job_id"],
    },
  },
  {
    name: "set_application_status",
    description:
      "Update the status of a job application. Valid statuses: saved, applied, interview, offer, rejected.",
    parameters: {
      type: "object",
      properties: {
        job_id: { type: "string", description: "The job ID to update." },
        status: {
          type: "string",
          enum: ["saved", "applied", "interview", "offer", "rejected"],
          description: "The new status.",
        },
      },
      required: ["job_id", "status"],
    },
  },
  {
    name: "draft_cover_letter",
    description:
      "Generate a personalized cover letter for a specific job. Use when the user asks to draft, write, or create a cover letter.",
    parameters: {
      type: "object",
      properties: {
        job_id: {
          type: "string",
          description: "The job ID to generate a cover letter for.",
        },
      },
      required: ["job_id"],
    },
  },
  {
    name: "get_skill_gap",
    description:
      "Analyze which skills the candidate is missing for a specific job or role type. Use when asked about skill gaps, missing skills, or what to learn.",
    parameters: {
      type: "object",
      properties: {
        job_id: {
          type: "string",
          description: "Specific job ID to analyze. Optional.",
        },
        role_query: {
          type: "string",
          description:
            "A role type to analyze gap for if no specific job (e.g. 'Senior React Developer').",
        },
      },
      required: [],
    },
  },
  {
    name: "get_interview_prep",
    description:
      "Generate interview questions and preparation tips for a job or role. Use when the user wants to prepare for an interview.",
    parameters: {
      type: "object",
      properties: {
        job_id: {
          type: "string",
          description: "Job ID to generate interview prep for. Optional.",
        },
        role: {
          type: "string",
          description: "Role title if no specific job (e.g. 'Full Stack Developer').",
        },
      },
      required: [],
    },
  },
  {
    name: "get_daily_briefing",
    description:
      "Get a full daily job hunt briefing: new matches, pipeline status, and today's top recommended action. Use when the user asks 'what should I do today', 'give me a briefing', or 'what's new'.",
    parameters: { type: "object", properties: {}, required: [] },
  },
  {
    name: "get_application_status",
    description:
      "Get the current status of all applications: how many applied, interviews, offers, and what follow-ups are needed. Use when user asks about their pipeline or application status.",
    parameters: { type: "object", properties: {}, required: [] },
  },
  {
    name: "suggest_apply_list",
    description:
      "Suggest the top 3-5 jobs the candidate should apply to right now, ranked by match score, recency, and strategic fit. Use when user asks 'what should I apply to', 'best jobs for me today', or 'suggest applications'.",
    parameters: {
      type: "object",
      properties: {
        limit: {
          type: "integer",
          description: "How many jobs to recommend. Default 3.",
        },
      },
      required: [],
    },
  },
];

// ─── Tool Executors ───────────────────────────────────────────────────────────

async function executeTool(name, args, profile) {
  switch (name) {
    case "search_jobs": {
      const q = (args.query || "").toLowerCase();
      const limit = args.limit || 5;
      const minScore = args.min_score || 0;

      let query = supabase
        .from("jobs")
        .select("id, title, company, location, source, ai_score, status, apply_url, created_at")
        .order("ai_score", { ascending: false })
        .limit(limit * 3);

      if (q) query = query.ilike("title", `%${q}%`);

      const { data: jobs = [] } = await query;
      const filtered = jobs.filter((j) => (j.ai_score || 0) >= minScore).slice(0, limit);

      return {
        tool: "search_jobs",
        label: `Found ${filtered.length} matching jobs`,
        jobs: filtered.map((j) => ({
          id: j.id,
          title: j.title,
          company: j.company,
          location: j.location,
          source: j.source,
          matchScore: j.ai_score,
          status: j.status,
          applyUrl: j.apply_url,
          createdAt: j.created_at,
        })),
      };
    }

    case "save_job": {
      const { error } = await supabase
        .from("jobs")
        .update({ status: "saved" })
        .eq("id", args.job_id);

      if (error) throw new Error(error.message);
      const { data: job } = await supabase
        .from("jobs")
        .select("title, company")
        .eq("id", args.job_id)
        .single();

      return {
        tool: "save_job",
        label: `Saved: ${job?.title || args.job_id}`,
        job_id: args.job_id,
        title: job?.title,
        company: job?.company,
        success: true,
      };
    }

    case "set_application_status": {
      const { error } = await supabase
        .from("jobs")
        .update({ status: args.status })
        .eq("id", args.job_id);

      if (error) throw new Error(error.message);
      const { data: job } = await supabase
        .from("jobs")
        .select("title, company")
        .eq("id", args.job_id)
        .single();

      return {
        tool: "set_application_status",
        label: `Status updated → ${args.status}`,
        job_id: args.job_id,
        title: job?.title,
        company: job?.company,
        new_status: args.status,
        success: true,
      };
    }

    case "draft_cover_letter": {
      let job = null;
      if (args.job_id) {
        const { data } = await supabase
          .from("jobs")
          .select("title, company, location, description")
          .eq("id", args.job_id)
          .single();
        job = data;
      }

      const profileCtx = profile
        ? `Candidate: ${profile.name}\nSkills: ${profile.skills?.join(", ")}\nExperience: ${profile.experience}\nProjects: ${profile.projects?.slice(0, 3).join(", ")}`
        : "Experienced developer";

      const jobCtx = job
        ? `Job: ${job.title} at ${job.company} (${job.location || "Remote"})\nDescription: ${(job.description || "").substring(0, 600)}`
        : `Role: ${args.role || "Software Developer"}`;

      const coverPrompt = `Write a professional, personalized cover letter. Keep it concise (3 paragraphs, under 250 words). Do not include address headers.

${profileCtx}

${jobCtx}

Write only the body of the letter. Start with "Dear Hiring Manager,"`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: coverPrompt,
      });

      const letter = response.text;

      // Persist cover letter linked to job
      if (args.job_id) {
        await supabase
          .from("jobs")
          .update({ cover_letter: letter })
          .eq("id", args.job_id);
      }

      return {
        tool: "draft_cover_letter",
        label: `Cover letter drafted${job ? ` for ${job.title}` : ""}`,
        job_id: args.job_id,
        title: job?.title,
        company: job?.company,
        cover_letter: letter,
      };
    }

    case "get_skill_gap": {
      let missingSkills = [];
      let jobTitle = args.role_query || "Target Role";
      let matchedSkills = profile?.skills || [];

      if (args.job_id) {
        const { data: job } = await supabase
          .from("jobs")
          .select("title, company, missing_skills, matched_skills")
          .eq("id", args.job_id)
          .single();

        if (job) {
          jobTitle = `${job.title}${job.company ? ` at ${job.company}` : ""}`;
          missingSkills = job.missing_skills || [];
          matchedSkills = job.matched_skills || matchedSkills;
        }
      } else {
        // Query top jobs and extract most common missing skills
        const { data: topJobs = [] } = await supabase
          .from("jobs")
          .select("missing_skills")
          .order("ai_score", { ascending: false })
          .limit(20);

        const freq = {};
        topJobs.forEach((j) => {
          (j.missing_skills || []).forEach((s) => {
            freq[s] = (freq[s] || 0) + 1;
          });
        });
        missingSkills = Object.entries(freq)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 8)
          .map(([skill, count]) => ({ skill, count }));
      }

      return {
        tool: "get_skill_gap",
        label: `Skill gap analyzed for ${jobTitle}`,
        role: jobTitle,
        matched: matchedSkills,
        missing: missingSkills,
      };
    }

    case "get_interview_prep": {
      let role = args.role || "Software Developer";
      let jobDesc = "";

      if (args.job_id) {
        const { data: job } = await supabase
          .from("jobs")
          .select("title, company, description")
          .eq("id", args.job_id)
          .single();

        if (job) {
          role = `${job.title}${job.company ? ` at ${job.company}` : ""}`;
          jobDesc = job.description ? `\nJob Description: ${job.description.substring(0, 500)}` : "";
        }
      }

      const profileCtx = profile
        ? `Candidate skills: ${profile.skills?.join(", ")}`
        : "";

      const prepPrompt = `Generate 5 targeted interview questions with model answers for the role: ${role}.
${jobDesc}
${profileCtx}

Format as JSON array: [{"question": "...", "answer": "...", "type": "technical|behavioral|situational"}]
Return ONLY the JSON array, no extra text.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prepPrompt,
      });

      let questions = [];
      try {
        const cleaned = response.text.replace(/```json|```/g, "").trim();
        questions = JSON.parse(cleaned);
      } catch {
        questions = [{ question: response.text, answer: "", type: "general" }];
      }

      return {
        tool: "get_interview_prep",
        label: `Interview prep ready for ${role}`,
        role,
        questions: questions.map((q, i) => ({ id: i + 1, ...q })),
      };
    }

    case "get_daily_briefing": {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data: allJobs = [] } = await supabase
        .from("jobs")
        .select("id, title, company, location, ai_score, status, apply_url, created_at, discovery_type");

      const newToday = allJobs.filter((j) => new Date(j.created_at) >= today);
      const topMatches = allJobs
        .filter((j) => !j.status || j.status === "new")
        .sort((a, b) => (b.ai_score || 0) - (a.ai_score || 0))
        .slice(0, 3);
      const pendingFollowUp = allJobs.filter((j) => j.status === "applied");
      const interviews = allJobs.filter((j) => j.status === "interview");

      return {
        tool: "get_daily_briefing",
        label: "Daily briefing ready",
        date: new Date().toLocaleDateString("en-IN", { weekday: "long", month: "long", day: "numeric" }),
        new_today: newToday.length,
        total_jobs: allJobs.length,
        top_matches: topMatches.map((j) => ({
          id: j.id,
          title: j.title,
          company: j.company,
          location: j.location,
          matchScore: j.ai_score,
          applyUrl: j.apply_url,
        })),
        pending_followup: pendingFollowUp.length,
        active_interviews: interviews.length,
      };
    }

    case "get_application_status": {
      const { data: jobs = [] } = await supabase
        .from("jobs")
        .select("id, title, company, status, ai_score, created_at");

      const byStatus = {
        saved: jobs.filter((j) => j.status === "saved"),
        applied: jobs.filter((j) => j.status === "applied"),
        interview: jobs.filter((j) => j.status === "interview"),
        offer: jobs.filter((j) => j.status === "offer"),
        rejected: jobs.filter((j) => j.status === "rejected"),
      };

      return {
        tool: "get_application_status",
        label: "Pipeline status fetched",
        summary: {
          saved: byStatus.saved.length,
          applied: byStatus.applied.length,
          interview: byStatus.interview.length,
          offer: byStatus.offer.length,
          rejected: byStatus.rejected.length,
        },
        applied_jobs: byStatus.applied.map((j) => ({
          id: j.id,
          title: j.title,
          company: j.company,
          matchScore: j.ai_score,
        })),
        interview_jobs: byStatus.interview.map((j) => ({
          id: j.id,
          title: j.title,
          company: j.company,
        })),
      };
    }

    case "suggest_apply_list": {
      const limit = args.limit || 3;
      const { data: jobs = [] } = await supabase
        .from("jobs")
        .select("id, title, company, location, ai_score, apply_url, created_at, discovery_type")
        .in("status", ["new", null])
        .order("ai_score", { ascending: false })
        .limit(limit * 2);

      // Prefer "both" discovery_type (perfect matches)
      const sorted = [...jobs].sort((a, b) => {
        const aScore = (b.ai_score || 0) + (b.discovery_type === "both" ? 10 : 0);
        const bScore = (a.ai_score || 0) + (a.discovery_type === "both" ? 10 : 0);
        return aScore - bScore;
      });

      const picks = sorted.slice(0, limit);

      return {
        tool: "suggest_apply_list",
        label: `Top ${picks.length} recommended applications`,
        jobs: picks.map((j, idx) => ({
          rank: idx + 1,
          id: j.id,
          title: j.title,
          company: j.company,
          location: j.location,
          matchScore: j.ai_score,
          applyUrl: j.apply_url,
          isPerfectMatch: j.discovery_type === "both",
        })),
      };
    }

    default:
      return { error: `Unknown tool: ${name}` };
  }
}

// ─── Main Agent Loop ──────────────────────────────────────────────────────────

// ─── Offline Pattern Matcher agent fallback (for 429 rate limit or offline resilience) ───

async function runOfflineAgent(userMessage, profile) {
  const msg = userMessage.toLowerCase();
  const actionsExecuted = [];
  let reply = "";

  // 1. Daily Briefing / Today's tasks
  if (msg.includes("brief") || msg.includes("today") || msg.includes("focus") || msg.includes("briefing")) {
    try {
      const result = await executeTool("get_daily_briefing", {}, profile);
      actionsExecuted.push(result);
      reply = `**Scout Agent (Offline Mode)**: The Gemini API is currently rate-limited (Quota Exceeded), but I've compiled your daily briefing:
      
- **${result.new_today} new jobs** discovered today.
- **${result.active_interviews} active interviews** are scheduled/tracked.
- **${result.pending_followup} pending applications** need follow-ups.

Take a look at your top picks below.`;
    } catch (e) {
      reply = "I'm running in offline mode and couldn't process your daily briefing. Try searching for roles directly!";
    }
  }
  // 2. Skill Gap
  else if (msg.includes("skill") || msg.includes("gap") || msg.includes("learn")) {
    try {
      // Find the focused job context if possible, or query last saved/best job
      let jobId = null;
      const match = userMessage.match(/job[-_ ]?id:?\s*([a-f0-9\-]+)/i);
      if (match) jobId = match[1];

      if (!jobId) {
        const { data: topJobs } = await supabase
          .from("jobs")
          .select("id")
          .order("ai_score", { ascending: false })
          .limit(1);
        if (topJobs && topJobs.length > 0) jobId = topJobs[0].id;
      }

      const result = await executeTool("get_skill_gap", { job_id: jobId }, profile);
      actionsExecuted.push(result);
      reply = `**Scout Agent (Offline Mode)**: Analyzed your skill gap for **${result.role}**. Take a look at your matched vs missing skills list below.`;
    } catch (e) {
      reply = "I couldn't complete the skill gap analysis in offline mode. Make sure your profile has skills set.";
    }
  }
  // 3. Cover Letter
  else if (msg.includes("cover") || msg.includes("letter") || msg.includes("draft")) {
    let jobId = null;
    const match = userMessage.match(/job[-_ ]?id:?\s*([a-f0-9\-]+)/i);
    if (match) jobId = match[1];

    try {
      if (!jobId) {
        const { data: topJobs } = await supabase
          .from("jobs")
          .select("id")
          .order("ai_score", { ascending: false })
          .limit(1);
        if (topJobs && topJobs.length > 0) jobId = topJobs[0].id;
      }

      if (jobId) {
        const result = await executeTool("draft_cover_letter", { job_id: jobId }, profile);
        actionsExecuted.push(result);
        reply = `**Scout Agent (Offline Mode)**: I've successfully drafted your cover letter for the selected role! Copy it below.`;
      } else {
        reply = `**Scout Agent (Offline Mode)**: Please focus on or select a job first to draft a cover letter.`;
      }
    } catch (e) {
      reply = "Couldn't draft the cover letter. Gemini is rate-limited, and raw synthesis failed.";
    }
  }
  // 4. Interview Prep
  else if (msg.includes("interview") || msg.includes("prep") || msg.includes("prepare") || msg.includes("question")) {
    let jobId = null;
    const match = userMessage.match(/job[-_ ]?id:?\s*([a-f0-9\-]+)/i);
    if (match) jobId = match[1];

    try {
      const result = await executeTool("get_interview_prep", { job_id: jobId }, profile);
      actionsExecuted.push(result);
      reply = `**Scout Agent (Offline Mode)**: Here are targeted interview prep questions and answers compiled for you.`;
    } catch (e) {
      reply = "Failed to compile interview questions in offline mode.";
    }
  }
  // 5. Save Job / shortlist
  else if (msg.includes("save") || msg.includes("shortlist") || msg.includes("bookmark")) {
    let jobId = null;
    const match = userMessage.match(/job[-_ ]?id:?\s*([a-f0-9\-]+)/i);
    if (match) jobId = match[1];

    if (jobId) {
      try {
        const result = await executeTool("save_job", { job_id: jobId }, profile);
        actionsExecuted.push(result);
        reply = `**Scout Agent (Offline Mode)**: Shortlisted the job for you!`;
      } catch (e) {
        reply = "Failed to save the job.";
      }
    } else {
      reply = "Which job would you like to save? Please focus on a job context or provide a Job ID.";
    }
  }
  // 6. Pipeline / Application Status
  else if (msg.includes("pipeline") || msg.includes("status") || msg.includes("applied") || msg.includes("rejected")) {
    try {
      const result = await executeTool("get_application_status", {}, profile);
      actionsExecuted.push(result);
      reply = `**Scout Agent (Offline Mode)**: Pulled your pipeline status directly from the database.`;
    } catch (e) {
      reply = "Could not pull pipeline status in offline mode.";
    }
  }
  // 7. Search jobs
  else if (msg.includes("find") || msg.includes("search") || msg.includes("show")) {
    let query = "";
    const clean = userMessage.replace(/(find|search|show|me|jobs|for|matching)/gi, "").trim();
    if (clean) query = clean;

    try {
      const result = await executeTool("search_jobs", { query, limit: 3 }, profile);
      actionsExecuted.push(result);
      reply = `**Scout Agent (Offline Mode)**: Searched jobs for "${query || "all"}". Here are the matches in the database:`;
    } catch (e) {
      reply = "Could not run local job search right now.";
    }
  }
  // 7.5. Skills in resume / My skills
  else if (msg.includes("my skills") || msg.includes("skills in my resume") || msg.includes("what are my skills") || msg.includes("profile skills") || (msg.includes("skills") && msg.includes("resume"))) {
    if (profile && profile.skills && profile.skills.length > 0) {
      reply = `**Scout Agent (Offline Mode)**: Based on your synced profile, here are the skills listed on your resume:
      
${profile.skills.map(s => `- **${s}**`).join("\n")}

You can update these skills by uploading a new PDF resume in **Job Preferences**.`;
    } else {
      reply = `**Scout Agent (Offline Mode)**: No profile skills found yet. Please go to **Job Preferences** and upload a PDF resume so I can parse your skills!`;
    }
  }
  // 7.6. Projects in resume / My projects
  else if (msg.includes("my projects") || msg.includes("projects in my resume") || msg.includes("what are my projects") || (msg.includes("projects") && msg.includes("resume"))) {
    if (profile && profile.projects && profile.projects.length > 0) {
      reply = `**Scout Agent (Offline Mode)**: Based on your synced profile, here are your projects:
      
${profile.projects.map(p => `- **${p}**`).join("\n")}

You can sync new projects by uploading an updated PDF resume in **Job Preferences**.`;
    } else {
      reply = `**Scout Agent (Offline Mode)**: No projects found in your profile. Upload a PDF resume in **Job Preferences** to sync them.`;
    }
  }
  // 7.7. Contact / Experience / Education details
  else if (msg.includes("contact") || msg.includes("my email") || msg.includes("my phone") || msg.includes("profile details") || msg.includes("experience") || msg.includes("education")) {
    if (profile) {
      reply = `**Scout Agent (Offline Mode)**: Here are your candidate profile details:
      
- **Name**: ${profile.name || "N/A"}
- **Email**: ${profile.email || "N/A"}
- **Phone**: ${profile.phone || "N/A"}
- **Education**: ${profile.education || "N/A"}
- **Experience**: ${profile.experience || "N/A"}`;
    } else {
      reply = `**Scout Agent (Offline Mode)**: Here are your candidate profile details:
      
- **Name**: Indrajith
- **Role**: Full Stack Developer
- **Skills**: React, Node.js, Express, JavaScript, SQL, HTML, CSS, Tailwind

Please sync your specific resume details by uploading a PDF resume in **Job Preferences**!`;
    }
  }
  // 8. General fallback greeting
  else {
    reply = `**Scout Agent (Offline Mode)**: The Gemini API is currently rate-limited (Quota Exceeded). I am running in offline backup mode.
    
I can still help you with these offline commands:
- **"What should I do today?"** (Daily Briefing)
- **"Find React jobs"** (Local Job Search)
- **"Show my skill gap"** (Skill Gap Analysis)
- **"Review my pipeline"** (Application status summary)
- **"Draft a cover letter"** (Personalized drafts)
- **"Interview prep"** (Common mock questions)
- **"What are my skills?"** (List parsed skills)
- **"What are my projects?"** (List parsed projects)`;
  }

  return {
    reply,
    actions: actionsExecuted,
  };
}

// ─── Main Agent Loop ──────────────────────────────────────────────────────────

async function runAgent(userMessage, chatHistory = []) {
  let profile = null;
  try {
    profile = await getLatestProfile();
  } catch (e) {
    console.error("[Agent] Could not load profile:", e.message);
  }

  const profileSummary = profile
    ? `Candidate: ${profile.name} | Skills: ${profile.skills?.slice(0, 8).join(", ")} | Experience: ${profile.experience}`
    : "Candidate: Indrajith | Skills: React, Node.js, Express, JavaScript, SQL, HTML, CSS, Tailwind | Experience: Full Stack Developer";

  const systemInstruction = `You are Scout — an autonomous AI career agent for JobScout AI. You are intelligent, proactive, act like a personal career mentor, and perform multi-step career workflows.

Your candidate's profile:
${profileSummary}

You have access to real tools that take actions in the candidate's job search. When the user's intent maps to a tool, USE THE TOOL — don't just talk about it. After using tools, interpret results naturally and provide actionable mentor-style guidance.
You can chain multiple tool calls in a sequence to satisfy the user's intent (e.g. searching first, filtering next, then auto-saving).

Personality:
- Proactive and direct (like a senior mentor)
- Use "you" and "your" — be personal
- After tool results, add 1-2 lines of strategic advice
- Keep responses clear and well-formatted
- Use bullet points and bold text where helpful
- Never say "I cannot do that" — always find a way to help
- If the user asks how to upload a resume or wants to sync a new one, tell them to use the upload button on the "Job Preferences" page. Mention that you will instantly update your mentorship, cover letters, and match scores based on it!

Suggested Next Actions formatting requirement:
At the end of your response text, you must ALWAYS include a section with 2-3 logical next steps for the user. Use the exact formatting:
Suggested next actions:
- <Action 1>
- <Action 2>
- <Action 3>`;

  try {
    // 1. Build conversation history for Gemini with Turn Memory (Tool calls and responses)
    const contents = [];
    
    // Slice last 8 turns to avoid model context bloat while keeping solid memory
    const historySlice = chatHistory.slice(-8);

    for (const m of historySlice) {
      if (m.sender === "user") {
        contents.push({
          role: "user",
          parts: [{ text: m.text || "" }]
        });
      } else if (m.sender === "ai") {
        // If this AI turn contained tool actions, reconstruct the ReAct flow so Gemini remembers
        if (m.actions && m.actions.length > 0) {
          const functionCalls = [];
          const functionResponses = [];
          
          m.actions.forEach((act, idx) => {
            // Reconstruct call parameters based on tool type
            let args = {};
            if (act.tool === "search_jobs") {
              args = { query: act.query || "" };
            } else if (act.tool === "save_job" || act.tool === "set_application_status" || act.tool === "draft_cover_letter" || act.tool === "get_skill_gap" || act.tool === "get_interview_prep") {
              args = { job_id: act.job_id || "" };
            }
            
            functionCalls.push({
              functionCall: {
                name: act.tool,
                args: args
              }
            });
            
            functionResponses.push({
              functionResponse: {
                name: act.tool,
                response: act
              }
            });
          });
          
          if (functionCalls.length > 0) {
            contents.push({
              role: "model",
              parts: functionCalls
            });
            contents.push({
              role: "tool",
              parts: functionResponses
            });
          }
        }
        
        // Push the final text response
        contents.push({
          role: "model",
          parts: [{ text: m.text || "" }]
        });
      }
    }

    // Push current user prompt
    contents.push({ role: "user", parts: [{ text: userMessage }] });

    const toolDeclarations = TOOLS.map((t) => ({
      name: t.name,
      description: t.description,
      parameters: t.parameters,
    }));

    const actionsExecuted = [];
    let loopResponse = null;
    let maxTurns = 5;
    let currentTurn = 0;
    let shouldContinue = true;

    // Multi-turn autonomous planning loop
    while (shouldContinue && currentTurn < maxTurns) {
      currentTurn++;
      console.log(`[Agent] Plan Loop Turn ${currentTurn}/${maxTurns}`);

      loopResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: contents,
        config: {
          systemInstruction,
          tools: [{ functionDeclarations: toolDeclarations }],
        },
      });

      const candidate = loopResponse.candidates?.[0];
      const modelParts = candidate?.content?.parts || [];

      // Push the model's turn to contents
      contents.push({
        role: "model",
        parts: modelParts
      });

      // Find any tool calls requested by Gemini
      const functionCalls = modelParts.filter((p) => p.functionCall);

      if (functionCalls.length > 0) {
        const toolParts = [];
        for (const part of functionCalls) {
          const { name, args } = part.functionCall;
          console.log(`[Agent] Executing tool: ${name}`, args);

          let result;
          try {
            result = await executeTool(name, args || {}, profile);
            actionsExecuted.push(result);
          } catch (err) {
            console.error(`[Agent] Tool ${name} failed:`, err.message);
            result = { error: err.message };
          }

          toolParts.push({
            functionResponse: {
              name,
              response: result,
            },
          });
        }

        // Push the tool's responses back into contents
        contents.push({
          role: "tool",
          parts: toolParts
        });
      } else {
        // No function calls — Gemini completed text output, exit ReAct loop
        shouldContinue = false;
      }
    }

    const finalText = loopResponse.text || "I couldn't generate a response. Please try again.";

    // Parse Suggested Next Actions out of the text response
    let replyText = finalText;
    let suggestedActions = [];
    const actionsRegex = /(?:###\s*)?Suggested\s+(?:next\s+)?actions:?\s*\n?((?:\s*[\-\*•]\s*[^\n]+\n?)+)/i;
    const matchActions = replyText.match(actionsRegex);
    if (matchActions) {
      const rawItems = matchActions[1].split(/[\-\*•]/);
      suggestedActions = rawItems
        .map(item => item.trim())
        .filter(item => item.length > 0 && item.length < 50);
      replyText = replyText.replace(actionsRegex, "").trim();
    }

    return {
      reply: replyText,
      actions: actionsExecuted,
      suggestedActions,
    };

  } catch (err) {
    console.warn("[Agent] Gemini API failed (using fallback offline router):", err.message);
    const offlineResult = await runOfflineAgent(userMessage, profile);
    
    // Parse offline result for suggested actions too
    let replyText = offlineResult.reply;
    let suggestedActions = [];
    const actionsRegex = /(?:###\s*)?Suggested\s+(?:next\s+)?actions:?\s*\n?((?:\s*[\-\*•]\s*[^\n]+\n?)+)/i;
    const matchActions = replyText.match(actionsRegex);
    if (matchActions) {
      const rawItems = matchActions[1].split(/[\-\*•]/);
      suggestedActions = rawItems
        .map(item => item.trim())
        .filter(item => item.length > 0 && item.length < 50);
      replyText = replyText.replace(actionsRegex, "").trim();
    }

    return {
      reply: replyText,
      actions: offlineResult.actions || [],
      suggestedActions,
    };
  }
}

module.exports = { runAgent };
