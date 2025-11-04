import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { request as httpsRequest } from "https";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

function buildPrompt({ name, goal, description }) {
  return [
    `You are an expert software architect and product strategist.`,
    `Generate pragmatic, step-by-step recommendations for a new project.`,
    `Keep it concise but specific with phased rollout and tech stack tradeoffs.`,
    "",
    `Project: ${name || "Untitled"}`,
    `Goal: ${goal || "N/A"}`,
    description ? `Context: ${description}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

function callGemini(apiKey, prompt) {
  return new Promise((resolve, reject) => {
    const url = new URL(GEMINI_ENDPOINT);
    url.searchParams.set("key", apiKey);

    const payload = JSON.stringify({
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
    });

    const req = httpsRequest(
      url,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(payload),
        },
      },
      (resp) => {
        let data = "";
        resp.on("data", (chunk) => (data += chunk));
        resp.on("end", () => {
          try {
            const json = JSON.parse(data || "{}");
            resolve(json);
          } catch (e) {
            reject(e);
          }
        });
      }
    );

    req.on("error", reject);
    req.write(payload);
    req.end();
  });
}

app.post("/generate", async (req, res) => {
  const { name, goal, description } = req.body || {};
  const apiKey = process.env.GEMINI_API_KEY;

  // Mock fallback content
  const mock = `
Project: ${name || "Untitled"}
Goal: ${goal || "N/A"}

Top recommendations:
1) Data model & storage
   - Start with PostgreSQL (or MySQL if required)
   - Use SQLAlchemy/Prisma to avoid vendor lock-in
2) Backend
   - Python FastAPI (lightweight) or Node/Express
   - Add JWT auth + role-based access
3) ETL / Analytics
   - Ingest CSV/API feeds; schedule jobs with cron
   - Basic KPIs: daily volume, error rate, time-to-insight
4) Frontend
   - Your current React + Tailwind shell is perfect
5) Next steps (2 weeks)
   - Day 1–2: schema + API skeleton
   - Day 3–5: CRUD + auth
   - Week 2: dashboards + tests
`.trim();

  if (!apiKey) {
    return res.json({ text: mock, source: "mock" });
  }

  try {
    const prompt = buildPrompt({ name, goal, description });
    const json = await callGemini(apiKey, prompt);

    const text =
      json?.candidates?.[0]?.content?.parts
        ?.map((p) => p?.text)
        .filter(Boolean)
        .join("\n") || "";

    if (!text) {
      return res.json({ text: mock, source: "mock" });
    }
    return res.json({ text, source: "gemini" });
  } catch (err) {
    console.error("Gemini error:", err);
    return res.json({ text: mock, source: "mock" });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
