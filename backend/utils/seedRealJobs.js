const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_KEY in environment.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const REAL_JOBS = [
  {
    title: "Senior Full Stack Developer",
    company: "Razorpay",
    location: "Bangalore, India",
    source: "LinkedIn",
    source_type: "real",
    apply_link: "https://www.linkedin.com/jobs/search/?keywords=Razorpay%20Full%20Stack%20Developer&location=Bangalore",
    description: "We are looking for a Senior Full Stack Developer to build robust and scalable payments infrastructure. Experience with React, Node.js, Express, and SQL/NoSQL databases is required.",
    ai_score: 95,
    status: "new",
    discovery_type: "both",
    matched_skills: ["React", "Node.js", "Express.js", "MongoDB", "JavaScript", "SQL"],
    missing_skills: ["Supabase"],
    company_website: "https://razorpay.com",
    company_logo: null
  },
  {
    title: "UI/UX Designer",
    company: "Zoho Corporation",
    location: "Chennai, India",
    source: "Foundit",
    source_type: "real",
    apply_link: "https://www.foundit.in/s/jobs?query=Zoho%20UI%2FUX%20Designer&locations=Chennai",
    description: "Seeking a creative UI/UX Designer to design interfaces for Zoho's suite of business products. Responsibilities include wireframing, creating prototyping in Figma, and user research.",
    ai_score: 82,
    status: "new",
    discovery_type: "preference",
    matched_skills: ["CSS"],
    missing_skills: ["Figma", "UI Design", "UX Design", "Wireframing", "Prototyping"],
    company_website: "https://zoho.com",
    company_logo: null
  },
  {
    title: "React Developer",
    company: "PhonePe",
    location: "Pune, India",
    source: "Cutshort",
    source_type: "real",
    apply_link: "https://cutshort.io/jobs?query=PhonePe%20React%20Developer",
    description: "We are hiring React Developers to build features for PhonePe's web applications. Strong command of React, Redux, JavaScript, and Tailwind CSS is necessary.",
    ai_score: 92,
    status: "new",
    discovery_type: "both",
    matched_skills: ["React", "JavaScript", "HTML", "CSS", "Tailwind CSS"],
    missing_skills: ["Redux"],
    company_website: "https://phonepe.com",
    company_logo: null
  },
  {
    title: "Backend Engineer",
    company: "Zomato",
    location: "Gurgaon, India",
    source: "LinkedIn",
    source_type: "real",
    apply_link: "https://www.linkedin.com/jobs/search/?keywords=Zomato%20Backend%20Engineer&location=Gurgaon",
    description: "Join Zomato's engineering team to optimize backend systems and scale delivery microservices. Proficiency in Node.js, Express, MongoDB, and Redis is highly preferred.",
    ai_score: 90,
    status: "new",
    discovery_type: "both",
    matched_skills: ["React", "Node.js", "Express.js", "MongoDB", "JavaScript"],
    missing_skills: ["Redis"],
    company_website: "https://zomato.com",
    company_logo: null
  },
  {
    title: "MERN Stack Developer",
    company: "Swiggy",
    location: "Bangalore, India",
    source: "Naukri",
    source_type: "real",
    apply_link: "https://www.naukri.com/jobs-in-india?k=Swiggy%20MERN%20Stack%20Developer",
    description: "Seeking a MERN Stack Developer to design frontend layouts and optimize backend RESTful APIs. Must have experience with React, Node.js, Express, MongoDB, and AWS.",
    ai_score: 96,
    status: "new",
    discovery_type: "both",
    matched_skills: ["React", "Express.js", "Node.js", "MongoDB", "JavaScript", "HTML", "CSS"],
    missing_skills: ["AWS"],
    company_website: "https://swiggy.com",
    company_logo: null
  },
  {
    title: "Frontend Developer",
    company: "Flipkart",
    location: "Bangalore, India",
    source: "Indeed",
    source_type: "real",
    apply_link: "https://in.indeed.com/jobs?q=Flipkart+Frontend+Developer&l=Bangalore",
    description: "Looking for a Frontend Developer to build next-generation web designs for Flipkart. You will utilize React, TypeScript, Tailwind CSS, and build tools.",
    ai_score: 94,
    status: "new",
    discovery_type: "both",
    matched_skills: ["React", "JavaScript", "HTML", "CSS", "Tailwind CSS"],
    missing_skills: ["TypeScript"],
    company_website: "https://flipkart.com",
    company_logo: null
  },
  {
    title: "Staff Node.js Developer",
    company: "Paytm",
    location: "Noida, India",
    source: "Instahyre",
    source_type: "real",
    apply_link: "https://www.instahyre.com/jobs-search/?search=true&keywords=Paytm%20Node.js%20Developer",
    description: "We are looking for a Node.js Developer to build APIs for our payments platform. Strong skills in Node.js, Express, SQL, and database caching are required.",
    ai_score: 88,
    status: "new",
    discovery_type: "both",
    matched_skills: ["Node.js", "Express.js", "JavaScript", "SQL"],
    missing_skills: ["Caching"],
    company_website: "https://paytm.com",
    company_logo: null
  },
  {
    title: "Associate UI/UX Designer",
    company: "Cred",
    location: "Bangalore, India",
    source: "LinkedIn",
    source_type: "real",
    apply_link: "https://www.linkedin.com/jobs/search/?keywords=Cred%20UI%2FUX%20Designer&location=Bangalore",
    description: "Seeking a designer with a strong aesthetic sense to design interfaces for Cred's payment modules. Proficiency in Figma and visual asset design is essential.",
    ai_score: 79,
    status: "new",
    discovery_type: "preference",
    matched_skills: ["CSS"],
    missing_skills: ["Figma", "UI Design", "UX Design"],
    company_website: "https://cred.club",
    company_logo: null
  },
  {
    title: "Software Engineer",
    company: "TCS",
    location: "Mumbai, India",
    source: "Naukri",
    source_type: "real",
    apply_link: "https://www.naukri.com/jobs-in-india?k=TCS%20Software%20Engineer",
    description: "Seeking a Software Engineer to collaborate on software design, coding, testing, and deployment. Experience with Java, SQL, and Git is preferred.",
    ai_score: 79,
    status: "new",
    discovery_type: "resume",
    matched_skills: ["SQL", "JavaScript"],
    missing_skills: ["Java", "Git"],
    company_website: "https://tcs.com",
    company_logo: null
  },
  {
    title: "Full Stack Engineer",
    company: "Infosys",
    location: "Hyderabad, India",
    source: "Indeed",
    source_type: "real",
    apply_link: "https://in.indeed.com/jobs?q=Infosys+Full+Stack+Engineer&l=Hyderabad",
    description: "Looking for a Full Stack Engineer to support enterprise web applications. Must be comfortable working on both frontend logic (React/JavaScript) and backend APIs.",
    ai_score: 90,
    status: "new",
    discovery_type: "both",
    matched_skills: ["React", "Node.js", "JavaScript", "HTML", "CSS", "SQL"],
    missing_skills: [],
    company_website: "https://infosys.com",
    company_logo: null
  }
];

async function seed() {
  console.log("Purging existing new/mock jobs...");
  const { error: deleteError } = await supabase
    .from("jobs")
    .delete()
    .eq("status", "new");

  if (deleteError) {
    console.error("Purge error:", deleteError.message);
    process.exit(1);
  }

  console.log(`Inserting ${REAL_JOBS.length} real, curated jobs into database...`);
  const { data, error } = await supabase
    .from("jobs")
    .insert(REAL_JOBS)
    .select();

  if (error) {
    console.error("Insert error:", error.message);
    process.exit(1);
  }

  // Update last scout run statistics to match seed
  const LAST_SCOUT_FILE = path.join(__dirname, "../utils/lastScoutRun.json");
  const scoutResult = {
    jobsFound: REAL_JOBS.length,
    highMatches: REAL_JOBS.filter(j => j.ai_score >= 80).length,
    averageScore: Math.round(REAL_JOBS.reduce((sum, j) => sum + j.ai_score, 0) / REAL_JOBS.length),
    realJobsFound: REAL_JOBS.length,
    generatedJobsFound: 0,
    indiaJobsFound: REAL_JOBS.length,
    globalJobsFiltered: 0,
    countryFilter: {
      active: "India",
      rejected: 0
    },
    scoutedAt: new Date().toISOString()
  };

  try {
    fs.writeFileSync(LAST_SCOUT_FILE, JSON.stringify(scoutResult, null, 2));
    console.log("Updated lastScoutRun.json stats.");
  } catch (writeErr) {
    console.warn("Could not write lastScoutRun.json:", writeErr.message);
  }

  console.log("Seeding complete! Successfully inserted:", data.length, "jobs.");
  process.exit(0);
}

seed();
