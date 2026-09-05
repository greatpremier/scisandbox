import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const PORT = 3000;

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: "5mb" }));

  // API Routes
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // AI Lab Research Assistant Endpoint
  app.post("/api/lab-ai/analyze", async (req, res) => {
    try {
      const { discipline, experimentTitle, parameters, measurements, dataPoints, userPrompt, analysisType } = req.body;

      const ai = getGeminiClient();
      if (!ai) {
        // Safe fallback simulation response if GEMINI_API_KEY is not configured
        return res.json({
          success: true,
          analysis: `[Standard Analytical Engine] Observed ${discipline} trial for "${experimentTitle}". Parameters: ${JSON.stringify(
            parameters
          )}. Measurements recorded: ${JSON.stringify(
            measurements
          )}. Trends indicate standard theoretical behavior consistent with classical models. For full generative AI insights, configure GEMINI_API_KEY in the Secrets panel.`,
        });
      }

      const prompt = `You are an expert university research scientist and virtual laboratory mentor.
Analyze the following laboratory experiment data and respond with rigorous scientific insights, empirical equations, trend evaluation, and practical lab conclusions.

Discipline: ${discipline}
Experiment: ${experimentTitle}
Mode: ${analysisType || "Data & Hypothesis Analysis"}
Current Parameters: ${JSON.stringify(parameters, null, 2)}
Latest Measurements: ${JSON.stringify(measurements, null, 2)}
Recorded Data Sample: ${JSON.stringify(dataPoints?.slice(-15) || [], null, 2)}
Researcher Question/Notes: ${userPrompt || "Provide a thorough scientific evaluation of this experiment run, including mathematical fit, error sources, and practical implications."}

Format your response clearly with:
1. Executive Summary & Observed Phenomenon
2. Mathematical & Theoretical Modeling (cite relevant laws, e.g. Arrhenius, Newton/Kinematics, Michaelis-Menten, Beer-Lambert)
3. Quantitative Data Interpretation (rate of change, inflection points, asymptotes, efficiency)
4. Potential Experimental Errors & Sensitivity Analysis
5. Next Recommended Trial Variations`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are an elite scientific laboratory advisor assisting students and researchers in physics, chemistry, and biology virtual experiments. Be articulate, precise with units, and mathematically rigorous.",
        },
      });

      res.json({
        success: true,
        analysis: response.text,
      });
    } catch (error: any) {
      console.error("AI Analysis error:", error);
      res.status(500).json({
        success: false,
        error: error?.message || "Failed to analyze experiment data.",
      });
    }
  });

  // AI Formal Lab Report Generator Endpoint
  app.post("/api/lab-ai/report", async (req, res) => {
    try {
      const { discipline, experimentTitle, parameters, measurements, trials, notes } = req.body;

      const ai = getGeminiClient();
      if (!ai) {
        return res.json({
          success: true,
          report: `# Laboratory Report: ${experimentTitle}\n\n**Discipline:** ${discipline}\n**Date:** ${new Date().toLocaleDateString()}\n\n## Summary\nExperiment executed successfully with recorded parameters: ${JSON.stringify(
            parameters
          )}.\n\n*Note: Configure GEMINI_API_KEY in Settings > Secrets for deep generative lab report drafting.*`,
        });
      }

      const prompt = `Generate a formal scientific laboratory report based on this virtual experiment:
Experiment Title: ${experimentTitle}
Discipline: ${discipline}
Controlled Parameters: ${JSON.stringify(parameters, null, 2)}
Recorded Final Data: ${JSON.stringify(measurements, null, 2)}
Recorded Trials Summary: ${JSON.stringify(trials || [], null, 2)}
Lab Notes: ${notes || "None provided"}

Include the following standardized sections in clear Markdown:
# Lab Report: [Title]
## 1. Abstract & Objective
## 2. Theoretical Principles & Governing Equations
## 3. Experimental Apparatus & Methodology (Virtual Setup)
## 4. Empirical Data & Key Measurements
## 5. Mathematical Analysis & Calculations (with derived values)
## 6. Discussion of Systematic vs Random Errors
## 7. Conclusion & Scientific Verification`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
      });

      res.json({
        success: true,
        report: response.text,
      });
    } catch (error: any) {
      console.error("Lab Report generation error:", error);
      res.status(500).json({
        success: false,
        error: error?.message || "Failed to generate lab report.",
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`OmniLab server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
