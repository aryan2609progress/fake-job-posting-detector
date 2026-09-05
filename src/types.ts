export type ClassificationCategory = 'Genuine' | 'Suspicious' | 'Fake';

export type RedFlagSeverity = 'high' | 'medium' | 'low';

export interface RedFlag {
  id: string;
  ruleName: string;
  title: string;
  reason: string;
  severity: RedFlagSeverity;
  recommendation: string;
  detectedTextSnippet?: string;
}

export interface FeatureContribution {
  feature: string;
  weight: number; // positive pushes toward Fake, negative pushes toward Genuine
  category: 'text_ngram' | 'metadata' | 'rule_flag';
  explanation: string;
}

export interface SalaryBenchmark {
  role: string;
  seniority: 'Entry-Level' | 'Mid-Level' | 'Senior' | 'Lead / Exec';
  marketMin: number;
  marketMedian: number;
  marketMax: number;
  statedAmount?: number;
  period: 'yearly' | 'hourly' | 'monthly';
  status: 'normal' | 'below_market' | 'above_market' | 'unrealistic_high' | 'unrealistic_low';
  message: string;
}

export interface JobInput {
  title: string;
  companyName: string;
  location: string;
  department?: string;
  salaryStated?: string;
  contactEmail?: string;
  companyWebsite?: string;
  description: string;
  requirements?: string;
  benefits?: string;
  companyProfile?: string;
  hasCompanyLogo: boolean;
  hasQuestions: boolean;
  isTelecommuting: boolean;
  employmentType?: string;
  requiredExperience?: string;
}

export interface AnalysisResult {
  classification: ClassificationCategory;
  riskScore: number; // 0 to 100
  confidence: number; // 0 to 100
  summary: string;
  mlProbability: number; // 0 to 1
  ruleRiskScore: number; // 0 to 1
  redFlags: RedFlag[];
  positiveSignals: string[];
  featureContributions: FeatureContribution[];
  salaryBenchmark?: SalaryBenchmark;
  scamPatternsMatched: string[];
  analyzedAt: string;
  engineUsed: 'hybrid_ml_rules' | 'ml_rules_gemini_augmented';
  geminiExplanation?: string;
}

export interface BatchJobItem {
  id: string;
  title: string;
  company: string;
  snippet: string;
  salary?: string;
  email?: string;
  status: 'pending' | 'completed' | 'error';
  result?: AnalysisResult;
}

export interface ModelMetricData {
  modelName: string;
  accuracy: number;
  precisionFake: number;
  recallFake: number;
  f1Fake: number;
  rocAuc: number;
  trainingTimeSec: number;
  description: string;
}

export interface ConfusionMatrixData {
  trueNegative: number;  // Real correctly predicted Real
  falsePositive: number; // Real wrongly predicted Fake
  falseNegative: number; // Fake wrongly predicted Real (worst error)
  truePositive: number;  // Fake correctly predicted Fake
}
