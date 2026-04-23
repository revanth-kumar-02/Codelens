import { AnalysisResult, AnalysisResultSchema } from '../types';

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || "";
const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";

class AIService {
  private lastSuccessfulModel: string | null = null;
  private isThrottled: boolean = false;

  private async sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  public setThrottled(status: boolean) {
    this.isThrottled = status;
  }

  private async fetchGroq(model: string, messages: any[]): Promise<string> {
    if (!GROQ_API_KEY) throw new Error("Groq API Key Missing. Check your configuration.");

    const response = await fetch(GROQ_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.1,
        max_tokens: 4096,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const msg = errorData.error?.message || response.statusText;
      throw new Error(`Groq API Error [${response.status}]: ${msg}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || "";
  }

  private async executeWithFallback(prompt: string, priorityModel: string | null = null, systemPrompt: string = "You are a helpful coding assistant."): Promise<string> {
    const models = [
      priorityModel,
      this.lastSuccessfulModel,
      "llama-3.3-70b-versatile",
      "llama-3.1-8b-instant",
      "mixtral-8x7b-32768"
    ].filter((m, i, arr) => m && arr.indexOf(m) === i) as string[];

    if (this.isThrottled) {
      throw new Error("COOLDOWN: System is cooling down. Please wait.");
    }

    let lastError = "";

    for (const m of models) {
      try {
        const responseText = await this.fetchGroq(m, [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ]);

        if (responseText) {
          this.lastSuccessfulModel = m;
          return responseText;
        }
      } catch (err: any) {
        lastError = err.message;
        const msg = lastError.toLowerCase();

        if (msg.includes("429") || msg.includes("rate limit")) {
          console.warn(`Groq Model ${m} rate limited. Trying fallback...`);
          await this.sleep(1000);
          continue;
        }

        console.error(`Groq Failure [${m}]:`, err.message);
        continue; // Try next model
      }
    }

    if (lastError.includes("429")) {
      throw new Error("QUOTA_EXHAUSTED: Groq rate limits exceeded. Please wait a moment.");
    }
    
    throw new Error(lastError || "Groq Intelligence Offline. Please check your internet connection.");
  }

  async analyze(code: string, language: string, filename?: string, level: string = 'intermediate'): Promise<AnalysisResult> {
    const persona = {
      beginner: "STRICT PERSONA: Explain like I'm 5. Use simple words and real-world analogies. NO technical jargon unless explained with a story.",
      intermediate: "STRICT PERSONA: Technical Mentor. Focus on best practices, readability, and common idioms.",
      advanced: "STRICT PERSONA: Senior Software Architect. Analyze performance, memory, security, and patterns."
    }[level.toLowerCase() as 'beginner' | 'intermediate' | 'advanced'] || "Technical but accessible.";

    const systemPrompt = `You are CodeLens AI, an expert code analysis engine. 
    Analyze the code according to this persona: ${persona}
    You MUST return JSON ONLY.`;

    const prompt = `Analyze this ${language} code in "${filename || 'unnamed'}":
    
    Code:
    ${code}

    Return JSON matching this schema:
    {
      "score": 0-100,
      "good": ["point"],
      "bad": ["point"],
      "issues": [{"id": "uuid", "type": "error|warning|suggestion", "title": "str", "line": "Line X", "description": "str", "snippet": "code"}],
      "debug": {"errorTitle": "str", "fileLine": "str", "rootCause": "str", "suggestedFix": "str", "fixedCode": "code"},
      "explanation": {
        "whatItDoes": "str",
        "howItWorks": [{"title": "str", "description": "str", "code": "optional"}],
        "proTip": "str"
      }
    }`;

    const text = await this.executeWithFallback(prompt, "llama-3.3-70b-versatile", systemPrompt);
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Analysis engine returned invalid data structure.");

    const data = JSON.parse(jsonMatch[0]);
    const validated = AnalysisResultSchema.safeParse(data);
    if (!validated.success) throw new Error('Analysis result does not match expected format.');

    return validated.data;
  }

  async detectLanguage(code: string): Promise<string> {
    const snippet = code.substring(0, 500);
    const cached = localStorage.getItem('codelens_lang_cache');
    if (cached) {
      try {
        const { c, l } = JSON.parse(cached);
        if (c === snippet) return l;
      } catch (e) {}
    }

    const systemPrompt = "You are a language detection expert. Return ONLY the language name.";
    const prompt = `Detect program language. Return ONLY one word: Python, JavaScript, TypeScript, Java, C++, C, HTML, CSS, Plaintext.\n\nCode snippet:\n${snippet}`;
    
    try {
      const text = await this.executeWithFallback(prompt, "llama-3.1-8b-instant", systemPrompt);
      const lang = text.trim().split(' ')[0].replace(/[^a-zA-Z]/g, '');
      
      localStorage.setItem('codelens_lang_cache', JSON.stringify({ c: snippet, l: lang }));
      return lang;
    } catch (err) {
      return "plaintext";
    }
  }

  async chat(code: string, question: string, filename?: string, context?: any): Promise<string> {
    const systemPrompt = "You are an expert debugger helping a user with their code.";
    const prompt = `Code context (${filename || 'unnamed'}):
    ${code}
    Previous analysis: ${JSON.stringify(context || {})}
    Question: ${question}`;
    
    return await this.executeWithFallback(prompt, "llama-3.3-70b-versatile", systemPrompt);
  }
}

export const aiService = new AIService();
