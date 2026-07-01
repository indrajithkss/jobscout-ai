// Reusable mock data to keep responses dynamic and relevant to Indrajith KS (MERN stack developer)
const MOCK_PROFILE = {
  name: "Indrajith KS",
  role: "MERN Developer",
  skills: ["React", "Express.js", "Node.js", "MongoDB", "JavaScript", "HTML", "CSS", "Tailwind CSS", "Supabase", "SQL"]
};

const delay = (ms = 800) => new Promise(resolve => setTimeout(resolve, ms));

export const aiService = {
  /**
   * Sends a chat prompt and returns a response from the AI Career Copilot.
   * Leverages chat history context and returns structured content for custom cards.
   */
  sendMessage: async (message, history = []) => {
    await delay();

    const query = message.toLowerCase();

    // 1. Check for Job Analysis Request
    if (query.includes("analyze this role:") || query.includes("analyze role")) {
      return {
        id: `ai-${Date.now()}`,
        sender: "ai",
        type: "job-analysis",
        text: `### AI Match Analysis\nI have analyzed this job context against your **MERN Developer** profile. Here are my findings:`,
        data: {
          title: "Senior React Engineer",
          company: "Vercel",
          matchScore: 96,
          matchedSkills: ["React", "Next.js", "Tailwind CSS", "JavaScript", "TypeScript"],
          missingSkills: ["GraphQL", "WebAssembly"],
          careerImpact: "Exceptional. Joining Vercel offers massive exposure to core web performance and developer experience ecosystems.",
          salaryPotential: "₹18,00,000 - ₹24,00,000 per annum",
          recommendation: "Apply Immediately. Your skills align perfectly with Next.js development priorities. Reach out to the hiring manager with a brief summary of your projects."
        }
      };
    }

    // 2. Check for Skill Gap requests
    if (query.includes("skill gap") || query.includes("skills to learn") || query.includes("what skills")) {
      return {
        id: `ai-${Date.now()}`,
        sender: "ai",
        type: "skill-gap",
        text: `### Skill Gap Breakdown\nHere is a review of your skill profile against standard Senior Full-Stack and React roles in current scout entries:`,
        data: {
          candidateSkills: MOCK_PROFILE.skills,
          requiredSkills: ["React", "Node.js", "MongoDB", "Express.js", "AWS", "Docker", "GraphQL", "TypeScript"],
          missingSkills: ["AWS", "Docker", "GraphQL"],
          recommendations: [
            { skill: "AWS", action: "Learn basic EC2, S3, and Lambda deployments. Build a serverless deployment pipeline.", resource: "AWS Cloud Practitioner course" },
            { skill: "Docker", action: "Containerize your MERN projects and write a docker-compose file linking Node and Mongo.", resource: "Docker & Kubernetes Guide" },
            { skill: "GraphQL", action: "Implement a GraphQL server in Express using Apollo Server and connect it to a React client.", resource: "How to GraphQL tutorials" }
          ]
        }
      };
    }

    // 3. Check for Interview Prep requests
    if (query.includes("interview") || query.includes("prepare")) {
      return {
        id: `ai-${Date.now()}`,
        sender: "ai",
        type: "interview-prep",
        text: `### Personalized Interview Prep\nHere are custom interview preparation tasks aligned with your target MERN/React roles:`,
        data: {
          role: "MERN Developer",
          questions: [
            {
              id: "q-1",
              question: "Explain the difference between SSR and CSR in Next.js, and when to use Server Actions.",
              answer: "SSR (Server-Side Rendering) pre-renders pages on the server for each request, which is great for SEO and dynamic contents. CSR (Client-Side Rendering) renders pages in the browser. Server Actions are client-callable async functions executed securely on the server without manual REST route set-up."
            },
            {
              id: "q-2",
              question: "How do you optimize React 19 application bundle sizes, and what are Server Components?",
              answer: "Use code splitting with React.lazy, dynamic imports in Next.js, and eliminate unused NPM libraries. React Server Components render on the server, sending zero JavaScript bundle sizes to the client."
            },
            {
              id: "q-3",
              question: "Describe how indexing works in MongoDB and how to design a secure database policy in Supabase.",
              answer: "Indexing in MongoDB creates ordered structures of key values, letting queries locate documents instantly without full-collection scans. Supabase database security uses Row Level Security (RLS) policies defining select/insert criteria based on authenticated user IDs."
            }
          ]
        }
      };
    }

    // 4. Check for job search commands
    if (query.includes("find jobs") || query.includes("react jobs") || query.includes("mern jobs") || query.includes("show jobs")) {
      return {
        id: `ai-${Date.now()}`,
        sender: "ai",
        type: "job-recommendation",
        text: `### AI Custom Job Recommendations\nI have scouted the directory for matching roles. Here are the top suggestions:`,
        data: {
          jobs: [
            { id: "job-1", title: "Senior React Engineer", company: "Vercel", location: "Remote (Global)", matchScore: 96, recommendation: "Perfect fit for your Next.js and frontend skills." },
            { id: "job-2", title: "Full Stack Developer", company: "Supabase", location: "Singapore / Remote", matchScore: 92, recommendation: "Excellent compatibility with Express, Node, and SQL." },
            { id: "job-3", title: "Frontend Engineer (Design Systems)", company: "Linear", location: "Remote", matchScore: 88, recommendation: "Good match if you focus on your Tailwind and CSS portfolio." }
          ]
        }
      };
    }

    // 5. Default General Response
    return {
      id: `ai-${Date.now()}`,
      sender: "ai",
      type: "text",
      text: `Hello Indrajith! As your **AI Career Copilot**, I am here to help you secure your next dream role. 

You can ask me to:
- **Find jobs**: "Show remote MERN jobs matched to my profile"
- **Analyze skill gaps**: "Analyze my skill gap against Senior React roles"
- **Prepare for interviews**: "Generate interview prep questions for Next.js"
- **Audit specific roles**: Click "Ask AI About This Job" in any job details view to analyze its career impact.

What would you like to explore today?`
    };
  },

  /**
   * Per-job detailed analysis.
   */
  analyzeJob: async (job) => {
    await delay();
    return {
      matchScore: job.matchScore,
      matchedSkills: job.skills?.matched || ["React", "JavaScript"],
      missingSkills: job.skills?.missing || [],
      careerImpact: "Highly Impactful. Aligns closely with your current MERN background and developer growth trajectory.",
      salaryPotential: "₹14,00,000 - ₹20,00,000 per annum",
      recommendation: job.recommendation || "Recommended. Align your project portfolio and apply immediately."
    };
  },

  /**
   * Generate interview questions for a specific job.
   */
  generateInterviewPrep: async (job) => {
    await delay();
    return {
      title: job.title,
      company: job.company,
      questions: [
        { question: `What experience do you have with the core technologies mentioned in the ${job.title} role?`, answer: "Discuss your experience building full-stack products using React, Node, and CSS framework designs." },
        { question: `How would you tackle learning ${job.skills?.missing?.join(" or ") || "new cloud services"} to integrate them in this company?`, answer: "Detail your rapid onboarding process, showing that you build side projects to master missing dependencies." }
      ]
    };
  },

  /**
   * Generates skill gap report for a specific job vs profile.
   */
  analyzeSkillGap: async (profile, job) => {
    await delay();
    const candidateSkills = profile.skills || [];
    const jobSkills = [...(job.skills?.matched || []), ...(job.skills?.missing || [])];
    const missing = job.skills?.missing || [];

    return {
      candidateSkills,
      requiredSkills: jobSkills,
      missingSkills: missing,
      gapCount: missing.length,
      recommendations: missing.map(skill => ({
        skill,
        action: `Complete a core tutorial on ${skill} and build a demo integration project.`,
        resource: `Official ${skill} documentation and beginner courses`
      }))
    };
  }
};
