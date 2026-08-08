const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

module.exports = async (prompt, responseType = "json") => {
  try {
    const config = {};

    if (responseType === "json") {
      config.responseMimeType = "application/json";
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config,
    });

    let text = response.text.trim();

    text = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    if (responseType === "text") {
      return text;
    }

    try {
      return JSON.parse(text);
    } catch (err) {
      console.log(text);
      throw new Error("Gemini returned invalid JSON.");
    }
  } catch (err) {
    throw new Error(err.message);
  }
};