require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

const jobPreferencesRoutes = require("./routes/jobPreferencesRoutes");
const jobRoutes = require("./routes/jobs");
const copilotRoutes = require("./routes/copilotRoutes");
const resumeRoutes = require("./routes/resumeRoutes");
const scoutRoutes = require("./routes/scoutRoutes");
const careerRoutes = require("./routes/careerRoutes");
const agentRoutes = require("./routes/agentRoutes");

app.use(cors());
app.use(express.json());

app.use("/api/resume", resumeRoutes);
app.use("/api/preferences", jobPreferencesRoutes);
app.use("/api/scout", scoutRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/copilot", copilotRoutes);
app.use("/api/career", careerRoutes);
app.use("/api/agent", agentRoutes);

app.get("/", (req, res) => {
  res.json({
    success: true,
    app: "JobScout AI",
    message: "Backend Running",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`[JobScout AI] Server running on port ${PORT}`);
  console.log(`[JobScout AI] Discovery providers: Remotive · Arbeitnow · The Muse (no API keys required)`);
});