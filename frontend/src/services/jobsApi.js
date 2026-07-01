// Mock dataset representing JobScout AI parsed jobs
const MOCK_JOBS = [
  {
    id: "job-1",
    title: "Senior React Engineer",
    company: "Vercel",
    logoUrl: "https://avatar.vercel.sh/vercel",
    location: "Remote (Global)",
    matchScore: 96,
    status: "Saved", // Saved, Applied, Interview, Rejected, Offer, None
    source: "Y Combinator",
    createdAt: "2 hours ago",
    description: "We are looking for a Senior React Engineer to help us build the future of the Web. You will design, build, and optimize core parts of our dashboard, working closely with the design team and developers worldwide. Experience with micro-frontends and SSR optimization is a major plus.",
    skills: {
      matched: ["React", "Next.js", "Tailwind CSS", "JavaScript", "TypeScript"],
      missing: ["GraphQL", "WebAssembly"],
    },
    recommendation: "Apply Immediately. Excellent skill alignment and cultural fit.",
    applyUrl: "https://vercel.com/careers/senior-react"
  },
  {
    id: "job-2",
    title: "Full Stack Developer",
    company: "Supabase",
    logoUrl: "https://avatar.vercel.sh/supabase",
    location: "Singapore / Remote",
    matchScore: 92,
    status: "Applied",
    source: "LinkedIn",
    createdAt: "5 hours ago",
    description: "Join the team building the open-source Firebase alternative. You will build and scale backend Express APIs, database configurations, and interactive management panels in React. Solid PostgreSQL design experience is highly valued.",
    skills: {
      matched: ["React", "Express.js", "Supabase", "Node.js", "PostgreSQL"],
      missing: ["Go", "Docker"],
    },
    recommendation: "Apply Immediately. High backend stack compatibility.",
    applyUrl: "https://supabase.com/careers"
  },
  {
    id: "job-3",
    title: "Frontend Engineer (Design Systems)",
    company: "Linear",
    logoUrl: "https://avatar.vercel.sh/linear",
    location: "Remote (Europe/US)",
    matchScore: 88,
    status: "Interview",
    source: "GitHub Jobs",
    createdAt: "1 day ago",
    description: "Linear is looking for a frontend developer with an eye for detail and design. You will implement sleek user interfaces, micro-animations, and reusable components that make our app feel fast, cohesive, and magical.",
    skills: {
      matched: ["React", "Tailwind CSS", "JavaScript", "CSS"],
      missing: ["Figma", "Storybook"],
    },
    recommendation: "Highly Recommended. Strong fit for frontend UI design capability.",
    applyUrl: "https://linear.app/careers"
  },
  {
    id: "job-4",
    title: "Node.js Backend Developer",
    company: "StartupX",
    logoUrl: "https://avatar.vercel.sh/startupx",
    location: "Bangalore, India",
    matchScore: 84,
    status: "Offer",
    source: "Indeed",
    createdAt: "1 day ago",
    description: "We are a high-growth AI startup looking for an experienced backend developer. You will build highly concurrent REST APIs, manage web scraping systems, and design complex schemas using Node.js, Express, and MongoDB.",
    skills: {
      matched: ["Node.js", "Express.js", "MongoDB", "JavaScript"],
      missing: ["Redis", "AWS"],
    },
    recommendation: "Highly Recommended. Matches backend stack requirements perfectly.",
    applyUrl: "https://startupx.io/apply"
  },
  {
    id: "job-5",
    title: "Product Designer",
    company: "Notion",
    logoUrl: "https://avatar.vercel.sh/notion",
    location: "San Francisco, CA",
    matchScore: 78,
    status: "Saved",
    source: "LinkedIn",
    createdAt: "2 days ago",
    description: "Notion is looking for a Product Designer to design beautiful interfaces for document organization, collaborative editors, and workspace organization tools. You should excel at wireframing and interactive prototyping.",
    skills: {
      matched: ["CSS", "Figma", "User Experience (UX)"],
      missing: ["React", "Tailwind CSS"],
    },
    recommendation: "Recommended. Focus on showcasing custom CSS and layout design portfolios.",
    applyUrl: "https://notion.so/careers"
  },
  {
    id: "job-6",
    title: "Software Engineer",
    company: "Stripe",
    logoUrl: "https://avatar.vercel.sh/stripe",
    location: "Remote (APAC)",
    matchScore: 72,
    status: "None",
    source: "Y Combinator",
    createdAt: "3 days ago",
    description: "Work on Stripe's developer platforms. Build secure and compliant billing APIs, client libraries, and user onboarding flows that power internet businesses worldwide.",
    skills: {
      matched: ["JavaScript", "Node.js", "TypeScript"],
      missing: ["Ruby", "Go", "Docker", "Kubernetes"],
    },
    recommendation: "Needs Review. Moderate stack alignment; requires learning Ruby or Go.",
    applyUrl: "https://stripe.com/jobs"
  },
  {
    id: "job-7",
    title: "DevOps Architect",
    company: "HashiCorp",
    logoUrl: "https://avatar.vercel.sh/hashicorp",
    location: "Remote (Global)",
    matchScore: 54,
    status: "Rejected",
    source: "LinkedIn",
    createdAt: "4 days ago",
    description: "Scale HashiCorp's infrastructure systems. Manage production servers, configure Kubernetes nodes, build deployment scripts, and lead automation tasks. Deep interest in cloud security required.",
    skills: {
      matched: ["Docker"],
      missing: ["AWS", "Kubernetes", "Terraform", "Go", "CI/CD"],
    },
    recommendation: "Not Recommended. Core skills miss exceeds 80%.",
    applyUrl: "https://hashicorp.com/jobs"
  },
  {
    id: "job-8",
    title: "React Developer (Junior)",
    company: "TechCorp",
    logoUrl: "https://avatar.vercel.sh/techcorp",
    location: "Remote",
    matchScore: 65,
    status: "None",
    source: "Indeed",
    createdAt: "5 days ago",
    description: "Looking for an entry-level React developer to assist in updating consumer landing pages and building basic dashboard widgets. Mentorship will be provided by senior engineers.",
    skills: {
      matched: ["React", "CSS", "JavaScript"],
      missing: ["TypeScript", "Next.js"],
    },
    recommendation: "Needs Review. Good junior opportunity, matches core React skills.",
    applyUrl: "https://techcorp.com/jobs"
  }
];

// Helper to simulate network latency
const delay = (ms = 400) => new Promise(resolve => setTimeout(resolve, ms));

export const jobsApi = {
  getJobs: async () => {
    await delay();
    return [...MOCK_JOBS];
  },

  getSavedJobs: async () => {
    await delay();
    return MOCK_JOBS.filter(job => job.status === "Saved");
  },

  getAppliedJobs: async () => {
    await delay();
    return MOCK_JOBS.filter(job => ["Applied", "Interview", "Rejected", "Offer"].includes(job.status));
  },

  getAnalytics: async () => {
    await delay();
    
    const totalFound = 47; // Hardcoded examples requested by prompt
    const highMatch = 18;
    const saved = 11;
    const applied = 6;
    
    // Status breakdown for Kanban / Analytics
    const pipeline = {
      applied: MOCK_JOBS.filter(j => j.status === "Applied").length,
      interview: MOCK_JOBS.filter(j => j.status === "Interview").length,
      rejected: MOCK_JOBS.filter(j => j.status === "Rejected").length,
      offer: MOCK_JOBS.filter(j => j.status === "Offer").length,
    };

    // Calculate rates (mocked rates for layout)
    const interviewRate = 45; // 45%
    const offerRate = 18; // 18%

    // Timeline data for mock charts
    const monthlyApplications = [
      { month: "Jan", found: 28, applied: 3, interviews: 1, offers: 0 },
      { month: "Feb", found: 35, applied: 4, interviews: 2, offers: 0 },
      { month: "Mar", found: 42, applied: 5, interviews: 1, offers: 1 },
      { month: "Apr", found: 49, applied: 7, interviews: 3, offers: 0 },
      { month: "May", found: 56, applied: 8, interviews: 4, offers: 1 },
      { month: "Jun", found: totalFound, applied: applied, interviews: pipeline.interview, offers: pipeline.offer }
    ];

    return {
      stats: {
        totalFound,
        highMatch,
        saved,
        applied,
        interviewRate,
        offerRate
      },
      pipeline,
      monthlyApplications
    };
  }
};
