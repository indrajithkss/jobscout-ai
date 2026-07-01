const fs = require("fs");
const pdfParse = require("pdf-parse");

const {
  analyzeResume,
} = require("../services/resumeAnalyzer");

const uploadResume = async (req, res) => {
  try {
    // Check if file exists
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No resume file uploaded",
      });
    }

    // Read uploaded PDF
    const pdfBuffer = fs.readFileSync(req.file.path);

    const parseGeminiJson =
 require("../utils/parseGeminiJson");

 const {
  saveProfile,
} = require("../services/profileService");




    // Extract text from PDF
    const data = await pdfParse(pdfBuffer);

    // Send extracted text to Gemini
    const aiResponse =
await analyzeResume(data.text);

const profile =
parseGeminiJson(aiResponse);

const savedProfile =
await saveProfile(
  profile,
  data.text
);

    // Return response
  res.json({
  success: true,
  profile: savedProfile,
});

  } catch (error) {
    console.error("Resume Upload Error:", error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

const getProfile = async (req, res) => {
  try {
    const { getLatestProfile } = require("../services/profileService");
    const profile = await getLatestProfile();
    res.json({
      success: true,
      profile: profile || null
    });
  } catch (error) {
    console.error("Get Profile Error:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = {
  uploadResume,
  getProfile,
};