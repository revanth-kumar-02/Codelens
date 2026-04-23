/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';

export type Mode = 'Review' | 'Debug' | 'Explain';

export interface AppSettings {
  autoDetect: boolean;
  fontSize: number;
  wordWrap: boolean;
  tabSize: number;
  autoAnalyze: boolean;
  defaultLevel: 'beginner' | 'intermediate' | 'advanced';
  showRating: boolean;
  theme: 'dark' | 'light';
  layout: 'compact' | 'comfortable';
}

export const DEFAULT_SETTINGS: AppSettings = {
  autoDetect: true,
  fontSize: 14,
  wordWrap: true,
  tabSize: 2,
  autoAnalyze: false,
  defaultLevel: "intermediate",
  showRating: true,
  theme: "dark",
  layout: "comfortable"
};

export interface Issue {
  id: string;
  type: 'error' | 'warning' | 'suggestion';
  title: string;
  line: string;
  description: string;
  snippet?: string;
}

export interface AnalysisResult {
  score: number;
  good: string[];
  bad: string[];
  issues: Issue[];
  debug: {
    errorTitle: string;
    fileLine: string;
    rootCause: string;
    suggestedFix: string;
    fixedCode: string;
  };
  explanation: {
    whatItDoes: string;
    howItWorks: { title: string; description: string; code?: string }[];
    proTip: string;
  };
}

// Zod Schema for Validation
export const AnalysisResultSchema = z.object({
  score: z.number().min(0).max(100),
  good: z.array(z.string()),
  bad: z.array(z.string()),
  issues: z.array(z.object({
    id: z.string(),
    type: z.enum(['error', 'warning', 'suggestion']),
    title: z.string(),
    line: z.string(),
    description: z.string(),
    snippet: z.string().optional()
  })),
  debug: z.object({
    errorTitle: z.string(),
    fileLine: z.string(),
    rootCause: z.string(),
    suggestedFix: z.string(),
    fixedCode: z.string()
  }),
  explanation: z.object({
    whatItDoes: z.string(),
    howItWorks: z.array(z.object({
      title: z.string(),
      description: z.string(),
      code: z.string().optional()
    })),
    proTip: z.string()
  })
});
