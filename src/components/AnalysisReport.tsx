import React, { useState } from 'react';
import { AnalysisResult, JobInput, RedFlag } from '../types';
import {
  ShieldCheck,
  AlertTriangle,
  ShieldAlert,
  Sparkles,
  CheckCircle2,
  XCircle,
  Highlighter,
  Info,
} from 'lucide-react';

interface AnalysisReportProps {
  result: AnalysisResult;
  job: JobInput;
  onOpenFeedback: () => void;
  theme?: 'dark' | 'light';
}

export const AnalysisReport: React.FC<AnalysisReportProps> = ({
  result,
  job,
  onOpenFeedback,
  theme = 'dark',
}) => {
  const [showHighlighter, setShowHighlighter] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'redflags' | 'explainability' | 'salary'>('overview');

  const isDark = theme === 'dark';
  const { classification, riskScore, confidence, summary, redFlags, featureContributions, positiveSignals, salaryBenchmark, geminiExplanation } = result;

  // Status configuration
  const config = {
    Genuine: {
      badgeBg: isDark ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' : 'bg-emerald-50 text-emerald-800 border-emerald-200',
      meterColor: 'bg-emerald-500',
      icon: ShieldCheck,
      iconColor: 'text-emerald-400',
      headline: 'Low Risk — Likely Genuine Job Opportunity',
      actionAlert: 'This posting exhibits typical characteristics of legitimate corporate recruitment. Standard due diligence applies.',
      alertBg: isDark ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-200' : 'bg-emerald-50/70 border-emerald-200 text-emerald-900',
    },
    Suspicious: {
      badgeBg: isDark ? 'bg-amber-500/15 text-amber-300 border-amber-500/30' : 'bg-amber-50 text-amber-800 border-amber-200',
      meterColor: 'bg-amber-500',
      icon: AlertTriangle,
      iconColor: 'text-amber-400',
      headline: 'Moderate Risk — Warning Signs Detected',
      actionAlert: 'Exercise caution. Verify company domain, verify recruiter identity on LinkedIn, and never pay upfront fees or deposit checks.',
      alertBg: isDark ? 'bg-amber-950/40 border-amber-800/60 text-amber-200' : 'bg-amber-50/70 border-amber-200 text-amber-900',
    },
    Fake: {
      badgeBg: isDark ? 'bg-rose-500/15 text-rose-300 border-rose-500/30' : 'bg-rose-50 text-rose-800 border-rose-200',
      meterColor: 'bg-rose-500',
      icon: ShieldAlert,
      iconColor: 'text-rose-400',
      headline: 'High Risk — Employment Scam Probable',
      actionAlert: 'DO NOT APPLY OR SHARE PERSONAL DATA. Cease communication immediately. Never deposit checks, purchase equipment, or wire funds.',
      alertBg: isDark ? 'bg-rose-950/40 border-rose-800/60 text-rose-200' : 'bg-rose-50/70 border-rose-200 text-rose-900',
    },
  }[classification];

  const IconComponent = config.icon;

  // Render text with scam phrases highlighted
  const renderHighlightedText = () => {
    const text = job.description;
    const highlightWords = [
      'wire transfer', 'western union', 'moneygram', 'cashier check', 'deposit check',
      'clearing check', 'buy equipment', 'telegram', 'whatsapp', 'urgent hiring',
      'urgently hiring', 'apply immediately', 'act now', 'immediate start', 'no experience needed',
      'unlimited earning', 'envelope stuffing', 'package inspector'
    ];

    const regex = new RegExp(`(${highlightWords.join('|')})`, 'gi');
    const parts = text.split(regex);

    return (
      <div className="p-4 bg-slate-950 text-slate-200 rounded-xl font-mono text-xs leading-relaxed max-h-96 overflow-y-auto whitespace-pre-wrap select-text border border-slate-800">
        {parts.map((part, i) => {
          if (highlightWords.some(w => w.toLowerCase() === part.toLowerCase())) {
            return (
              <span
                key={i}
                className="bg-rose-500/30 text-rose-300 px-1 py-0.5 rounded border border-rose-500/50 font-semibold"
                title="Matched scam/urgency pattern"
              >
                {part}
              </span>
            );
          }
          return <span key={i}>{part}</span>;
        })}
      </div>
    );
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Top Banner Card */}
      <div
        className={`rounded-md border transition-colors shadow-sm overflow-hidden ${
          isDark
            ? 'bg-[#172337] border-[#23334d] shadow-black/20'
            : 'bg-white border-slate-200/90 shadow-[0_1px_3px_0_rgba(0,0,0,0.06)]'
        }`}
      >
        <div className="p-5 sm:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-start space-x-4">
              <div
                className={`p-3 rounded-md flex-shrink-0 ${
                  isDark ? 'bg-[#101b2b] border border-[#23334d]' : 'bg-slate-100'
                } ${config.iconColor}`}
              >
                <IconComponent className="w-8 h-8" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span className={`px-2.5 py-0.5 rounded-sm text-xs font-extrabold uppercase tracking-wider border ${config.badgeBg}`}>
                    Classification: {classification}
                  </span>

                  {/* Verified Legitimate badge for Genuine jobs */}
                  {classification === 'Genuine' && (
                    <span className="inline-flex items-center gap-1.5 bg-emerald-600 text-white px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-tight shadow-sm border border-emerald-400/30">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-200" />
                      <span>Verified Legitimate Posting</span>
                    </span>
                  )}

                  {/* Model Confidence Pill */}
                  <span className="inline-flex items-center gap-1.5 bg-slate-900 text-white px-2.5 py-0.5 rounded-full text-xs font-bold shadow-sm border border-slate-700">
                    <span className="text-emerald-400">{confidence}%</span>
                    <span className="text-[10px] font-medium text-slate-300">Model Confidence</span>
                  </span>

                  {result.engineUsed === 'ml_rules_gemini_augmented' && (
                    <span className={`inline-flex items-center space-x-1 text-[11px] font-semibold px-2 py-0.5 rounded-sm border ${
                      isDark
                        ? 'bg-purple-950/40 text-purple-300 border-purple-800'
                        : 'bg-purple-50 text-purple-700 border-purple-200'
                    }`}>
                      <Sparkles className="w-3 h-3" />
                      <span>Gemini AI Verified</span>
                    </span>
                  )}
                </div>
                <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-[#212121]'}`}>
                  {config.headline}
                </h2>
                <p className={`text-xs mt-1 max-w-3xl leading-relaxed ${isDark ? 'text-slate-300' : 'text-[#878787]'}`}>
                  {summary}
                </p>
              </div>
            </div>

            {/* Risk Gauge Metric */}
            <div
              className={`flex lg:flex-col items-center justify-between lg:justify-center p-4 rounded-md border min-w-[200px] ${
                isDark
                  ? 'bg-[#101b2b] border-[#23334d]'
                  : 'bg-[#fbfcfd] border-slate-200/80'
              }`}
            >
              <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-[#878787]'}`}>
                Scam Risk Score
              </span>
              <div className="flex items-baseline space-x-1 my-1">
                <span className={`text-3xl font-black ${isDark ? 'text-white' : 'text-[#212121]'}`}>
                  {riskScore}
                </span>
                <span className={`text-sm font-medium ${isDark ? 'text-slate-500' : 'text-[#878787]'}`}>
                  / 100
                </span>
              </div>
              <div className={`w-full h-2.5 rounded-full overflow-hidden mt-1 ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}>
                <div
                  className={`h-full ${config.meterColor} transition-all duration-700`}
                  style={{ width: `${riskScore}%` }}
                />
              </div>
              <div className={`flex justify-between w-full text-[10px] mt-1 font-medium ${isDark ? 'text-slate-500' : 'text-[#878787]'}`}>
                <span>0% Safe</span>
                <span>30%</span>
                <span>65%</span>
                <span>100% Scam</span>
              </div>
            </div>
          </div>

          {/* Action Callout */}
          <div className={`mt-4 p-3 rounded-md border ${config.alertBg} flex items-start space-x-3 text-xs`}>
            <Info className="w-4 h-4 flex-shrink-0 mt-0.5 text-[#2874f0]" />
            <div className="leading-relaxed">
              <strong className="font-bold">Recommended Action: </strong>
              {config.actionAlert}
            </div>
          </div>
        </div>

        {/* Navigation Sub-Tabs */}
        <div
          className={`flex border-t px-6 overflow-x-auto scrollbar-none gap-4 ${
            isDark ? 'border-[#23334d] bg-[#101b2b]' : 'border-slate-100 bg-[#f9fafb]'
          }`}
        >
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-1 text-xs font-bold border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'overview'
                ? isDark
                  ? 'border-[#ffe500] text-[#ffe500]'
                  : 'border-[#2874f0] text-[#2874f0]'
                : isDark
                ? 'border-transparent text-slate-400 hover:text-slate-200'
                : 'border-transparent text-[#878787] hover:text-[#212121]'
            }`}
          >
            Overview & 8-Rule Audit ({redFlags.length} flags)
          </button>
          <button
            onClick={() => setActiveTab('explainability')}
            className={`py-3 px-1 text-xs font-bold border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'explainability'
                ? isDark
                  ? 'border-[#ffe500] text-[#ffe500]'
                  : 'border-[#2874f0] text-[#2874f0]'
                : isDark
                ? 'border-transparent text-slate-400 hover:text-slate-200'
                : 'border-transparent text-[#878787] hover:text-[#212121]'
            }`}
          >
            SHAP Feature Explainability
          </button>
          {salaryBenchmark && (
            <button
              onClick={() => setActiveTab('salary')}
              className={`py-3 px-1 text-xs font-bold border-b-2 whitespace-nowrap transition-colors ${
                activeTab === 'salary'
                  ? isDark
                    ? 'border-[#ffe500] text-[#ffe500]'
                    : 'border-[#2874f0] text-[#2874f0]'
                  : isDark
                  ? 'border-transparent text-slate-400 hover:text-slate-200'
                  : 'border-transparent text-[#878787] hover:text-[#212121]'
              }`}
            >
              Salary Benchmarking
            </button>
          )}
        </div>
      </div>

      {/* Tab 1: Overview & 8-Rule Audit */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Detected Red Flags (Left 2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <div
              className={`rounded-2xl border p-5 shadow-sm ${
                isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className={`text-sm font-bold flex items-center space-x-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    <span>Detected Red Flags & Heuristic Triggers</span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {redFlags.length} Flagged
                    </span>
                  </h3>
                  <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Evaluated across all 8 independent rule criteria from the project specification
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowHighlighter(!showHighlighter)}
                  className={`inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    showHighlighter
                      ? isDark ? 'bg-emerald-500 text-slate-950' : 'bg-slate-900 text-white'
                      : isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Highlighter className="w-3.5 h-3.5" />
                  <span>{showHighlighter ? 'Hide Highlights' : 'Highlight Source'}</span>
                </button>
              </div>

              {showHighlighter && (
                <div className="mb-4">
                  <div className={`text-xs font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Source Text Analysis (Highlighted Scam / Urgency Keywords):
                  </div>
                  {renderHighlightedText()}
                </div>
              )}

              {redFlags.length === 0 ? (
                <div
                  className={`p-8 text-center rounded-xl border border-dashed ${
                    isDark
                      ? 'bg-slate-950/60 border-slate-800'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                  <h4 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Zero Red Flags Triggered
                  </h4>
                  <p className={`text-xs max-w-md mx-auto mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    This posting passed all 8 rule checks: company profile present, valid links, specific responsibilities, normal compensation, and standard email domain.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {redFlags.map((flag) => {
                    const sevStyle = {
                      high: isDark ? 'bg-rose-500/20 border-rose-500/40 text-rose-300' : 'bg-rose-50 border-rose-200 text-rose-800',
                      medium: isDark ? 'bg-amber-500/20 border-amber-500/40 text-amber-300' : 'bg-amber-50 border-amber-200 text-amber-800',
                      low: isDark ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700',
                    }[flag.severity];

                    return (
                      <div
                        key={flag.id}
                        className={`p-4 rounded-xl border transition-shadow space-y-2 ${
                          isDark
                            ? 'bg-slate-950/70 border-slate-800/90 hover:border-slate-700'
                            : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center space-x-2">
                            <span className="text-base">
                              {flag.severity === 'high' ? '🚨' : flag.severity === 'medium' ? '⚠️' : 'ℹ️'}
                            </span>
                            <span className={`text-xs font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                              {flag.title}
                            </span>
                          </div>
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${sevStyle}`}>
                            {flag.severity} Severity
                          </span>
                        </div>

                        <p className={`text-xs leading-relaxed pl-6 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                          {flag.reason}
                        </p>

                        {flag.detectedTextSnippet && (
                          <div className="pl-6">
                            <span
                              className={`text-[11px] font-mono px-2 py-0.5 rounded border ${
                                isDark
                                  ? 'bg-slate-900 text-slate-200 border-slate-700'
                                  : 'bg-slate-100 text-slate-800 border-slate-200'
                              }`}
                            >
                              Snippet: "{flag.detectedTextSnippet}"
                            </span>
                          </div>
                        )}

                        <div className={`pl-6 pt-1 text-[11px] flex items-start space-x-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          <strong className={`font-semibold flex-shrink-0 ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                            Recommendation:
                          </strong>
                          <span>{flag.recommendation}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Gemini AI Forensic Threat Assessment (if present) */}
            {geminiExplanation && (
              <div className="bg-gradient-to-br from-purple-950 via-slate-900 to-indigo-950 text-white rounded-2xl p-6 shadow-md border border-purple-800/60">
                <div className="flex items-center space-x-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center border border-purple-400/30">
                    <Sparkles className="w-4 h-4 text-purple-300" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Gemini AI Cyber-Forensic Intelligence</h3>
                    <p className="text-[11px] text-purple-200">Deep qualitative reasoning & deception analysis</p>
                  </div>
                </div>
                <div className="text-xs text-purple-100 leading-relaxed space-y-2 whitespace-pre-line font-sans">
                  {geminiExplanation}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: 8-Point Scorecard & Positive Signals */}
          <div className="space-y-4">
            {/* 8-Rule Standard Checklist */}
            <div
              className={`rounded-2xl border p-5 shadow-sm ${
                isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
              }`}
            >
              <h3 className={`text-xs font-bold uppercase tracking-wider mb-3 ${isDark ? 'text-slate-300' : 'text-slate-900'}`}>
                8-Rule Heuristic Audit Scorecard
              </h3>
              <div className="space-y-2 text-xs">
                {[
                  { name: '1. Company Profile (>20 words)', rule: 'rule-1-company-profile' },
                  { name: '2. Verified Website / LinkedIn URL', rule: 'rule-2-no-website' },
                  { name: '3. Detailed Daily Duties & Length', rule: 'rule-3-vague-description' },
                  { name: '4. Absence of High-Pressure Urgency', rule: 'rule-4-urgency-language' },
                  { name: '5. Realistic Role Compensation Range', rule: 'rule-5-unrealistic-salary' },
                  { name: '6. Corporate Email Domain (No webmail)', rule: 'rule-6-free-email-domain' },
                  { name: '7. Standard Professional Grammar & Caps', rule: 'rule-7-grammar-quality' },
                  { name: '8. Registered Physical HQ / Location', rule: 'rule-8-no-physical-address' },
                ].map((item, idx) => {
                  const isFlagged = redFlags.some(f => f.id.includes(item.rule) || f.ruleName.toLowerCase().includes(item.rule));
                  return (
                    <div
                      key={idx}
                      className={`flex items-center justify-between p-2 rounded-lg text-xs ${
                        isFlagged
                          ? isDark ? 'bg-rose-500/10 text-rose-300 border border-rose-500/20' : 'bg-rose-50/60 text-rose-900'
                          : isDark ? 'bg-slate-950/60 text-slate-300 border border-slate-800/80' : 'bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span className="font-medium truncate mr-2">{item.name}</span>
                      {isFlagged ? (
                        <span className="flex items-center space-x-1 text-rose-400 font-semibold text-[11px]">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Flagged</span>
                        </span>
                      ) : (
                        <span className="flex items-center space-x-1 text-emerald-400 font-semibold text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Passed</span>
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Positive Legitimacy Signals */}
            <div
              className={`rounded-2xl border p-5 shadow-sm ${
                isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
              }`}
            >
              <h3 className={`text-xs font-bold uppercase tracking-wider mb-2 flex items-center space-x-1.5 ${isDark ? 'text-slate-300' : 'text-slate-900'}`}>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Legitimacy Signals Found ({positiveSignals.length})</span>
              </h3>
              {positiveSignals.length === 0 ? (
                <p className={`text-xs italic ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  No verifiable corporate indicators (like official domain, benefits, or founding history) found.
                </p>
              ) : (
                <ul className={`space-y-2 text-xs ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  {positiveSignals.map((sig, i) => (
                    <li key={i} className="flex items-start space-x-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                      <span>{sig}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* User Feedback Callout */}
            <div
              className={`rounded-2xl border p-4 text-xs ${
                isDark
                  ? 'bg-slate-950/60 border-slate-800 text-slate-400'
                  : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className={`font-semibold block ${isDark ? 'text-white' : 'text-slate-900'}`}>Feedback Loop</span>
                  <span className={`text-[11px] ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>Help improve the EMSCAD model</span>
                </div>
                <button
                  type="button"
                  onClick={onOpenFeedback}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer border ${
                    isDark
                      ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                      : 'bg-white border-slate-300 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  Report Inaccuracy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: SHAP Feature Explainability */}
      {activeTab === 'explainability' && (
        <div
          className={`rounded-2xl border p-6 shadow-sm space-y-5 ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div>
            <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              SHAP-Style Model Feature Contribution & Token Impact
            </h3>
            <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Shows which specific tokens, phrases, and metadata signals pushed the ML model towards <strong>Fake</strong> (red, right) versus towards <strong>Genuine</strong> (green, left).
            </p>
          </div>

          <div className="space-y-3 max-w-3xl">
            {featureContributions.map((fc, i) => {
              const isPositive = fc.weight > 0;
              const barWidthPercent = Math.min(100, Math.round(Math.abs(fc.weight) * 100));

              return (
                <div
                  key={i}
                  className={`p-3 rounded-xl border text-xs ${
                    isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center space-x-2">
                      <span className={`font-mono font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {fc.feature}
                      </span>
                      <span
                        className={`text-[10px] capitalize px-1.5 py-0.2 rounded border ${
                          isDark
                            ? 'bg-slate-900 text-slate-400 border-slate-700'
                            : 'bg-white text-slate-400 border-slate-200'
                        }`}
                      >
                        {fc.category.replace('_', ' ')}
                      </span>
                    </div>
                    <span
                      className={`font-mono font-bold ${
                        isPositive ? 'text-rose-400' : 'text-emerald-400'
                      }`}
                    >
                      {isPositive ? `+${fc.weight.toFixed(2)} (Toward Fake)` : `${fc.weight.toFixed(2)} (Toward Genuine)`}
                    </span>
                  </div>

                  {/* Visual Impact Bar */}
                  <div className={`w-full h-2 rounded-full overflow-hidden flex ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}>
                    {isPositive ? (
                      <div
                        className="bg-rose-500 h-full rounded-full transition-all"
                        style={{ width: `${barWidthPercent}%` }}
                      />
                    ) : (
                      <div
                        className="bg-emerald-400 h-full rounded-full transition-all"
                        style={{ width: `${barWidthPercent}%` }}
                      />
                    )}
                  </div>

                  <p className={`text-[11px] mt-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {fc.explanation}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Salary Benchmarking */}
      {activeTab === 'salary' && salaryBenchmark && (
        <div
          className={`rounded-2xl border p-6 shadow-sm space-y-5 ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div>
            <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Compensation Benchmark Analysis
            </h3>
            <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Comparison of stated salary against median market ranges for {salaryBenchmark.seniority} {salaryBenchmark.role}.
            </p>
          </div>

          <div
            className={`p-5 rounded-2xl border max-w-2xl space-y-4 ${
              isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <span className={`text-xs font-semibold uppercase ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Stated Compensation
                </span>
                <div className={`text-2xl font-extrabold mt-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  ${salaryBenchmark.statedAmount?.toLocaleString() || 'N/A'}{' '}
                  <span className={`text-xs font-normal ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                    / year equivalent
                  </span>
                </div>
              </div>

              <span
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                  salaryBenchmark.status === 'unrealistic_high'
                    ? isDark ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' : 'bg-rose-100 text-rose-800 border-rose-300'
                    : salaryBenchmark.status === 'above_market'
                    ? isDark ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-amber-100 text-amber-800 border-amber-300'
                    : isDark ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                }`}
              >
                {salaryBenchmark.status.replace('_', ' ')}
              </span>
            </div>

            {/* Benchmark Visual Spectrum */}
            <div className="space-y-1">
              <div className={`flex justify-between text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                <span>Entry: ${salaryBenchmark.marketMin.toLocaleString()}</span>
                <span className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                  Market Median: ${salaryBenchmark.marketMedian.toLocaleString()}
                </span>
                <span>Upper: ${salaryBenchmark.marketMax.toLocaleString()}</span>
              </div>
              <div className={`w-full h-3 rounded-full overflow-hidden relative ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}>
                <div className="absolute left-[15%] right-[15%] bg-emerald-400 h-full opacity-60" />
              </div>
            </div>

            <p className={`text-xs leading-relaxed pt-2 border-t ${isDark ? 'border-slate-800 text-slate-300' : 'border-slate-200 text-slate-700'}`}>
              {salaryBenchmark.message}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
