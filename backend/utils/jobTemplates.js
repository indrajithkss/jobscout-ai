const JOB_TEMPLATES = [
  {
    title: "Full Stack Developer",
    company: "Vercel",
    location: "San Francisco",
    remote_allowed: true,
    source: "LinkedIn",
    apply_link: "https://vercel.com/careers",
    description: "Build next-generation hosting platforms. Experience with React, Node.js, Next.js, and TypeScript is highly preferred.",
    required_skills: ["React", "Node.js", "Next.js", "TypeScript", "JavaScript", "HTML", "CSS"]
  },
  {
    title: "Backend Engineer",
    company: "Stripe",
    location: "Remote",
    remote_allowed: true,
    source: "Wellfound",
    apply_link: "https://stripe.com/jobs",
    description: "Design and implement robust APIs for financial infrastructure. Strong skills in Node.js, Go, Python, and SQL databases.",
    required_skills: ["Node.js", "Python", "Go", "SQL", "APIs", "Database", "Backend"]
  },
  {
    title: "React Developer",
    company: "Airbnb",
    location: "San Francisco",
    remote_allowed: false,
    source: "Glassdoor",
    apply_link: "https://airbnb.com/careers",
    description: "Join the core frontend team working on modern UI features. Mastery of React, JavaScript, HTML, CSS, and Tailwind CSS is key.",
    required_skills: ["React", "JavaScript", "HTML", "CSS", "Tailwind CSS", "Redux"]
  },
  {
    title: "Software Engineer",
    company: "Google",
    location: "Bangalore",
    remote_allowed: false,
    source: "LinkedIn",
    apply_link: "https://google.com/about/careers",
    description: "Solve complex architectural problems at scale. Strong algorithms, data structures, Java, Python, or C++ experience.",
    required_skills: ["Java", "Python", "Algorithms", "Data Structures", "C++", "System Design"]
  },
  {
    title: "Frontend Engineer",
    company: "Figma",
    location: "San Francisco",
    remote_allowed: true,
    source: "Indeed",
    apply_link: "https://figma.com/careers",
    description: "Develop the future of design tools. Proficiency in React, TypeScript, Canvas, WebGL, WebAssembly, and CSS.",
    required_skills: ["React", "TypeScript", "WebGL", "CSS", "HTML", "JavaScript"]
  },
  {
    title: "Node.js Developer",
    company: "Netflix",
    location: "Los Angeles",
    remote_allowed: true,
    source: "Wellfound",
    apply_link: "https://netflix.com/careers",
    description: "Optimize server-side performance for high-throughput video delivery. Node.js, Express, Redis, and AWS experience requested.",
    required_skills: ["Node.js", "Express", "Redis", "AWS", "Backend", "APIs"]
  },
  {
    title: "Python Developer",
    company: "OpenAI",
    location: "San Francisco",
    remote_allowed: false,
    source: "LinkedIn",
    apply_link: "https://openai.com/careers",
    description: "Scale machine learning training pipelines and construct reliable APIs. Strong Python, PyTorch, Docker, and Kubernetes.",
    required_skills: ["Python", "PyTorch", "Docker", "Kubernetes", "APIs", "AI"]
  },
  {
    title: "DevOps Engineer",
    company: "HashiCorp",
    location: "Remote",
    remote_allowed: true,
    source: "Indeed",
    apply_link: "https://hashicorp.com/jobs",
    description: "Automate global infrastructure deployments. Terraform, Kubernetes, AWS, GCP, CI/CD, and bash scripting.",
    required_skills: ["Terraform", "Kubernetes", "AWS", "GCP", "CI/CD", "Docker"]
  },
  {
    title: "Machine Learning Engineer",
    company: "Meta",
    location: "Menlo Park",
    remote_allowed: false,
    source: "LinkedIn",
    apply_link: "https://meta.com/careers",
    description: "Train large-scale recommender and generative models. Python, PyTorch, PySpark, and distributed training systems.",
    required_skills: ["Python", "PyTorch", "PySpark", "Machine Learning", "AI", "Algorithms"]
  },
  {
    title: "Data Scientist",
    company: "Uber",
    location: "Bangalore",
    remote_allowed: false,
    source: "Glassdoor",
    apply_link: "https://uber.com/careers",
    description: "Analyze market dynamics, pricing mechanics, and driver dispatching. Python, R, SQL, and statistical modeling.",
    required_skills: ["Python", "SQL", "Statistics", "R", "Data Analysis", "Machine Learning"]
  },
  {
    title: "iOS Developer",
    company: "Apple",
    location: "Cupertino",
    remote_allowed: false,
    source: "LinkedIn",
    apply_link: "https://apple.com/jobs",
    description: "Craft stunning iOS applications in Swift and SwiftUI. Deep understanding of CoreData, memory management, and UIKit.",
    required_skills: ["Swift", "SwiftUI", "iOS", "Xcode", "UIKit", "Git"]
  },
  {
    title: "Android Developer",
    company: "Spotify",
    location: "Stockholm",
    remote_allowed: true,
    source: "Wellfound",
    apply_link: "https://spotify.com/jobs",
    description: "Create premium listening experiences on Android. Kotlin, Jetpack Compose, Coroutines, and clean architecture.",
    required_skills: ["Kotlin", "Android", "Jetpack Compose", "Coroutines", "Git"]
  },
  {
    title: "QA Automation Engineer",
    company: "Slack",
    location: "Remote",
    remote_allowed: true,
    source: "Indeed",
    apply_link: "https://slack.com/careers",
    description: "Build automated integration and regression suites using Playwright, Cypress, Selenium, or WebdriverIO with JavaScript.",
    required_skills: ["Playwright", "Cypress", "Selenium", "JavaScript", "Testing", "QA"]
  },
  {
    title: "Product Manager",
    company: "Notion",
    location: "San Francisco",
    remote_allowed: false,
    source: "LinkedIn",
    apply_link: "https://notion.so/careers",
    description: "Drive the roadmap for Notion AI and collaboration features. Strong leadership, analytic capabilities, and product vision.",
    required_skills: ["Product Strategy", "Roadmapping", "Agile", "SQL", "Communication"]
  },
  {
    title: "UI/UX Designer",
    company: "Linear",
    location: "Remote",
    remote_allowed: true,
    source: "Wellfound",
    apply_link: "https://linear.app/careers",
    description: "Design flawless workflows and visually spectacular, pixel-perfect user interfaces in Figma. HTML/CSS knowledge is a plus.",
    required_skills: ["Figma", "UI Design", "UX Design", "Wireframing", "Prototyping", "CSS"]
  },
  {
    title: "Cloud Architect",
    company: "Microsoft",
    location: "Seattle",
    remote_allowed: false,
    source: "LinkedIn",
    apply_link: "https://microsoft.com/careers",
    description: "Architect secure enterprise hybrid-cloud environments with Azure, active directory, and infrastructure-as-code.",
    required_skills: ["Azure", "Cloud Architecture", "Active Directory", "Terraform", "Security"]
  },
  {
    title: "Security Engineer",
    company: "Cloudflare",
    location: "San Francisco",
    remote_allowed: true,
    source: "Glassdoor",
    apply_link: "https://cloudflare.com/careers",
    description: "Defend networking layer from DDoS and implement zero-trust protocols. Go, Rust, networking, and cryptography.",
    required_skills: ["Go", "Rust", "Networking", "Cryptography", "Security", "Linux"]
  },
  {
    title: "Systems Engineer",
    company: "Cloudflare",
    location: "Austin",
    remote_allowed: false,
    source: "LinkedIn",
    apply_link: "https://cloudflare.com/careers",
    description: "Improve performance and scalability of global edge network routing services. Linux kernel, C, Go, and eBPF.",
    required_skills: ["C", "Go", "Linux", "eBPF", "Networking", "Systems Programming"]
  },
  {
    title: "Database Administrator",
    company: "Oracle",
    location: "Bangalore",
    remote_allowed: false,
    source: "Indeed",
    apply_link: "https://oracle.com/careers",
    description: "Manage scale, backup, recovery, and indexing optimizations for high-value Oracle databases.",
    required_skills: ["Oracle DB", "SQL", "Database tuning", "Backup & Recovery", "Linux"]
  },
  {
    title: "Technical Writer",
    company: "Postman",
    location: "Remote",
    remote_allowed: true,
    source: "Indeed",
    apply_link: "https://postman.com/careers",
    description: "Document complex APIs, workspace settings, and developer toolkits. Markdown, API testing, and basic Javascript.",
    required_skills: ["Markdown", "API Documentation", "JavaScript", "Postman", "Technical Writing"]
  }
];

module.exports = {
  JOB_TEMPLATES
};
