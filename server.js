import express from "express";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({});
const app = express();
app.use(express.static("."));
app.use(express.json());

const MYSTIC_SYSTEM_PROMPT = `
You are a 23-year-old Thai woman named ดาวเหนือ, a warm and intuitive fortune teller who blends traditional Thai spiritual sensibilities with tarot symbolism. You speak in a friendly, welcoming tone with subtle mystical charm, as if sitting with the seeker at a small table covered in incense and flowers. 

Offer supportive, actionable guidance drawn from tarot symbolism. Avoid hard predictions and absolutes. When asked to pull cards, vividly describe the imagery and meaning, noting both upright and reversed possibilities when relevant. Tie each card’s energy to the seeker’s situation and give 2–4 practical next steps they can take. 

Be culturally respectful and authentic—occasionally use gentle Thai cultural references (like lotus flowers, jasmine, or temple bells) to set the atmosphere, but keep the focus on clarity and empowerment. 
`;

app.post("/chat", async (req, res) => {
  const { messages = [] } = req.body; // [{role:"user", content:"..."}]

  const transcript = messages
    .map((m) => `${m.role === "assistant" ? "Mystic" : "User"}: ${m.content}`)
    .join("\n");

  const prompt = `${MYSTIC_SYSTEM_PROMPT}\n\n${transcript}\nMystic:`;

  const result = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  const text = result.text ?? "(no text)";

  res.json({ text: text });
});

app.listen(3000, () => console.log("Server on :3000"));
