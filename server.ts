import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import { analyzeJobPosting } from './src/utils/nlpEngine';
import { JobInput } from './src/types';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Primary Analysis Endpoint
app.post('/api/analyze', async (req, res) => {
  try {
    const { job, useGemini = false } = req.body as { job: JobInput; useGemini?: boolean };

    if (!job || !job.description) {
      return res.status(400).json({ error: 'Job description is required.' });
    }

    // Step 1: Run core EMSCAD ML + Rule-Based Engine
    const result = analyzeJobPosting(job);

    // Step 2: Optional Server-Side Gemini AI Deep Forensic Analysis
    if (useGemini && process.env.GEMINI_API_KEY) {
      try {
        const ai = new GoogleGenAI({
          apiKey: process.env.GEMINI_API_KEY,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            },
          },
        });

        const prompt = `You are a cybersecurity expert specializing in recruitment fraud and employment scams.
Analyze the following job posting that was classified as "${result.classification}" with a ${result.riskScore}% risk score by an EMSCAD-trained ML detector.

Title: ${job.title || 'N/A'}
Company: ${job.companyName || 'N/A'}
Location: ${job.location || 'N/A'}
Stated Salary: ${job.salaryStated || 'N/A'}
Contact Email: ${job.contactEmail || 'N/A'}
Website: ${job.companyWebsite || 'N/A'}

Job Description:
${job.description.slice(0, 2500)}

Company Profile:
${job.companyProfile || 'None provided'}

Provide a 2-3 paragraph forensic assessment:
1. Identify any subtle deception techniques (domain impersonation, fake check/equipment schemes, advance-fee lures, Telegram/WhatsApp interview tactics).
2. Assess legitimacy of the compensation relative to duties.
3. Provide 2 actionable verification steps the candidate should take before responding. Keep the tone objective and professional.`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
        });

        const geminiText = response.text;
        if (geminiText) {
          result.geminiExplanation = geminiText;
          result.engineUsed = 'ml_rules_gemini_augmented';
        }
      } catch (geminiErr: any) {
        console.warn('Gemini enrichment skipped:', geminiErr?.message);
        // Seamlessly fall back to core ML result
      }
    }

    return res.json({ success: true, result });
  } catch (error: any) {
    console.error('Analysis error:', error);
    return res.status(500).json({ error: error?.message || 'Failed to analyze job posting' });
  }
});

// Batch Analysis Endpoint
app.post('/api/batch-analyze', async (req, res) => {
  try {
    const { jobs } = req.body as { jobs: JobInput[] };
    if (!Array.isArray(jobs) || jobs.length === 0) {
      return res.status(400).json({ error: 'Array of jobs is required.' });
    }

    const results = jobs.slice(0, 50).map(job => ({
      job,
      result: analyzeJobPosting(job),
    }));

    return res.json({ success: true, results });
  } catch (error: any) {
    console.error('Batch analysis error:', error);
    return res.status(500).json({ error: 'Batch analysis failed' });
  }
});

// Vite middleware for development vs static build for production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Fake Job Posting Detector server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
