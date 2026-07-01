const { getLatestProfile } = require("./profileService");
const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const sendMessage = async (message) => {

  let profileContext = "";

  try {

    const profile = await getLatestProfile();

    if (profile) {

      profileContext = `
Candidate Profile:

Name: ${profile.name}

Email: ${profile.email}

Skills:
${profile.skills?.join(", ")}

Projects:
${profile.projects?.join(", ")}

Education:
${profile.education}

Experience:
${profile.experience}

You are JobScout AI.

You are a personalized AI career coach.

Use the candidate profile above when answering.

Give career-specific guidance whenever possible.
`;

    }

  } catch (error) {

    console.error(
      "Profile Load Error:",
      error.message
    );

  }

  const finalPrompt = `
${profileContext}

User Question:
${message}
`;

  const response =
    await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: finalPrompt,
    });

  return response.text;
};

module.exports = {
  sendMessage,
};