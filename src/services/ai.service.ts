import Groq from "groq-sdk";
import { AnalysisResult, AnalysisResultSchema } from '../types';

const API_KEY = import.meta.env.VITE_GROQ_API_KEY || "";

function getGroqClient() {
  if (!API_KEY) return null;
  return new Groq({ apiKey: API_KEY, dangerouslyAllowBrowser: true });
}

class AIService {
  private lastSuccessfulModel: string | null = null;

  private async sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async executeWithFallback(prompt: string, priorityModel: string | null = null): Promise<string> {
    const models = [
      priorityModel,
      this.lastSuccessfulModel,
      "qwen-qwq-32b",
      "llama-3.3-70b-versatile",
      "llama-3.1-8b-instant"
    ].filter((m, i, arr) => m && arr.indexOf(m) === i) as string[];

    const groq = getGroqClient();
    if (!groq) throw new Error("Groq API Key Missing. Add VITE_GROQ_API_KEY to .env");

    let lastError = "";

    for (const model of models) {
      try {
        const completion = await groq.chat.completions.create({
          messages: [{ role: "user", content: prompt }],
          model: model,
          temperature: 0.3,
          max_tokens: 4096,
        });

        const responseText = completion.choices?.[0]?.message?.content;
        if (responseText) {
          this.lastSuccessfulModel = model;
          return responseText;
        }
      } catch (err: any) {
        const msg = (err.message || "").toLowerCase();
        lastError = err.message;

        if (msg.includes("429") || msg.includes("rate_limit")) {
          console.warn(`Model ${model} rate limited, trying next...`);
          await this.sleep(1000);
          continue;
        }

        if (msg.includes("503") || msg.includes("service unavailable")) {
          console.warn(`Model ${model} unavailable, trying next...`);
          await this.sleep(2000);
          continue;
        }

        console.error(`AI Failure [${model}]:`, err.message);
        continue; // Try next model
      }
    }

    throw new Error(lastError || "All AI models failed. Please try again in a moment.");
  }

  async analyze(code: string, language: string, filename?: string, level: string = 'intermediate'): Promise<AnalysisResult> {
    const persona = {
      beginner: "STRICT PERSONA: Explain like I'm 5. Use simple words and real-world analogies (cooking, toys). NO technical jargon like 'modulo' or 'operator' unless you explain them with a simple story. Focus on what happens in plain English.",
      intermediate: "STRICT PERSONA: Technical Mentor. Focus on best practices, code readability, and common idioms. Explain why this approach is good/bad for a junior developer. Use technical terms correctly.",
      advanced: "STRICT PERSONA: Senior Software Architect. Analyze performance, memory efficiency, Big O complexity, security risks, and architectural patterns. Use deep technical language and assume the reader is an expert."
    }[level.toLowerCase() as 'beginner' | 'intermediate' | 'advanced'] || "Technical but accessible.";

    const prompt = `Analyze this ${language} code in "${filename || 'unnamed'}" using the following perspective: ${persona}

Return JSON ONLY matching this schema precisely (no markdown, no explanation, ONLY the raw JSON object):
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

    const text = await this.executeWithFallback(prompt, "qwen-qwq-32b");
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
      const text = await this.executeWithFallback(prompt, "llama-3.1-8b-instant");
      const lang = text.trim().split('\n')[0].trim();
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
    return await this.executeWithFallback(prompt, "qwen-qwq-32b");
  }

  async explain(code: string, language: string, level: string, filename?: string): Promise<{
    whatItDoes: string;
    howItWorks: { title: string; description: string; code?: string }[];
    proTip: string;
  }> {
    const personas: Record<string, string> = {
      beginner: `You are explaining code to a COMPLETE BEGINNER who has NEVER programmed before.
Rules:
- Use everyday analogies (cooking recipes, building blocks, toy boxes, traffic lights)
- Explain EVERY concept as if talking to a curious 10-year-old
- NO technical jargon without a simple analogy first
- Use phrases like "Think of it like...", "Imagine you have..."
- Keep sentences short and friendly
- The "proTip" should be an encouraging, fun tip for beginners`,

      intermediate: `You are a TECHNICAL MENTOR explaining code to a junior developer (1-2 years experience).
Rules:
- Use proper technical terms (variables, functions, conditionals, loops)
- Focus on WHY things are done this way, not just WHAT
- Mention best practices, naming conventions, and common patterns
- Compare to industry standards
- The "proTip" should be a practical best-practice they can apply immediately`,

      advanced: `You are a SENIOR SOFTWARE ARCHITECT reviewing code for a seasoned engineer.
Rules:
- Analyze computational complexity (Big O notation)
- Discuss memory allocation, performance implications, and edge cases
- Mention design patterns, SOLID principles, security vulnerabilities
- Suggest architectural improvements and scalability concerns
- Reference language-specific optimizations and internals
- The "proTip" should be a deep technical insight about optimization or architecture`
    };

    const persona = personas[level.toLowerCase()] || personas.intermediate;

    const prompt = `${persona}

Analyze this ${language} code from "${filename || 'unnamed'}" and return JSON ONLY (no markdown, no backticks, ONLY the raw JSON object):
{
  "whatItDoes": "A ${level}-appropriate summary of what this code does",
  "howItWorks": [
    {"title": "Step title matching ${level} level", "description": "Detailed ${level}-level explanation", "code": "relevant snippet if helpful"}
  ],
  "proTip": "A ${level}-appropriate tip"
}

Code:
${code}`;

    const text = await this.executeWithFallback(prompt, "qwen-qwq-32b");
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Explanation engine returned invalid data.");
    
    return JSON.parse(jsonMatch[0]);
  }
}

export const aiService = new AIService();
