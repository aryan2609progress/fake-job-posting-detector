import { JobInput, RedFlag, SalaryBenchmark } from '../types';
import { SALARY_BENCHMARKS } from '../data/emscadData';

const URGENCY_KEYWORDS = [
  'apply immediately',
  'limited seats',
  'urgent hiring',
  'urgently hiring',
  'act now',
  'apply right now',
  'immediate start',
  'start today',
  'immediate opening',
  'limited slots',
  'hurry up',
  'instant hiring',
  'fast hire'
];

const FREE_EMAIL_DOMAINS = [
  'gmail.com',
  'yahoo.com',
  'outlook.com',
  'hotmail.com',
  'aol.com',
  'protonmail.com',
  'mail.com',
  'zoho.com',
  'yandex.com',
  'icloud.com',
  'gmx.com'
];

const ADVANCE_FEE_SCAM_KEYWORDS = [
  'wire transfer',
  'western union',
  'moneygram',
  'cashier check',
  'cashiers check',
  'deposit check',
  'clearing check',
  'check cashing',
  'buy equipment',
  'approved vendor',
  'send back the remaining',
  'keep the difference',
  'reimbursement check',
  'background check fee',
  'training fee',
  'processing fee'
];

const MESSENGER_INTERVIEW_KEYWORDS = [
  'telegram',
  'whatsapp',
  'signal app',
  'google hangouts',
  'skype chat only',
  'text interview'
];

export function detectRedFlags(job: JobInput): RedFlag[] {
  const flags: RedFlag[] = [];
  const fullText = `${job.title} ${job.description} ${job.requirements || ''} ${job.benefits || ''} ${job.companyProfile || ''}`.toLowerCase();

  // Rule 1: No company info — company_profile empty or under 20 words
  const profileWords = (job.companyProfile || '').trim().split(/\s+/).filter(Boolean);
  if (profileWords.length < 20) {
    flags.push({
      id: 'rule-1-company-profile',
      ruleName: 'Missing Company Profile',
      title: 'No Company Background Provided',
      reason: profileWords.length === 0
        ? 'The company profile field is completely blank. Legitimate employers provide comprehensive corporate background.'
        : `Company profile contains only ${profileWords.length} words (below the 20-word threshold).`,
      severity: profileWords.length === 0 ? 'high' : 'medium',
      recommendation: 'Verify company incorporation on official corporate registries (e.g. SEC, Companies House) before sharing personal info.'
    });
  }

  // Rule 2: No website/LinkedIn link — no URL pattern found
  const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9-]+\.(com|org|io|net|co|ai|tech|jobs)[^\s]*)/i;
  const hasUrlInDescription = urlRegex.test(job.description) || (job.requirements && urlRegex.test(job.requirements));
  const hasWebsiteField = Boolean(job.companyWebsite && job.companyWebsite.trim().length > 3);

  if (!hasUrlInDescription && !hasWebsiteField) {
    flags.push({
      id: 'rule-2-no-website',
      ruleName: 'No Verified Web Presence',
      title: 'No Company Website or LinkedIn Link',
      reason: 'No official website link, LinkedIn career page, or application portal URL was found in the posting.',
      severity: 'medium',
      recommendation: 'Search for the company name on LinkedIn and Google to confirm they have an active web presence.'
    });
  }

  // Rule 3: Generic/vague description — length below threshold or lacking responsibilities
  const descWords = job.description.trim().split(/\s+/).filter(Boolean);
  if (descWords.length < 40) {
    flags.push({
      id: 'rule-3-vague-description',
      ruleName: 'Vague Job Description',
      title: 'Unusually Brief or Generic Job Description',
      reason: `The job description is only ${descWords.length} words long. Real postings detail day-to-day duties, tech stacks, and team structure.`,
      severity: 'high',
      recommendation: 'Ask the recruiter for a formal, detailed written job description outlining exact metrics and reporting structure.'
    });
  } else {
    // Check if it lacks any concrete responsibility keywords
    const hasDutiesKeywords = /responsibilit|duties|will do|role involves|you will|day to day|key tasks/i.test(job.description);
    if (!hasDutiesKeywords && descWords.length < 75) {
      flags.push({
        id: 'rule-3-lack-duties',
        ruleName: 'Lack of Specific Tasks',
        title: 'Lacks Concrete Daily Responsibilities',
        reason: 'The description does not outline specific daily responsibilities or deliverables, focusing instead on generic claims.',
        severity: 'medium',
        recommendation: 'Inquire specifically what software tools, KPIs, and deliverables are expected.'
      });
    }
  }

  // Rule 4: Urgency language — keyword match
  const matchedUrgency: string[] = [];
  for (const kw of URGENCY_KEYWORDS) {
    if (fullText.includes(kw)) {
      matchedUrgency.push(kw);
    }
  }
  if (matchedUrgency.length > 0) {
    flags.push({
      id: 'rule-4-urgency-language',
      ruleName: 'Urgency Pressure Language',
      title: 'Artificial Urgency Language Detected',
      reason: `High-pressure phrases detected: "${matchedUrgency.slice(0, 3).join('", "')}". Scammers use urgency to bypass normal candidate scrutiny.`,
      severity: matchedUrgency.length >= 2 ? 'high' : 'medium',
      recommendation: 'Do not rush through the application or interview process. Legitimate hiring involves thorough evaluation.',
      detectedTextSnippet: matchedUrgency.join(', ')
    });
  }

  // Rule 5: Unrealistic salary comparison
  const salaryBenchmark = evaluateSalary(job.title, job.salaryStated, job.requiredExperience);
  if (salaryBenchmark && (salaryBenchmark.status === 'unrealistic_high' || salaryBenchmark.status === 'above_market')) {
    flags.push({
      id: 'rule-5-unrealistic-salary',
      ruleName: 'Unrealistic Compensation',
      title: 'Salary Significantly Exceeds Market Norms',
      reason: salaryBenchmark.message,
      severity: salaryBenchmark.status === 'unrealistic_high' ? 'high' : 'medium',
      recommendation: 'High pay for low-complexity or entry-level tasks is the #1 psychological hook used by employment scammers.'
    });
  }

  // Rule 6: Suspicious email domain — free domains instead of company domain
  let emailToCheck = (job.contactEmail || '').trim().toLowerCase();
  if (!emailToCheck) {
    const emailMatch = job.description.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/i);
    if (emailMatch) {
      emailToCheck = emailMatch[1].toLowerCase();
    }
  }

  if (emailToCheck) {
    const domainMatch = emailToCheck.split('@')[1];
    if (domainMatch && FREE_EMAIL_DOMAINS.includes(domainMatch)) {
      flags.push({
        id: 'rule-6-free-email-domain',
        ruleName: 'Suspicious Free Email Domain',
        title: 'Recruiter Contact Uses Free Webmail Address',
        reason: `Contact address is "${emailToCheck}" hosted on a free public domain (${domainMatch}). Established companies use corporate "@company.com" addresses.`,
        severity: 'high',
        recommendation: 'Request the recruiter to email you from their official corporate email address tied to their domain name.',
        detectedTextSnippet: emailToCheck
      });
    }
  }

  // Rule 7: Spelling/grammar & formatting quality — excessive caps, spam punctuation
  const words = job.description.split(/\s+/).filter(w => w.length > 3);
  const uppercaseWords = words.filter(w => w === w.toUpperCase() && /^[A-Z]+$/.test(w));
  const exclamationCount = (job.description.match(/!/g) || []).length;
  const dollarCount = (job.description.match(/\$/g) || []).length;

  const capsRatio = words.length > 0 ? uppercaseWords.length / words.length : 0;
  if (capsRatio > 0.08 || exclamationCount > 5 || dollarCount > 6) {
    flags.push({
      id: 'rule-7-grammar-quality',
      ruleName: 'Unprofessional Formatting & Punctuation',
      title: 'Aggressive Formatting / Low Editorial Quality',
      reason: `Excessive capitalization (${Math.round(capsRatio * 100)}% of words in ALL-CAPS) or repeated exclamation/dollar marks ($/!) characteristic of spam postings.`,
      severity: 'medium',
      recommendation: 'Professional corporate job listings follow editorial guidelines and avoid hyper-capitalized marketing shouts.'
    });
  }

  // Rule 8: No physical address / office location
  const locationText = (job.location || '').toLowerCase();
  const isGenericRemote = !job.location || /^(remote|anywhere|work from home|online|n\/a|worldwide|usa|us)$/i.test(locationText.trim());
  const hasPhysicalPlace = /\b(new york|san francisco|seattle|austin|chicago|london|dublin|toronto|boston|los angeles|singapore|berlin|street|suite|floor|building|parkway|hq)\b/i.test(
    `${job.location} ${job.companyProfile || ''}`
  );

  if (isGenericRemote && !hasPhysicalPlace) {
    flags.push({
      id: 'rule-8-no-physical-address',
      ruleName: 'Missing Physical Headquarters',
      title: 'No Identifiable Physical Location or Registered HQ',
      reason: 'No city, state, or office address is listed for the company. While remote jobs are normal, registered corporate entities have an official principal office.',
      severity: 'low',
      recommendation: 'Check whether the company has a physical headquarters or registered business entity in corporate filing databases.'
    });
  }

  // Additional Critical Scam Indicator: Advance Fee / Check Cashing
  const matchedAdvanceFee = ADVANCE_FEE_SCAM_KEYWORDS.filter(phrase => fullText.includes(phrase));
  if (matchedAdvanceFee.length > 0) {
    flags.push({
      id: 'critical-advance-fee-scam',
      ruleName: 'Financial Scam Trigger: Check / Wire Transfer',
      title: 'CRITICAL: Fake Check or Wire Transfer Mechanism',
      reason: `Matched high-confidence scam phrases: "${matchedAdvanceFee.join('", "')}". Demanding checks, wiring money, or buying equipment from a private vendor is 100% consistent with fake check overpayment scams.`,
      severity: 'high',
      recommendation: 'DO NOT DEPOSIT ANY CHECKS OR WIRE MONEY. Legitimate employers NEVER send candidates a check to purchase equipment from private vendors.',
      detectedTextSnippet: matchedAdvanceFee.join(', ')
    });
  }

  // Additional Critical Scam Indicator: Telegram / WhatsApp Interview
  const matchedMessengers = MESSENGER_INTERVIEW_KEYWORDS.filter(phrase => fullText.includes(phrase));
  if (matchedMessengers.length > 0) {
    flags.push({
      id: 'critical-messenger-interview',
      ruleName: 'Chat App Only Interview',
      title: 'Interview Conducted Exclusively via Messaging App',
      reason: `Recruiter requests communication over ${matchedMessengers.join(' or ')}. Scammers avoid phone or corporate video calls (Zoom, Teams, Google Meet) to preserve anonymity.`,
      severity: 'high',
      recommendation: 'Insist on a verified video call or meeting through official company channels before signing or accepting any offer.',
      detectedTextSnippet: matchedMessengers.join(', ')
    });
  }

  // Structured dataset feature checks (EMSCAD signals)
  if (!job.hasCompanyLogo && !job.hasQuestions && !job.companyProfile) {
    flags.push({
      id: 'emscad-low-metadata',
      ruleName: 'EMSCAD Metadata Anomaly',
      title: 'Lacks Logo, Screening Questions, and Company Profile',
      reason: 'In the EMSCAD dataset, 68% of fake postings omit company logos and 75% omit screening questions, compared to only 18% of legitimate corporate postings.',
      severity: 'medium',
      recommendation: 'Compare this job posting with the company’s official career portal or LinkedIn Jobs listing.'
    });
  }

  return flags;
}

export function evaluateSalary(
  title: string,
  salaryStated?: string,
  experience?: string
): SalaryBenchmark | undefined {
  if (!salaryStated || !salaryStated.trim()) {
    return undefined;
  }

  const cleanSalary = salaryStated.replace(/,/g, '');
  const titleLower = title.toLowerCase();

  // Determine role benchmark key
  let benchmarkRole = 'software engineer';
  let matchedKey = 'software engineer';

  for (const key of Object.keys(SALARY_BENCHMARKS)) {
    if (titleLower.includes(key)) {
      benchmarkRole = key;
      matchedKey = key;
      break;
    }
  }

  // Additional aliases
  if (titleLower.includes('developer') || titleLower.includes('coder') || titleLower.includes('programmer')) {
    matchedKey = 'software engineer';
    benchmarkRole = 'Software Engineer';
  } else if (titleLower.includes('typing') || titleLower.includes('clerk') || titleLower.includes('transcription')) {
    matchedKey = 'data entry';
    benchmarkRole = 'Data Entry Specialist';
  } else if (titleLower.includes('assistant') || titleLower.includes('secretary')) {
    matchedKey = 'administrative assistant';
    benchmarkRole = 'Administrative Assistant';
  } else if (titleLower.includes('support') || titleLower.includes('helpdesk')) {
    matchedKey = 'customer service';
    benchmarkRole = 'Customer Service Representative';
  }

  const roleBench = SALARY_BENCHMARKS[matchedKey] || SALARY_BENCHMARKS['data entry'];

  // Determine seniority
  let seniority: SalaryBenchmark['seniority'] = 'Mid-Level';
  let bounds = roleBench.mid;

  const expLower = (experience || '').toLowerCase() + ' ' + titleLower;
  if (expLower.includes('entry') || expLower.includes('junior') || expLower.includes('no experience') || expLower.includes('intern')) {
    seniority = 'Entry-Level';
    bounds = roleBench.junior;
  } else if (expLower.includes('senior') || expLower.includes('sr') || expLower.includes('5+') || expLower.includes('principal')) {
    seniority = 'Senior';
    bounds = roleBench.senior;
  } else if (expLower.includes('lead') || expLower.includes('director') || expLower.includes('manager') || expLower.includes('head')) {
    seniority = 'Lead / Exec';
    bounds = roleBench.lead;
  }

  // Extract numeric salary amount
  const matches = cleanSalary.match(/\b\d{2,6}\b/g);
  if (!matches) {
    return undefined;
  }

  const numbers = matches.map(n => parseInt(n, 10));
  const maxNumber = Math.max(...numbers);

  // Check period
  let period: SalaryBenchmark['period'] = 'yearly';
  let annualEquivalent = maxNumber;

  if (cleanSalary.toLowerCase().includes('/hr') || cleanSalary.toLowerCase().includes('hour') || maxNumber <= 250) {
    period = 'hourly';
    annualEquivalent = maxNumber * 2080; // 40 hrs * 52 weeks
  } else if (cleanSalary.toLowerCase().includes('/mo') || cleanSalary.toLowerCase().includes('month') || (maxNumber >= 1500 && maxNumber <= 18000)) {
    period = 'monthly';
    annualEquivalent = maxNumber * 12;
  }

  const [minBound, maxBound] = bounds;
  const medianBound = Math.round((minBound + maxBound) / 2);

  let status: SalaryBenchmark['status'] = 'normal';
  let message = `Stated pay ($${annualEquivalent.toLocaleString()}/yr equivalent) falls within typical market range for ${seniority} ${benchmarkRole} ($${minBound.toLocaleString()} - $${maxBound.toLocaleString()}).`;

  if (annualEquivalent > maxBound * 1.7) {
    status = 'unrealistic_high';
    const multiple = (annualEquivalent / medianBound).toFixed(1);
    message = `Stated compensation of $${annualEquivalent.toLocaleString()}/yr (${salaryStated}) is ${multiple}x the median market rate ($${medianBound.toLocaleString()}) for an ${seniority} ${benchmarkRole}. This is a major scam red flag.`;
  } else if (annualEquivalent > maxBound * 1.25) {
    status = 'above_market';
    message = `Stated pay ($${annualEquivalent.toLocaleString()}/yr) is noticeably above standard industry benchmark ($${maxBound.toLocaleString()}/yr max).`;
  } else if (annualEquivalent < minBound * 0.6) {
    status = 'unrealistic_low';
    message = `Stated pay is significantly below standard market minimum for this role.`;
  }

  return {
    role: benchmarkRole,
    seniority,
    marketMin: minBound,
    marketMedian: medianBound,
    marketMax: maxBound,
    statedAmount: annualEquivalent,
    period,
    status,
    message
  };
}
