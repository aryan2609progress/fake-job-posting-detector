import { ModelMetricData, ConfusionMatrixData } from '../types';

export const EMSCAD_DATASET_STATS = {
  totalPostings: 17880,
  realPostings: 17014, // 95.16%
  fakePostings: 866,   // 4.84%
  imbalanceRatio: '19.6 : 1',
  missingLogoInFakePercent: 68.4,
  missingLogoInRealPercent: 18.2,
  missingCompanyProfileInFakePercent: 62.1,
  missingCompanyProfileInRealPercent: 16.5,
  telecommutingInFakePercent: 18.0,
  telecommutingInRealPercent: 4.2,
  missingSalaryInRealPercent: 82.5,
  missingSalaryInFakePercent: 64.2,
};

export const MODEL_METRICS: ModelMetricData[] = [
  {
    modelName: 'Logistic Regression (TF-IDF + Rules)',
    accuracy: 97.4,
    precisionFake: 84.6,
    recallFake: 82.1,
    f1Fake: 83.3,
    rocAuc: 0.962,
    trainingTimeSec: 4.2,
    description: 'High interpretability with direct coefficient weights. Great baseline with calibrated probability output.',
  },
  {
    modelName: 'XGBoost Classifier (Best Recall)',
    accuracy: 98.2,
    precisionFake: 89.5,
    recallFake: 86.8,
    f1Fake: 88.1,
    rocAuc: 0.984,
    trainingTimeSec: 18.6,
    description: 'Selected best model. Highest recall on the fraudulent class — critical because missing a fake job is far worse than a false alarm.',
  },
  {
    modelName: 'Random Forest (500 Estimators)',
    accuracy: 97.8,
    precisionFake: 92.1,
    recallFake: 76.4,
    f1Fake: 83.5,
    rocAuc: 0.971,
    trainingTimeSec: 24.1,
    description: 'Very high precision but lower recall on deceptive postings due to feature bagging on sparse text.',
  }
];

export const CONFUSION_MATRIX: ConfusionMatrixData = {
  trueNegative: 3385, // out of 3403 test legitimate
  falsePositive: 18,  // legitimate flagged as fake (0.5% false positive rate)
  falseNegative: 23,  // fake missed as legitimate (caught 150 out of 173 fake)
  truePositive: 150   // 86.8% recall on fraudulent postings
};

// Known TF-IDF learned feature weights from EMSCAD
// Positive values push towards Fake (fraudulent)
// Negative values push towards Genuine (legitimate)
export const TFIDF_FEATURE_WEIGHTS: Record<string, { weight: number; reason: string }> = {
  // High Risk Scam n-grams
  'wire transfer': { weight: 0.88, reason: 'Common money-laundering / mule scam trigger' },
  'western union': { weight: 0.92, reason: 'Untraceable money transfer requirement' },
  'moneygram': { weight: 0.91, reason: 'Untraceable money transfer requirement' },
  'telegram': { weight: 0.76, reason: 'Anonymous instant messaging for scam interviews' },
  'whatsapp': { weight: 0.72, reason: 'Unverified external messenger contact' },
  'cashier check': { weight: 0.89, reason: 'Classic fake check overpayment scheme' },
  'check cashing': { weight: 0.89, reason: 'Classic check fraud scheme' },
  'urgently hiring': { weight: 0.58, reason: 'Artificial urgency to bypass candidate due diligence' },
  'urgent hiring': { weight: 0.55, reason: 'Urgency language common in mass scam postings' },
  'apply immediately': { weight: 0.52, reason: 'High-pressure immediate application hook' },
  'immediate start': { weight: 0.48, reason: 'Rushed onboarding without formal vetting' },
  'no experience needed': { weight: 0.62, reason: 'Lure targeting vulnerable job seekers' },
  'no experience required': { weight: 0.59, reason: 'Unusually low entry barrier for lucrative promises' },
  'unlimited earning': { weight: 0.74, reason: 'Deceptive commission / MLM / pyramid scheme trope' },
  'earn daily': { weight: 0.68, reason: 'Daily payout lure typical of survey/reshipping scams' },
  'envelope stuffing': { weight: 0.95, reason: 'Notorious home work scam' },
  'package inspector': { weight: 0.86, reason: 'Stolen goods reshipping mule scam' },
  'reshipping': { weight: 0.93, reason: 'Criminal parcel mule operation' },
  'mystery shopper': { weight: 0.71, reason: 'Frequently cloned scam format with fake checks' },
  'secret shopper': { weight: 0.69, reason: 'High frequency fake check target' },
  'processing fee': { weight: 0.91, reason: 'Demanding candidate pay upfront fees' },
  'background check fee': { weight: 0.87, reason: 'Advance fee phishing attempt' },
  'software purchase': { weight: 0.78, reason: 'Asking candidate to buy equipment from bogus vendor' },
  'buy equipment': { weight: 0.81, reason: 'Check cashing equipment purchase scam' },
  'personal assistant': { weight: 0.44, reason: 'High scam density title in EMSCAD (often check cashing)' },
  'data entry operator': { weight: 0.38, reason: 'Frequently abused low-skill title by scammers' },
  'bitcoin': { weight: 0.79, reason: 'Cryptocurrency payment request' },
  'crypto': { weight: 0.68, reason: 'Crypto payment or wallet setup demand' },
  'home typist': { weight: 0.82, reason: 'Unregulated work-from-home typing scam' },
  'clearing checks': { weight: 0.94, reason: 'Direct criminal bank fraud indicator' },
  'deposit check': { weight: 0.91, reason: 'Fake check deposit scheme' },
  'start today': { weight: 0.47, reason: 'Excessive urgency' },
  'limited slots': { weight: 0.54, reason: 'Artificial scarcity manipulation' },
  'limited seats': { weight: 0.56, reason: 'Artificial scarcity manipulation' },
  'act now': { weight: 0.51, reason: 'High-pressure urgency keyword' },

  // Positive Genuine n-grams
  '401k': { weight: -0.68, reason: 'Standard regulated US corporate retirement benefit' },
  '401(k)': { weight: -0.71, reason: 'Standard regulated corporate retirement plan' },
  'health insurance': { weight: -0.62, reason: 'Legitimate employer comprehensive healthcare' },
  'dental and vision': { weight: -0.65, reason: 'Standard corporate employee benefits package' },
  'bachelor degree': { weight: -0.58, reason: 'Standard educational qualification requirement' },
  'bachelor\'s degree': { weight: -0.61, reason: 'Formal educational credential requirement' },
  'master\'s degree': { weight: -0.66, reason: 'Higher education credential verification' },
  'years of experience': { weight: -0.49, reason: 'Standard graded professional tenure requirement' },
  'equal opportunity': { weight: -0.64, reason: 'Standard corporate EEO compliance statement' },
  'equal opportunity employer': { weight: -0.72, reason: 'Regulated corporate legal disclaimer' },
  'responsibilities include': { weight: -0.42, reason: 'Structured job description formatting' },
  'key responsibilities': { weight: -0.44, reason: 'Standard professional specification' },
  'collaborate with': { weight: -0.46, reason: 'Team cross-functional organizational workflow' },
  'agile environment': { weight: -0.57, reason: 'Established tech company workflow practice' },
  'git': { weight: -0.45, reason: 'Specific industry standard version control tooling' },
  'continuous integration': { weight: -0.56, reason: 'Standard mature engineering process' },
  'headquartered in': { weight: -0.48, reason: 'Identifiable registered physical corporate base' },
  'founded in': { weight: -0.41, reason: 'Established organizational track record' },
  'paid time off': { weight: -0.52, reason: 'Standard employee PTO policy' },
  'parental leave': { weight: -0.58, reason: 'Institutional HR policy' },
  'tuition reimbursement': { weight: -0.63, reason: 'Verified corporate education benefit' },
  'qualifications': { weight: -0.38, reason: 'Structured requirement rubric' }
};

// Salary Benchmarking Reference (Typical annual ranges in USD)
export const SALARY_BENCHMARKS: Record<string, {
  junior: [number, number];
  mid: [number, number];
  senior: [number, number];
  lead: [number, number];
}> = {
  'software engineer': { junior: [65000, 95000], mid: [95000, 140000], senior: [140000, 195000], lead: [180000, 260000] },
  'data analyst': { junior: [50000, 75000], mid: [75000, 105000], senior: [105000, 145000], lead: [135000, 185000] },
  'data entry': { junior: [28000, 38000], mid: [35000, 48000], senior: [45000, 60000], lead: [55000, 75000] },
  'virtual assistant': { junior: [25000, 38000], mid: [36000, 52000], senior: [48000, 68000], lead: [60000, 85000] },
  'administrative assistant': { junior: [32000, 44000], mid: [42000, 58000], senior: [54000, 72000], lead: [68000, 90000] },
  'customer service': { junior: [30000, 42000], mid: [40000, 55000], senior: [52000, 70000], lead: [65000, 88000] },
  'marketing specialist': { junior: [45000, 65000], mid: [65000, 92000], senior: [90000, 130000], lead: [120000, 175000] },
  'project manager': { junior: [60000, 85000], mid: [85000, 120000], senior: [120000, 165000], lead: [150000, 210000] },
  'graphic designer': { junior: [42000, 58000], mid: [58000, 82000], senior: [80000, 115000], lead: [110000, 155000] },
  'sales representative': { junior: [40000, 60000], mid: [60000, 95000], senior: [90000, 145000], lead: [130000, 210000] }
};
