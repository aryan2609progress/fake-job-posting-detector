import { JobInput } from '../types';

export interface SampleJob {
  id: string;
  label: string;
  expectedCategory: 'Fake' | 'Genuine' | 'Suspicious';
  badgeColor: string;
  data: JobInput;
}

export const SAMPLE_JOBS: SampleJob[] = [
  {
    id: 'scam-check-data-entry',
    label: '🚨 Fake: Urgent Data Entry & Check Processing',
    expectedCategory: 'Fake',
    badgeColor: 'red',
    data: {
      title: 'Remote Data Entry Clerk / Assistant (URGENT HIRING)',
      companyName: 'Apex Logistics Global Solutions',
      location: 'Anywhere / Remote',
      salaryStated: '$65 / hour ($135,000/year) + $1,000 Sign-on Bonus',
      contactEmail: 'apexlogistics.hiringdept@gmail.com',
      companyWebsite: '',
      department: 'Back Office Operations',
      description: `URGENT HIRING! APPLY IMMEDIATELY! LIMITED SEATS AVAILABLE!

Apex Logistics Global is immediately looking for 10 motivated data entry clerks and home typists to start today. No experience needed or required! You will be entering numbers, clearing checks, processing payroll forms, and managing simple invoices from home.

Responsibilities include:
- Typing data into online spreadsheets (2-3 hours daily)
- Receiving customer checks, deposit check into your personal account and wire transfer remaining funds via Western Union or Bitcoin wallet
- You will receive a $3,500 company cashier check upfront to buy home office equipment and laptop from our approved vendor.

Act now! Apply right now to lock in your position. Interview will be conducted immediately via Telegram or WhatsApp with HR Manager Mrs. Patricia.`,
      requirements: `Requirements:
- Must have bank account in good standing
- Able to work independently 10-15 hours a week
- No prior experience or education required! Everyone qualifies!`,
      benefits: `Benefits:
- Guaranteed $65/hr paid daily
- Free MacBook and home workstation provided via company check
- Immediate start with zero interview wait time`,
      companyProfile: '', // Empty profile - Rule 1 trigger
      hasCompanyLogo: false,
      hasQuestions: false,
      isTelecommuting: true,
      employmentType: 'Part-time / Remote',
      requiredExperience: 'Entry level'
    }
  },
  {
    id: 'genuine-senior-engineer',
    label: '✅ Genuine: Senior Software Engineer (Stripe)',
    expectedCategory: 'Genuine',
    badgeColor: 'emerald',
    data: {
      title: 'Senior Software Engineer, Core Infrastructure',
      companyName: 'Stripe, Inc.',
      location: 'Seattle, WA, United States (Hybrid)',
      salaryStated: '$175,000 - $225,000 USD + Equity + Benefits',
      contactEmail: 'careers@stripe.com',
      companyWebsite: 'https://stripe.com/jobs',
      department: 'Platform Engineering',
      description: `Stripe is a technology company that builds economic infrastructure for the internet. Businesses of every size—from new startups to public companies—use our software to accept payments and manage their businesses online.

We are looking for a Senior Software Engineer to join our Core Infrastructure team. In this role, you will design, build, and operate large-scale distributed systems that process billions of dollars in transactions daily with 99.999% availability.

Key Responsibilities:
- Design fault-tolerant distributed systems and microservices using Go, Java, and Kubernetes
- Collaborate with cross-functional engineering teams, product managers, and security leads to deliver reliable financial infrastructure
- Participate in design reviews, production on-call rotations, and root cause analysis
- Mentor junior and mid-level engineers in software architecture best practices
- Maintain continuous integration and deployment pipelines using Git and automated canary rollouts`,
      requirements: `Qualifications:
- Bachelor's degree in Computer Science, Software Engineering, or equivalent practical experience
- 5+ years of experience building and maintaining high-throughput, low-latency distributed systems
- Strong proficiency in Go, Java, C++, or Rust
- Deep understanding of database internals, distributed consensus (Raft/Paxos), and ACID transactions
- Proven track record of shipping production-grade infrastructure with measurable business impact`,
      benefits: `Benefits & Perks:
- Comprehensive medical, dental, and vision health insurance plans
- 401(k) retirement plan with competitive company match
- Generous paid time off (PTO) and parental leave policies
- Annual learning, wellness, and tuition reimbursement stipends
- Equal Opportunity Employer committed to diversity and inclusion`,
      companyProfile: `Founded in 2010, Stripe is headquartered in South San Francisco, CA and Dublin, Ireland, with offices worldwide. We operate financial infrastructure powering millions of businesses across 120+ countries.`,
      hasCompanyLogo: true,
      hasQuestions: true,
      isTelecommuting: false,
      employmentType: 'Full-time',
      requiredExperience: 'Mid-Senior level'
    }
  },
  {
    id: 'suspicious-crypto-assistant',
    label: '⚠️ Suspicious: Executive Virtual Assistant (Crypto/Wire)',
    expectedCategory: 'Suspicious',
    badgeColor: 'amber',
    data: {
      title: 'Executive Virtual Assistant / Payment Coordinator',
      companyName: 'Global Horizon Ventures LLC',
      location: 'Remote, US',
      salaryStated: '$95,000 - $110,000 / year',
      contactEmail: 'globalhorizon.careers@outlook.com',
      companyWebsite: 'http://globalhorizon-dummy-temp-site.xyz',
      department: 'Executive Office',
      description: `Seeking an organized Executive Virtual Assistant to support our international real estate director. Candidate must be capable of multi-tasking under pressure.

Primary Duties:
- Coordinate calendar appointments, flight itineraries, and vendor emails
- Assist with processing payments, client remittances, and digital gift cards
- Handle confidential corporate transactions and wire transfer logs
- Limited supervision; flexible working hours from home
- Act now as interviews are filling up quickly this week`,
      requirements: `Requirements:
- High school diploma or equivalent
- Strong communication and spreadsheet skills
- Fast learner with reliable internet connection
- Willingness to download Telegram for daily briefings`,
      benefits: `Competitive compensation and quarterly performance incentives.`,
      companyProfile: `Global Horizon Ventures LLC is a premier international consulting firm helping clients navigate real estate investments.`,
      hasCompanyLogo: false,
      hasQuestions: false,
      isTelecommuting: true,
      employmentType: 'Full-time',
      requiredExperience: 'Entry level'
    }
  },
  {
    id: 'genuine-marketing-specialist',
    label: '✅ Genuine: Product Marketing Specialist',
    expectedCategory: 'Genuine',
    badgeColor: 'emerald',
    data: {
      title: 'Product Marketing Specialist',
      companyName: 'Datadog',
      location: 'New York, NY (Hybrid)',
      salaryStated: '$80,000 - $105,000 / year + Equity',
      contactEmail: 'recruiting@datadoghq.com',
      companyWebsite: 'https://www.datadoghq.com/careers',
      department: 'Marketing',
      description: `Datadog is the essential monitoring and security platform for cloud applications. We bring together end-to-end traces, metrics, and logs to make applications, infrastructure, and third-party services entirely observable.

As a Product Marketing Specialist, you will help articulate our product value proposition to IT operations and DevOps practitioners worldwide.

Responsibilities:
- Collaborate with product management to define product positioning, messaging, and go-to-market strategies
- Develop customer-facing collaterals including whitepapers, webinars, solution briefs, and case studies
- Analyze competitive landscape and industry trends to arm our global sales organization
- Measure campaign conversion metrics, pipeline contribution, and customer feedback`,
      requirements: `Qualifications:
- Bachelor's degree in Marketing, Communications, Business, or technical field
- 2-4 years of product marketing experience in B2B SaaS or enterprise software
- Exceptional written and verbal communication skills
- Experience with analytics tools (Google Analytics, Salesforce, HubSpot)`,
      benefits: `Benefits:
- Health, dental, and vision insurance with 100% employee coverage
- 401(k) plan with matching
- Flexible paid time off
- Commuter benefits and catered lunches
- Datadog is an equal opportunity employer`,
      companyProfile: `Datadog was founded in 2010 and is headquartered in New York City. We are publicly traded on NASDAQ (DDOG) and serve tens of thousands of customers worldwide.`,
      hasCompanyLogo: true,
      hasQuestions: true,
      isTelecommuting: false,
      employmentType: 'Full-time',
      requiredExperience: 'Associate / Mid-level'
    }
  }
];
