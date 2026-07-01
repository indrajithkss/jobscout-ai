// backend/controllers/copilotController.js

const geminiService = require("../services/geminiService");

const chat = async (req, res) => {
  try {
    const { message } = req.body;

    const reply = await geminiService.sendMessage(message);

    res.json({
      success: true,
      reply,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "AI Error",
    });
  }
};

module.exports = {
  chat,
};