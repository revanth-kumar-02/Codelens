import { GoogleGenerativeAI } from "@google/generative-ai";
import { AnalysisResult, AnalysisResultSchema } from '../types';

const API_KEYS = (import.meta.env.VITE_GEMINI_API_KEY || "").split(",").map((k: string) => k.trim()).filter(Boolean);
let currentKeyIndex = 0;

function getGenAI() {
  if (API_KEYS.length === 0) return null;
  return new GoogleGenerativeAI(API_KEYS[currentKeyIndex]);
}

class AIService {
  private lastSuccessfulModel: string | null = null;
  private isThrottled: boolean = false;

  private async sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private rotateKey() {
    if (API_KEYS.length > 1) {
      currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
      console.log(`Rotating to API Key #${currentKeyIndex + 1}`);
    }
  }

  private async executeWithFallback(prompt: string, priorityModel: string | null = null): Promise<string> {
    const models = [
      priorityModel,
      this.lastSuccessfulModel,
      "gemini-3.1-flash",
      "gemini-2.5-flash",
      "gemini-2.5-pro"
    ].filter((m, i, arr) => m && arr.indexOf(m) === i) as string[];

    if (this.isThrottled) {
      throw new Error("COOLDOWN: System is cooling down from rate limits. Please wait.");
    }

    let modelsTriedWithAllKeys = 0;
    let lastError = "";

    for (const m of models) {
      // CIRCUIT BREAKER: If we've already tried a model with all keys and failed, 
      // it's highly likely we are globally rate-limited. Stop immediately.
      let keysFailedForThisModel = 0;

      while (keysFailedForThisModel < API_KEYS.length) {
        const genAI = getGenAI();
        if (!genAI) throw new Error("API Key Missing");

        try {
          const model = genAI.getGenerativeModel({ model: m }, { apiVersion: 'v1' });
          const result = await model.generateContent(prompt);
          const responseText = result.response.text();
          
          if (responseText) {
            this.lastSuccessfulModel = m;
            return responseText;
          }
        } catch (err: any) {
          const msg = (err.message || "").toLowerCase();
          lastError = err.message;
          
          if (msg.includes("429") || msg.includes("quota")) {
            console.warn(`Model ${m} rate limited on Key ${currentKeyIndex + 1}.`);
            keysFailedForThisModel++;
            
            if (API_KEYS.length > 1) {
              this.rotateKey();
              continue; // Try SAME model with NEXT key
            } else {
              break; // Only one key, move to next model
            }
          }

          if (msg.includes("503") || msg.includes("service unavailable")) {
            await this.sleep(2000);
            keysFailedForThisModel++; // Count as a failure to avoid infinite loop
            continue; 
          }

          console.error(`AI Failure [${m}]:`, err.message);
          break; // Hard failure, try next model
        }
      }

      // If we got here, all keys failed for this specific model
      modelsTriedWithAllKeys++;
      if (modelsTriedWithAllKeys >= 1) {
        // If the first model failed with all keys, we are definitely out of quota.
        // Don't waste time with other models.
        break; 
      }
    }

    throw new Error("API Quota Fully Exhausted. Both keys are blocked. Please wait 5-10 minutes.");
  }

  async analyze(code: string, language: string, filename?: string, level: string = 'intermediate'): Promise<AnalysisResult> {
    const persona = {
      beginner: "STRICT PERSONA: Explain like I'm 5. Use simple words and real-world analogies (cooking, toys). NO technical jargon like 'modulo' or 'operator' unless you explain them with a simple story. Focus on what happens in plain English.",
      intermediate: "STRICT PERSONA: Technical Mentor. Focus on best practices, code readability, and common idioms. Explain why this approach is good/bad for a junior developer. Use technical terms correctly.",
      advanced: "STRICT PERSONA: Senior Software Architect. Analyze performance, memory efficiency, Big O complexity, security risks, and architectural patterns. Use deep technical language and assume the reader is an expert."
    }[level.toLowerCase() as 'beginner' | 'intermediate' | 'advanced'] || "Technical but accessible.";

    const prompt = `Analyze this ${language} code in "${filename || 'unnamed'}" using the following perspective: ${persona}

Return JSON ONLY matching this schema precisely:
{
  "score": 0-100,
  "good": ["point info"],
  "bad": ["issue info"],
  "issues": [{"id": "uuid", "type": "error|warning|suggestion", "title": "string", "line": "Line X", "description": "text", "snippet": "code block"}],
  "debug": {"errorTitle": "string", "fileLine": "string", "rootCause": "text", "suggestedFix": "text", "fixedCode": "code"},
  "explanation": {
    "whatItDoes": "A high-level summary of the code based on the persona rules.",
    "howItWorks": [{"title": "Step title in persona style", "description": "Detailed explanation using persona rules", "code": "optional"}],
    "proTip": "A value-add tip specific to the persona level"
  }
}

Code:
${code}`;

    const text = await this.executeWithFallback(prompt, "gemini-3.1-flash");
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Analysis engine returned invalid data structure.");
    
    const data = JSON.parse(jsonMatch[0]);
    const validated = AnalysisResultSchema.safeParse(data);
    if (!validated.success) throw new Error('Analysis result does not match expected format.');

    return validated.data;
  }

  private getCachedLang(code: string): string | null {
    const snippet = code.substring(0, 500);
    const cached = localStorage.getItem('codelens_lang_cache');
    if (cached) {
      try {
        const { c, l } = JSON.parse(cached);
        if (c === snippet) return l;
      } catch (e) {
        localStorage.removeItem('codelens_lang_cache');
      }
    }
    return null;
  }

  private setCachedLang(code: string, lang: string) {
    localStorage.setItem('codelens_lang_cache', JSON.stringify({
      c: code.substring(0, 500),
      l: lang
    }));
  }

  async detectLanguage(code: string): Promise<string> {
    const cached = this.getCachedLang(code);
    if (cached) return cached;
    
    const prompt = `Detect program language. Return ONLY one word: Python, JavaScript, TypeScript, Java, C++, C, HTML, CSS, Plaintext.\n\nCode snippet:\n${code.substring(0, 500)}`;
    try {
      const text = await this.executeWithFallback(prompt, "gemini-3.1-flash");
      const lang = text.trim();
      this.setCachedLang(code, lang);
      return lang;
    } catch (err) {
      return "plaintext";
    }
  }

  async chat(code: string, question: string, filename?: string, context?: any): Promise<string> {
    const prompt = `You are an expert debugger. Code context (${filename || 'unnamed'}):
${code}
Previous analysis: ${JSON.stringify(context || {})}
Question: ${question}`;
    return await this.executeWithFallback(prompt, "gemini-3.1-flash");
  }
}

export const aiService = new AIService();
