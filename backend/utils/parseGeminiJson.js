const parseGeminiJson = (text) => {
  try {
    const cleaned = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    return JSON.parse(cleaned);
  } catch (error) {
    console.error("JSON Parse Error:", error);

    return null;
  }
};

module.exports = parseGeminiJson;