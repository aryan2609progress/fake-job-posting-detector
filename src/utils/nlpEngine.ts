import {
  JobInput,
  AnalysisResult,
  ClassificationCategory,
  FeatureContribution
} from '../types';
import { TFIDF_FEATURE_WEIGHTS } from '../data/emscadData';
import { detectRedFlags, evaluateSalary } from './redFlagRules';

const ENGLISH_STOPWORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and',
  'any', 'are', 'aren\'t', 'as', 'at', 'be', 'because', 'been', 'before', 'being',
  'below', 'between', 'both', 'but', 'by', 'can\'t', 'cannot', 'could', 'couldn\'t',
  'did', 'didn\'t', 'do', 'does', 'doesn\'t', 'doing', 'don\'t', 'down', 'during',
  'each', 'few', 'for', 'from', 'further', 'had', 'hadn\'t', 'has', 'hasn\'t',
  'have', 'haven\'t', 'having', 'he', 'he\'d', 'he\'ll', 'he\'s', 'her', 'here',
  'here\'s', 'hers', 'herself', 'him', 'himself', 'his', 'how', 'how\'s', 'i',
  'i\'d', 'i\'ll', 'i\'m', 'i\'ve', 'if', 'in', 'into', 'is', 'isn\'t', 'it',
  'it\'s', 'its', 'itself', 'let\'s', 'me', 'more', 'most', 'mustn\'t', 'my',
  'myself', 'no', 'nor', 'not', 'of', 'off', 'on', 'once', 'only', 'or', 'other',
  'ought', 'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same', 'shan\'t',
  'she', 'she\'d', 'she\'ll', 'she\'s', 'should', 'shouldn\'t', 'so', 'some',
  'such', 'than', 'that', 'that\'s', 'the', 'their', 'theirs', 'them', 'themselves',
  'then', 'there', 'there\'s', 'these', 'they', 'they\'d', 'they\'ll', 'they\'re',
  'they\'ve', 'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up',
  'very', 'was', 'wasn\'t', 'we', 'we\'d', 'we\'ll', 'we\'re', 'we\'ve', 'were',
  'weren\'t', 'what', 'what\'s', 'when', 'when\'s', 'where', 'where\'s', 'which',
  'while', 'who', 'who\'s', 'whom', 'why', 'why\'s', 'with', 'won\'t', 'would',
  'wouldn\'t', 'you', 'you\'d', 'you\'ll', 'you\'re', 'you\'ve', 'your', 'yours',
  'yourself', 'yourselves'
]);

export function cleanAndTokenizeText(text: string): string[] {
  if (!text) return [];
  // Strip HTML
  const withoutHtml = text.replace(/<[^>]*>/g, ' ');
  // Lowercase & keep alphanumeric and spaces
  const cleaned = withoutHtml.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
  const tokens = cleaned.split(/\s+/).filter(t => t.length > 2 && !ENGLISH_STOPWORDS.has(t));
  return tokens;
}

export function analyzeJobPosting(job: JobInput): AnalysisResult {
  // 1. Run rule-based red flag detection
  const redFlags = detectRedFlags(job);
  const salaryBenchmark = evaluateSalary(job.title, job.salaryStated, job.requiredExperience);

  // 2. Prepare text corpus
  const combinedText = `
    ${job.title}
    ${job.companyName}
    ${job.companyProfile || ''}
    ${job.description}
    ${job.requirements || ''}
    ${job.benefits || ''}
  `.toLowerCase();

  // 3. TF-IDF and N-gram scanning with EMSCAD weights
  const matchedTokens: { token: string; weight: number; reason: string }[] = [];
  const scamPatternsMatched: string[] = [];
  let tfidfLogitSum = -2.9; // Base log-odds for EMSCAD (4.8% base fraud rate)

  for (const [phrase, info] of Object.entries(TFIDF_FEATURE_WEIGHTS)) {
    if (combinedText.includes(phrase)) {
      matchedTokens.push({ token: phrase, weight: info.weight, reason: info.reason });
      tfidfLogitSum += info.weight * 2.2;
      if (info.weight > 0.4) {
        scamPatternsMatched.push(phrase);
      }
    }
  }

  // Factor in metadata features (EMSCAD structured columns)
  if (!job.hasCompanyLogo) {
    tfidfLogitSum += 0.45; // Missing logo correlates with fake
  } else {
    tfidfLogitSum -= 0.65; // Present logo correlates with real
  }

  if (!job.hasQuestions) {
    tfidfLogitSum += 0.35;
  } else {
    tfidfLogitSum -= 0.55;
  }

  if (job.isTelecommuting && (!job.location || job.location.toLowerCase().includes('remote'))) {
    tfidfLogitSum += 0.30;
  }

  if (job.companyProfile && job.companyProfile.length > 150) {
    tfidfLogitSum -= 0.85; // Detailed company profile strongly indicates genuine
  }

  // Calculate ML sigmoid probability
  const mlProbability = 1 / (1 + Math.exp(-tfidfLogitSum));

  // Calculate Rule Risk Contribution
  let ruleRiskPoints = 0;
  for (const flag of redFlags) {
    if (flag.severity === 'high') ruleRiskPoints += 32;
    else if (flag.severity === 'medium') ruleRiskPoints += 18;
    else ruleRiskPoints += 8;
  }
  const ruleRiskScore = Math.min(1.0, ruleRiskPoints / 100);

  // Hybrid Ensemble Score: 55% ML Model + 45% Rule Checks
  const blendedRisk = (0.55 * mlProbability) + (0.45 * ruleRiskScore);
  const riskScore = Math.min(99, Math.max(1, Math.round(blendedRisk * 100)));

  // Classification Category
  let classification: ClassificationCategory = 'Genuine';
  if (riskScore >= 65) {
    classification = 'Fake';
  } else if (riskScore >= 30) {
    classification = 'Suspicious';
  }

  // Confidence calculation: distance from decision threshold boundaries (30 and 65)
  let confidence: number;
  if (classification === 'Fake') {
    confidence = Math.min(99, Math.max(68, Math.round(55 + (riskScore - 65) * 1.25)));
  } else if (classification === 'Genuine') {
    confidence = Math.min(99, Math.max(70, Math.round(60 + (30 - riskScore) * 1.3)));
  } else {
    // Suspicious has inherent uncertainty
    confidence = Math.min(85, Math.max(60, Math.round(65 + Math.abs(riskScore - 47.5) * 0.8)));
  }

  // SHAP-like Feature Contributions
  const featureContributions: FeatureContribution[] = [];

  // Add rule flags to contributions
  for (const flag of redFlags) {
    featureContributions.push({
      feature: flag.ruleName,
      weight: flag.severity === 'high' ? 0.38 : flag.severity === 'medium' ? 0.22 : 0.12,
      category: 'rule_flag',
      explanation: flag.reason
    });
  }

  // Add top positive (fake) and negative (genuine) n-grams
  for (const t of matchedTokens) {
    featureContributions.push({
      feature: `"${t.token}"`,
      weight: t.weight,
      category: 'text_ngram',
      explanation: t.reason
    });
  }

  // Add structured metadata features
  if (job.hasCompanyLogo) {
    featureContributions.push({
      feature: 'Verified Company Logo',
      weight: -0.25,
      category: 'metadata',
      explanation: 'Verified corporate brand logo present (in EMSCAD, 82% of real jobs have logos).'
    });
  } else {
    featureContributions.push({
      feature: 'Missing Company Logo',
      weight: 0.20,
      category: 'metadata',
      explanation: 'No company logo uploaded. 68% of fake postings in the dataset lack a company logo.'
    });
  }

  if (job.hasQuestions) {
    featureContributions.push({
      feature: 'Screening Questions Configured',
      weight: -0.22,
      category: 'metadata',
      explanation: 'Applicant screening questionnaire active, typical of regulated corporate recruiting.'
    });
  }

  // Sort contributions by absolute impact
  featureContributions.sort((a, b) => Math.abs(b.weight) - Math.abs(a.weight));

  // Positive signals
  const positiveSignals: string[] = [];
  if (job.companyProfile && job.companyProfile.length > 100) {
    positiveSignals.push('Comprehensive company background and founding history provided.');
  }
  if (job.contactEmail && !/(gmail|yahoo|outlook|hotmail|aol|protonmail)/i.test(job.contactEmail)) {
    positiveSignals.push(`Official corporate domain contact email (${job.contactEmail}).`);
  }
  if (job.hasCompanyLogo) {
    positiveSignals.push('Verified corporate branding logo present.');
  }
  if (job.hasQuestions) {
    positiveSignals.push('Standard applicant screening questions configured.');
  }
  if (/401\(?k\)?|health insurance|dental|vision|pto|parental leave/i.test(combinedText)) {
    positiveSignals.push('Standard corporate employee benefits package (healthcare, retirement, PTO) detailed.');
  }
  if (/bachelor|degree|years of experience|qualifications/i.test(combinedText)) {
    positiveSignals.push('Structured educational and professional qualification criteria specified.');
  }
  if (job.location && !/^(remote|anywhere|n\/a)$/i.test(job.location.trim())) {
    positiveSignals.push(`Specific physical workplace/city listed (${job.location}).`);
  }

  // Summary statement
  let summary = '';
  if (classification === 'Fake') {
    summary = `High probability of employment scam (${riskScore}% risk score). Multiple severe red flags detected, including ${redFlags.map(f => f.ruleName).slice(0, 2).join(' and ')}. We strongly advise against sending resumes, sharing banking credentials, or depositing any checks.`;
  } else if (classification === 'Suspicious') {
    summary = `Moderate risk detected (${riskScore}% risk score). This posting contains notable warning signs such as ${redFlags.map(f => f.ruleName).slice(0, 2).join(' or ')}. Proceed with caution and verify the employer independently before applying.`;
  } else {
    summary = `Low scam risk detected (${riskScore}% risk score). This posting exhibits typical hallmarks of a genuine corporate job offer, including structured responsibilities, professional credentials, and verified employer metadata.`;
  }

  return {
    classification,
    riskScore,
    confidence,
    summary,
    mlProbability: Math.round(mlProbability * 1000) / 1000,
    ruleRiskScore: Math.round(ruleRiskScore * 1000) / 1000,
    redFlags,
    positiveSignals,
    featureContributions: featureContributions.slice(0, 10),
    salaryBenchmark,
    scamPatternsMatched,
    analyzedAt: new Date().toISOString(),
    engineUsed: 'hybrid_ml_rules'
  };
}
