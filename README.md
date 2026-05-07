<div align="center">
  <img width="1200" height="475" alt="CodeLens AI Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# CodeLens AI 🔮

**CodeLens AI** is a next-generation, browser-based code intelligence IDE powered by the blazing-fast [Groq](https://groq.com/) inference engine. It acts as your personal AI pair programmer, offering deep code analysis, predictive debugging, and adaptive logic decryption.

Designed with a sleek, cyberpunk-inspired aesthetic, CodeLens gives you a detailed look into the "DNA" of your code, ensuring it's not just functional, but clean, secure, and production-ready.

---

## ✨ Features

### 1. 🛡️ Code Review (Quality & Security Audit)
Instantly evaluate your code's quality with a comprehensive 0-100 score. 
* **Strategic Wins:** Highlights what you did right (best practices, optimizations).
* **Technical Debt:** Points out anti-patterns and areas for improvement.
* **Security & Logic Audit:** Identifies potential runtime errors, security vulnerabilities, and logical flaws with precise line-number targeting.

### 2. 🐛 Predictive Debugging
Don't wait for your code to crash. CodeLens analyzes logic flows to predict where failures will occur.
* **Root Cause Analysis:** Explains *why* the bug exists.
* **Auto-Generated Patches:** Provides a copy-pasteable fixed code snippet to resolve the issue instantly.

### 3. 🧠 Logic Decryption (Explain Mode)
Understand complex codebases easily with explanations tailored to your skill level.
* **Adaptive Personas:** Choose between **Beginner** (ELI5 with simple analogies), **Intermediate** (Focus on best practices), or **Advanced** (Big O complexity, memory allocation).
* **Knowledge Matrix:** Step-by-step breakdown of how the code executes.
* **Neural Interrogator:** A built-in chat interface to ask follow-up questions about the specific code context.

### 4. ⚡ Blazing Fast AI via Groq
CodeLens uses Groq's specialized inference infrastructure for near-instant responses. It employs a multi-model fallback strategy:
* **Primary (Reasoning):** `qwen-qwq-32b` for deep logic analysis and thinking.
* **Fallback (Versatility):** `llama-3.3-70b-versatile` for robust general-purpose code understanding.
* **Fast Path (Detection):** `llama-3.1-8b-instant` for instantaneous language detection.

---

## 🛠️ Tech Stack

* **Frontend Framework:** React 19 + TypeScript
* **Build Tool:** Vite 6
* **Styling:** Tailwind CSS v4 (with custom cyber-aesthetic theme)
* **Code Editor:** Monaco Editor (`@monaco-editor/react`)
* **AI Integration:** Groq SDK (`groq-sdk`)
* **Animations:** Framer Motion
* **Icons:** Lucide React

---

## 🚀 Getting Started

### Prerequisites
* [Node.js](https://nodejs.org/) (v18 or higher recommended)
* A [Groq API Key](https://console.groq.com/keys)

### Installation

1. **Clone the repository (or download the source):**
   ```bash
   git clone <repository-url>
   cd Codelens
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory and add your Groq API key:
   ```env
   VITE_GROQ_API_KEY=your_groq_api_key_here
   ```

4. **Start the Development Server:**
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to the URL provided by Vite (usually `http://localhost:5173` or `5174`).

---

## 🎨 Design Philosophy
CodeLens AI features a "Liquid Crystal" dark mode design, utilizing glassmorphism, subtle neon glows, and sophisticated typography (Inter, JetBrains Mono, Space Grotesk) to create an immersive, premium developer experience.

---

> **Note:** CodeLens AI currently runs completely client-side. Your API key is injected at build time and is meant for local development or personal deployment.
