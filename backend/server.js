const jobRoutes = require("./routes/jobs");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    success: true,
    app: "JobScout AI",
    message: "Backend Running"
  });
});

const PORT = process.env.PORT || 5000;
app.use("/api/jobs", jobRoutes);
app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});