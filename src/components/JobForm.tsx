import React, { useState } from 'react';
import { JobInput } from '../types';
import { SAMPLE_JOBS, SampleJob } from '../data/sampleJobs';
import {
  Sparkles,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Search,
  Building,
  DollarSign,
  Mail,
  MapPin,
  Globe,
  FileText,
  AlertTriangle,
} from 'lucide-react';

interface JobFormProps {
  jobInput: JobInput;
  onChange: (field: keyof JobInput, value: any) => void;
  onAnalyze: () => void;
  onLoadPreset: (preset: SampleJob) => void;
  onReset: () => void;
  isAnalyzing: boolean;
  useGemini: boolean;
  onToggleGemini: (enabled: boolean) => void;
  theme?: 'dark' | 'light';
}

export const JobForm: React.FC<JobFormProps> = ({
  jobInput,
  onChange,
  onAnalyze,
  onLoadPreset,
  onReset,
  isAnalyzing,
  useGemini,
  onToggleGemini,
  theme = 'dark',
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const isDark = theme === 'dark';

  const wordCount = (jobInput.description || '').trim().split(/\s+/).filter(Boolean).length;
  const charCount = (jobInput.description || '').length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobInput.description.trim()) return;
    onAnalyze();
  };

  const inputClass = isDark
    ? 'w-full pl-9 pr-3 py-2 text-xs border border-[#23334d] rounded-sm focus:outline-none focus:ring-1 focus:ring-[#2874f0] focus:border-[#2874f0] transition-colors bg-[#0f1a2a] text-slate-100 placeholder:text-slate-500'
    : 'w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-[#2874f0] focus:border-[#2874f0] transition-colors bg-white text-slate-900 placeholder:text-slate-400';

  const plainInputClass = isDark
    ? 'w-full px-3 py-2 text-xs border border-[#23334d] rounded-sm focus:outline-none focus:ring-1 focus:ring-[#2874f0] focus:border-[#2874f0] transition-colors bg-[#0f1a2a] text-slate-100 placeholder:text-slate-500'
    : 'w-full px-3 py-2 text-xs border border-slate-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-[#2874f0] focus:border-[#2874f0] transition-colors bg-white text-slate-900 placeholder:text-slate-400';

  return (
    <div
      className={`rounded-md border transition-colors shadow-sm ${
        isDark
          ? 'bg-[#172337] border-[#23334d] shadow-black/20'
          : 'bg-white border-slate-200/90 shadow-[0_1px_3px_0_rgba(0,0,0,0.06)]'
      }`}
    >
      {/* Header & Presets */}
      <div
        className={`p-4 sm:p-5 border-b transition-colors ${
          isDark
            ? 'border-[#23334d] bg-[#121c2d]'
            : 'border-slate-100 bg-[#fbfcfd]'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className={`text-base font-bold ${isDark ? 'text-white' : 'text-[#212121]'}`}>
                Job Posting Input & Screening
              </h2>
              <span className="bg-blue-600/10 text-blue-600 dark:bg-blue-600/20 dark:text-blue-300 text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider">
                EMSCAD Dataset
              </span>
            </div>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-[#878787]'}`}>
              Paste job description or load verified EMSCAD test cases below
            </p>
          </div>
          <button
            type="button"
            onClick={onReset}
            className={`inline-flex items-center space-x-1.5 text-xs py-1 px-2.5 rounded-sm transition-colors self-start sm:self-auto font-semibold ${
              isDark
                ? 'text-[#ffe500] hover:text-white hover:bg-white/10'
                : 'text-[#2874f0] hover:underline hover:bg-blue-50/50'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Fields</span>
          </button>
        </div>

        {/* 1-Click Test Presets */}
        <div className="space-y-1.5">
          <span className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-[#878787]'}`}>
            Quick Test Scenarios:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {SAMPLE_JOBS.map((preset) => {
              const isSelected = jobInput.title === preset.data.title;
              return (
                <button
                  key={preset.id}
                  id={`preset-btn-${preset.id}`}
                  type="button"
                  onClick={() => onLoadPreset(preset)}
                  className={`text-left p-2.5 rounded-sm border text-xs transition-all relative ${
                    isSelected
                      ? isDark
                        ? 'bg-[#1f3a60] text-white border-[#2874f0] shadow-sm ring-1 ring-[#2874f0]'
                        : 'bg-blue-50/70 text-[#2874f0] border-[#2874f0] shadow-sm ring-1 ring-[#2874f0]'
                      : isDark
                      ? 'bg-[#101b2b] text-slate-300 border-[#23334d] hover:border-[#2874f0]/60 hover:bg-[#152338]'
                      : 'bg-white text-[#212121] border-slate-200 hover:border-[#2874f0]/60 hover:bg-slate-50'
                  }`}
                >
                  <div className="font-bold truncate flex items-center justify-between">
                    <span>{preset.label}</span>
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-[#fb641b]"></span>
                    )}
                  </div>
                  <div className={`text-[10px] mt-0.5 truncate ${isDark ? 'text-slate-400' : 'text-[#878787]'}`}>
                    {preset.data.companyName || 'Anonymous'} • {preset.data.salaryStated || 'No salary'}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Form Fields */}
      <form onSubmit={handleSubmit} className="p-5 space-y-4">
        {/* Row 1: Title & Company */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="job-title-input"
              className={`block text-xs font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}
            >
              Job Title <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <input
                id="job-title-input"
                type="text"
                placeholder="e.g. Remote Data Entry Clerk or Senior Backend Engineer"
                value={jobInput.title}
                onChange={(e) => onChange('title', e.target.value)}
                required
                className={inputClass}
              />
              <FileText className={`w-4 h-4 absolute left-2.5 top-2.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
            </div>
          </div>

          <div>
            <label
              htmlFor="company-name-input"
              className={`block text-xs font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}
            >
              Company Name (Optional)
            </label>
            <div className="relative">
              <input
                id="company-name-input"
                type="text"
                placeholder="e.g. Stripe, Acme Corp, or Apex Global"
                value={jobInput.companyName}
                onChange={(e) => onChange('companyName', e.target.value)}
                className={inputClass}
              />
              <Building className={`w-4 h-4 absolute left-2.5 top-2.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
            </div>
          </div>
        </div>

        {/* Row 2: Salary, Email, Location */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label
              htmlFor="salary-input"
              className={`block text-xs font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}
            >
              Stated Salary / Compensation
            </label>
            <div className="relative">
              <input
                id="salary-input"
                type="text"
                placeholder="e.g. $65/hr or $140,000/yr"
                value={jobInput.salaryStated || ''}
                onChange={(e) => onChange('salaryStated', e.target.value)}
                className={inputClass}
              />
              <DollarSign className={`w-4 h-4 absolute left-2.5 top-2.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
            </div>
          </div>

          <div>
            <label
              htmlFor="contact-email-input"
              className={`block text-xs font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}
            >
              Recruiter / Contact Email
            </label>
            <div className="relative">
              <input
                id="contact-email-input"
                type="email"
                placeholder="e.g. hr@company.com or hiring@gmail.com"
                value={jobInput.contactEmail || ''}
                onChange={(e) => onChange('contactEmail', e.target.value)}
                className={inputClass}
              />
              <Mail className={`w-4 h-4 absolute left-2.5 top-2.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
            </div>
          </div>

          <div>
            <label
              htmlFor="location-input"
              className={`block text-xs font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}
            >
              Location / Headquarters
            </label>
            <div className="relative">
              <input
                id="location-input"
                type="text"
                placeholder="e.g. Remote, US or Seattle, WA"
                value={jobInput.location}
                onChange={(e) => onChange('location', e.target.value)}
                className={inputClass}
              />
              <MapPin className={`w-4 h-4 absolute left-2.5 top-2.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
            </div>
          </div>
        </div>

        {/* Job Description Textarea */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label
              htmlFor="job-description-textarea"
              className={`block text-xs font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}
            >
              Job Description Text <span className="text-rose-400">*</span>
            </label>
            <span className={`text-[11px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              {wordCount} words ({charCount} characters)
            </span>
          </div>
          <textarea
            id="job-description-textarea"
            rows={8}
            placeholder="Paste the complete job posting here, including role overview, duties, interview instructions, payment details, and how to apply..."
            value={jobInput.description}
            onChange={(e) => onChange('description', e.target.value)}
            required
            className={`w-full p-3 text-xs rounded-xl focus:outline-none focus:ring-2 transition-colors font-mono leading-relaxed ${
              isDark
                ? 'bg-slate-950 border border-slate-700/80 text-slate-100 placeholder:text-slate-600 focus:border-emerald-500 focus:ring-emerald-500/20'
                : 'bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:ring-slate-900 focus:border-slate-900'
            }`}
          />
          {wordCount > 0 && wordCount < 40 && (
            <p className="mt-1 text-[11px] text-amber-400 flex items-center space-x-1">
              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>
                Note: Descriptions under 40 words trigger Rule #3 (Generic/Vague Description).
              </span>
            </p>
          )}
        </div>

        {/* Collapsible Advanced Section (EMSCAD Features) */}
        <div className={`border rounded-xl overflow-hidden ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`w-full px-4 py-2.5 text-left text-xs font-medium flex items-center justify-between transition-colors ${
              isDark
                ? 'bg-slate-950/60 hover:bg-slate-950 text-slate-300'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
            }`}
          >
            <div className="flex items-center space-x-2">
              <span>Additional EMSCAD Dataset Metadata & Fields</span>
              <span className={`text-[10px] font-normal ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                (Company profile, requirements, screening questions, logo)
              </span>
            </div>
            {showAdvanced ? (
              <ChevronUp className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
            ) : (
              <ChevronDown className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
            )}
          </button>

          {showAdvanced && (
            <div
              className={`p-4 space-y-4 border-t text-xs ${
                isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
              }`}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Company Website URL
                  </label>
                  <div className="relative">
                    <input
                      type="url"
                      placeholder="https://company.com"
                      value={jobInput.companyWebsite || ''}
                      onChange={(e) => onChange('companyWebsite', e.target.value)}
                      className={inputClass}
                    />
                    <Globe className={`w-3.5 h-3.5 absolute left-2.5 top-2.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                  </div>
                </div>

                <div>
                  <label className={`block font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Department / Function
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Engineering, Operations, Customer Success"
                    value={jobInput.department || ''}
                    onChange={(e) => onChange('department', e.target.value)}
                    className={plainInputClass}
                  />
                </div>
              </div>

              <div>
                <label className={`block font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Company Profile / About the Company (Rule #1 Check)
                </label>
                <textarea
                  rows={3}
                  placeholder="Official company summary, founding year, mission, office presence..."
                  value={jobInput.companyProfile || ''}
                  onChange={(e) => onChange('companyProfile', e.target.value)}
                  className={`w-full p-2.5 rounded-lg text-xs font-mono border ${
                    isDark
                      ? 'bg-slate-950 border-slate-700 text-slate-100 placeholder:text-slate-600'
                      : 'border-slate-300 bg-white text-slate-900 placeholder:text-slate-400'
                  }`}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Requirements & Qualifications
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Degrees, years of experience, technical skills..."
                    value={jobInput.requirements || ''}
                    onChange={(e) => onChange('requirements', e.target.value)}
                    className={`w-full p-2.5 rounded-lg text-xs font-mono border ${
                      isDark
                        ? 'bg-slate-950 border-slate-700 text-slate-100 placeholder:text-slate-600'
                        : 'border-slate-300 bg-white text-slate-900 placeholder:text-slate-400'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Benefits & Perks
                  </label>
                  <textarea
                    rows={3}
                    placeholder="401k, medical/dental, PTO, equity..."
                    value={jobInput.benefits || ''}
                    onChange={(e) => onChange('benefits', e.target.value)}
                    className={`w-full p-2.5 rounded-lg text-xs font-mono border ${
                      isDark
                        ? 'bg-slate-950 border-slate-700 text-slate-100 placeholder:text-slate-600'
                        : 'border-slate-300 bg-white text-slate-900 placeholder:text-slate-400'
                    }`}
                  />
                </div>
              </div>

              {/* Structured Checkbox Indicators */}
              <div className={`pt-2 border-t flex flex-wrap gap-4 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                <label className={`flex items-center space-x-2 text-xs cursor-pointer select-none ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  <input
                    type="checkbox"
                    checked={jobInput.hasCompanyLogo}
                    onChange={(e) => onChange('hasCompanyLogo', e.target.checked)}
                    className="rounded border-slate-700 bg-slate-950 text-emerald-500 focus:ring-emerald-500"
                  />
                  <span>Has Official Company Logo (+0.65 real signal in EMSCAD)</span>
                </label>

                <label className={`flex items-center space-x-2 text-xs cursor-pointer select-none ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  <input
                    type="checkbox"
                    checked={jobInput.hasQuestions}
                    onChange={(e) => onChange('hasQuestions', e.target.checked)}
                    className="rounded border-slate-700 bg-slate-950 text-emerald-500 focus:ring-emerald-500"
                  />
                  <span>Has Screening Questions Configured</span>
                </label>

                <label className={`flex items-center space-x-2 text-xs cursor-pointer select-none ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  <input
                    type="checkbox"
                    checked={jobInput.isTelecommuting}
                    onChange={(e) => onChange('isTelecommuting', e.target.checked)}
                    className="rounded border-slate-700 bg-slate-950 text-emerald-500 focus:ring-emerald-500"
                  />
                  <span>Remote / Telecommuting Position</span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className={`pt-3 border-t flex flex-col sm:flex-row items-center justify-between gap-3 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
          {/* Gemini AI Deep Scan Toggle */}
          <div className="flex items-center space-x-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => onToggleGemini(!useGemini)}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg border text-xs transition-colors ${
                useGemini
                  ? isDark
                    ? 'bg-purple-950/40 border-purple-700/80 text-purple-300 font-medium'
                    : 'bg-purple-50 border-purple-300 text-purple-700 font-medium'
                  : isDark
                  ? 'bg-slate-950/50 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Sparkles className={`w-3.5 h-3.5 ${useGemini ? 'text-purple-400' : 'text-slate-500'}`} />
              <span>Gemini AI Forensic Deep Scan</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                  useGemini
                    ? isDark
                      ? 'bg-purple-900 text-purple-200'
                      : 'bg-purple-200 text-purple-800'
                    : isDark
                    ? 'bg-slate-800 text-slate-400'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {useGemini ? 'ACTIVE' : 'OFF'}
              </span>
            </button>
          </div>

          {/* Primary CTA Button */}
          <button
            id="analyze-job-button"
            type="submit"
            disabled={isAnalyzing || !jobInput.description.trim()}
            className={`w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-8 py-3 rounded-sm text-xs font-extrabold uppercase tracking-wider shadow-md transition-all focus:outline-none cursor-pointer ${
              isDark
                ? 'bg-[#fb641b] hover:bg-[#f45610] disabled:bg-slate-800 disabled:text-slate-500 text-white active:scale-[0.99]'
                : 'bg-[#fb641b] hover:bg-[#f45610] disabled:bg-slate-300 disabled:text-slate-500 text-white active:scale-[0.99]'
            }`}
          >
            {isAnalyzing ? (
              <>
                <span className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin border-white"></span>
                <span>Extracting Vectors & Evaluating Rules...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4 text-white" />
                <span>⚡ Screen & Detect Job Posting</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
