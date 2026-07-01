const express = require("express");

const router = express.Router();

const {
  savePreferences,
  getPreferences,
  previewSearchPlan,
} = require("../controllers/jobPreferencesController");

router.post("/", savePreferences);

router.get("/", getPreferences);

router.post("/preview-search-plan", previewSearchPlan);

module.exports = router;