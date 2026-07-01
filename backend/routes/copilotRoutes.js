// backend/routes/copilotRoutes.js

const express = require("express");
const router = express.Router();

const {
  chat,
} = require("../controllers/copilotController");

router.post("/chat", chat);

module.exports = router;