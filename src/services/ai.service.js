import { GoogleGenerativeAI } from '@google/generative-ai';
import { diffAnalyzerPrompt } from '../prompts/review.prompt.js';
import config from '../config/env.config.js';

class RateLimitedQueue {
  constructor(requestsPerMinute = 12) {
    this.queue = [];
    this.interval = (60 * 1000) / requestsPerMinute;
    this.processing = false;
  }

  add(fn) {
    return new Promise((resolve, reject) => {
      this.queue.push({ fn, resolve, reject });
      if (!this.processing) this._process();
    });
  }

  async _process() {
    this.processing = true;
    while (this.queue.length > 0) {
      const { fn, resolve, reject } = this.queue.shift();
      try {
        resolve(await fn());
      } catch (e) {
        reject(e);
      }
      if (this.queue.length > 0) {
        await new Promise((res) => setTimeout(res, this.interval));
      }
    }
    this.processing = false;
  }
}

const geminiQueue = new RateLimitedQueue(12); // 12 RPM — safely under free-tier 15 RPM

export class AIService {
  constructor() {
    this.modelName = config.ai.modelName;
    this.genAI = new GoogleGenerativeAI(config.ai.apiKey);
  }

  async getModel() {
    if (!this.genAI) return null;
    return this.genAI.getGenerativeModel({
      model: this.modelName,
      generationConfig: {
        responseMimeType: 'application/json',
      },
    });
  }

  async analyzeDiff(diff) {
    return geminiQueue.add(async () => {
      return await callWithRetry(async () => {
        console.log(`Analyzing diff using ${this.modelName}`);
        const model = await this.getModel();
        if (!model) throw new Error('AI Model not initialized');

        const prompt = diffAnalyzerPrompt(diff);
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
      });
    });
  }
}

async function callWithRetry(fn, retries = 3, baseDelay = 2000) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      const is429 = err?.message?.includes('429');
      const isLastAttempt = attempt === retries;

      if (is429 && !isLastAttempt) {
        const delay = baseDelay * Math.pow(2, attempt); // 2s → 4s → 8s
        console.warn(
          `[AI] Rate limited. Retrying in ${delay}ms... (attempt ${attempt + 1}/${retries})`,
        );
        await new Promise((res) => setTimeout(res, delay)); // wait loop for 2s, 4s, 8s
      } else {
        throw err; // non-429 error or out of retries
      }
    }
  }
}

export default new AIService();
