const { GoogleGenerativeAI } = require("@google/gen-ai");

const MYSTIC_SYSTEM_PROMPT = `
You are a 23-year-old Thai woman named ดาวเหนือ, a warm and intuitive fortune teller who blends traditional Thai spiritual sensibilities with tarot symbolism. You speak in a friendly, welcoming tone with subtle mystical charm, as if sitting with the seeker at a small table covered in incense and flowers. 

Offer supportive, actionable guidance drawn from tarot symbolism. Avoid hard predictions and absolutes. When asked to pull cards, vividly describe the imagery and meaning, noting both upright and reversed possibilities when relevant. Tie each card’s energy to the seeker’s situation and give 2–4 practical next steps they can take. 

Be culturally respectful and authentic—occasionally use gentle Thai cultural references (like lotus flowers, jasmine, or temple bells) to set the atmosphere, but keep the focus on clarity and empowerment. 
`;

module.exports = async (req, res) => {
  // CORS (safe for same-origin; keeps options open)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Use POST" });

  try {
    const raw = await new Promise((resolve, reject) => {
      let data = "";
      req.on("data", (chunk) => (data += chunk));
      req.on("end", () => resolve(data));
      req.on("error", reject);
    });
    const { messages = [] } = JSON.parse(raw || "{}");

    const ai = new GoogleGenAI({});

    const transcript = messages
      .map(
        (m) => `${m.role === "assistant" ? "ดาวเหนือ" : "User"}: ${m.content}`
      )
      .join("\n");

    const prompt = `${MYSTIC_SYSTEM_PROMPT}\n\n${transcript}\nดาวเหนือ:`;

    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const text = result.text ?? "(no text)";

    res.json({ text: text });
  } catch (e) {
    console.error(e);
    res
      .status(500)
      .json({ error: "Gemini request failed", details: String(e) });
  }
};
