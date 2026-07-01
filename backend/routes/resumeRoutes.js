const express = require("express");

const router = express.Router();

const upload =
  require("../config/multer");

const {
  uploadResume,
  getProfile,
} = require("../controllers/resumeController");

router.post(
  "/upload",
  upload.single("resume"),
  uploadResume
);

router.get(
  "/profile",
  getProfile
);

module.exports = router;
