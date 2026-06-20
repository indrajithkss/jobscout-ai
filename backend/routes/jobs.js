const express = require("express");
const router = express.Router();

const supabase = require("../config/supabase");

router.get("/", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("jobs")
      .select("*");

    if (error) {
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }

    res.json({
      success: true,
      jobs: data,
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

module.exports = router;
router.post("/seed", async (req, res) => {
  try {

    const { data, error } =
      await supabase
        .from("jobs")
        .insert([
          {
            title: "Full Stack Developer",

            company: "ABC Technologies",

            location: "Bangalore",

            source: "Wellfound",

            apply_link:
              "https://example.com",

            description:
              "React + Node.js Developer",

            ai_score: 90,

            status: "new"
          }
        ])
        .select();

    if (error) {
      return res.status(500).json(error);
    }

    res.json({
      success: true,
      data
    });

  } catch (err) {

    res.status(500).json({
      error: err.message
    });

  }
});