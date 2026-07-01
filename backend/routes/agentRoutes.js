const express = require("express");
const router = express.Router();
const { runAgent } = require("../services/agentService");

/**
 * POST /api/agent/chat
 * Main autonomous agent endpoint.
 * Body: { message: string, history: Array<{sender, text}> }
 */
router.post("/chat", async (req, res) => {
  const { message, history = [] } = req.body;

  if (!message || !message.trim()) {
    return res.status(400).json({ success: false, error: "Message is required." });
  }

  try {
    console.log(`[Agent] Received: "${message.substring(0, 80)}..."`);
    const result = await runAgent(message.trim(), history);

    res.json({
      success: true,
      reply: result.reply,
      actions: result.actions || [],
      suggestedActions: result.suggestedActions || [],
    });
  } catch (err) {
    console.error("[Agent] Error:", err.message);
    res.status(500).json({
      success: false,
      error: "Agent encountered an error. Please try again.",
    });
  }
});

module.exports = router;
