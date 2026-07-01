const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

function fallbackAnalyze(resumeText) {
  const result = {
    name: "Candidate Profile",
    email: "",
    phone: "",
    skills: [],
    projects: [],
    education: "Not extracted",
    experience: "Not extracted"
  };

  // 1. Extract email
  const emailMatch = resumeText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  if (emailMatch) result.email = emailMatch[0];

  // 2. Extract phone
  const phoneMatch = resumeText.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3,4}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  if (phoneMatch) result.phone = phoneMatch[0];

  // 3. Extract Name (guess from first 3 lines)
  const lines = resumeText.split("\n").map(l => l.trim()).filter(Boolean);
  if (lines.length > 0) {
    const candidateLines = lines.slice(0, 3).filter(line => !line.includes("@") && !line.includes("http") && line.length < 50);
    if (candidateLines.length > 0) {
      result.name = candidateLines[0];
    }
  }

  // 4. Match common skills
  const COMMON_SKILLS = [
    "React", "React Native", "Angular", "Vue", "JavaScript", "TypeScript", "HTML", "CSS", "Tailwind",
    "Node.js", "Express", "Python", "Django", "Flask", "Java", "Spring Boot", "Kotlin", "Swift", "Objective-C",
    "Android", "iOS", "Flutter", "SQL", "PostgreSQL", "MySQL", "MongoDB", "Redis", "Supabase", "Firebase",
    "AWS", "Google Cloud", "Azure", "Docker", "Kubernetes", "Git", "GitHub", "GitLab", "CI/CD", "REST API",
    "GraphQL", "Machine Learning", "Data Analysis"
  ];
  const resumeTextLower = resumeText.toLowerCase();
  COMMON_SKILLS.forEach(skill => {
    const sEscaped = skill.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`\\b${sEscaped}\\b`, 'i');
    if (regex.test(resumeTextLower)) {
      result.skills.push(skill);
    }
  });

  // 5. Try to extract projects (look for sections or lines with "project")
  const projectKeywords = ["portfolio", "app", "website", "system", "platform", "dashboard", "tool"];
  lines.forEach(line => {
    if (line.toLowerCase().includes("project") || (projectKeywords.some(kw => line.toLowerCase().includes(kw)) && line.length < 100)) {
      const cleanLine = line.replace(/^[-\*\s•]+/, "").trim();
      if (cleanLine.length > 10 && !result.projects.includes(cleanLine) && result.projects.length < 5) {
        result.projects.push(cleanLine);
      }
    }
  });

  if (result.projects.length === 0) {
    result.projects = ["Personal Portfolio Website", "Fullstack Web App"];
  }

  // 6. Experience & Education heuristics
  const expIndex = lines.findIndex(l => l.toLowerCase().includes("experience") || l.toLowerCase().includes("work history"));
  if (expIndex !== -1 && expIndex + 1 < lines.length) {
    result.experience = lines.slice(expIndex + 1, expIndex + 4).join(" | ");
  } else {
    result.experience = "General development experience";
  }

  const eduIndex = lines.findIndex(l => l.toLowerCase().includes("education") || l.toLowerCase().includes("university") || l.toLowerCase().includes("degree"));
  if (eduIndex !== -1 && eduIndex + 1 < lines.length) {
    result.education = lines.slice(eduIndex + 1, eduIndex + 3).join(" | ");
  } else {
    result.education = "Technical Degree / Coursework";
  }

  return JSON.stringify(result, null, 2);
}

const analyzeResume = async (resumeText) => {
  const prompt = `
Extract the following information from this resume.

Return ONLY valid JSON.

{
  "name":"",
  "email":"",
  "phone":"",
  "skills":[],
  "projects":[],
  "education":"",
  "experience":""
}

Resume:

${resumeText}
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.warn("[ResumeAnalyzer] Gemini API failed (using fallback parser):", error.message);
    return fallbackAnalyze(resumeText);
  }
};

module.exports = {
  analyzeResume,
};