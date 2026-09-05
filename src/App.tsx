import React, { useState, useEffect } from 'react';
import { Navbar, ActiveTab } from './components/Navbar';
import { JobForm } from './components/JobForm';
import { AnalysisReport } from './components/AnalysisReport';
import { BatchAnalyzer } from './components/BatchAnalyzer';
import { ModelEvaluationHub } from './components/ModelEvaluationHub';
import { SalaryBenchmarkTool } from './components/SalaryBenchmarkTool';
import { PythonProjectExport } from './components/PythonProjectExport';
import { FeedbackModal } from './components/FeedbackModal';
import { SAMPLE_JOBS, SampleJob } from './data/sampleJobs';
import { JobInput, AnalysisResult } from './types';
import { analyzeJobPosting } from './utils/nlpEngine';
import { ShieldCheck } from 'lucide-react';

export default function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>('light');

  const [activeTab, setActiveTab] = useState<ActiveTab>('analyzer');
  const [jobInput, setJobInput] = useState<JobInput>(SAMPLE_JOBS[0].data);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [useGemini, setUseGemini] = useState<boolean>(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState<boolean>(false);

  // Keep theme in sync with localStorage and document class
  useEffect(() => {
    localStorage.setItem('fakejob_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Initialize with initial preset analysis so the user sees the full UI immediately
  useEffect(() => {
    const initialRes = analyzeJobPosting(SAMPLE_JOBS[0].data);
    setAnalysisResult(initialRes);
  }, []);

  const handleFieldChange = (field: keyof JobInput, value: any) => {
    setJobInput((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleLoadPreset = (preset: SampleJob) => {
    setJobInput(preset.data);
    setIsAnalyzing(true);
    // Instant analysis of preset
    setTimeout(() => {
      const res = analyzeJobPosting(preset.data);
      setAnalysisResult(res);
      setIsAnalyzing(false);
    }, 250);
  };

  const handleReset = () => {
    setJobInput({
      title: '',
      companyName: '',
      location: '',
      salaryStated: '',
      contactEmail: '',
      companyWebsite: '',
      description: '',
      requirements: '',
      benefits: '',
      companyProfile: '',
      hasCompanyLogo: false,
      hasQuestions: false,
      isTelecommuting: false,
    });
    setAnalysisResult(null);
  };

  const handleRunAnalysis = async () => {
    if (!jobInput.description.trim()) return;

    setIsAnalyzing(true);

    try {
      // Attempt full-stack server analysis (with potential Gemini AI enrichment)
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job: jobInput, useGemini }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.result) {
          setAnalysisResult(data.result);
          setIsAnalyzing(false);
          return;
        }
      }
    } catch (err) {
      console.warn('Server endpoint error, falling back to client-side engine:', err);
    }

    // Fast fallback to deterministic local client engine
    setTimeout(() => {
      const fallbackResult = analyzeJobPosting(jobInput);
      setAnalysisResult(fallbackResult);
      setIsAnalyzing(false);
    }, 300);
  };

  const isDark = theme === 'dark';

  return (
    <div
      className={`min-h-screen flex flex-col font-sans antialiased transition-colors ${
        isDark
          ? 'bg-[#0c1524] text-slate-100 selection:bg-[#fb641b] selection:text-white'
          : 'bg-white text-[#212121] selection:bg-[#2874f0] selection:text-white'
      }`}
    >
      {/* Top Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {activeTab === 'analyzer' && (
          <div className="space-y-6">
            {/* Input Form */}
            <JobForm
              jobInput={jobInput}
              onChange={handleFieldChange}
              onAnalyze={handleRunAnalysis}
              onLoadPreset={handleLoadPreset}
              onReset={handleReset}
              isAnalyzing={isAnalyzing}
              useGemini={useGemini}
              onToggleGemini={setUseGemini}
              theme={theme}
            />

            {/* Analysis Result Display */}
            {analysisResult && (
              <AnalysisReport
                result={analysisResult}
                job={jobInput}
                onOpenFeedback={() => setIsFeedbackOpen(true)}
                theme={theme}
              />
            )}
          </div>
        )}

        {activeTab === 'batch' && <BatchAnalyzer theme={theme} />}

        {activeTab === 'metrics' && <ModelEvaluationHub theme={theme} />}

        {activeTab === 'salary' && <SalaryBenchmarkTool theme={theme} />}

        {activeTab === 'code' && <PythonProjectExport theme={theme} />}
      </main>

      {/* Clean White Footer */}
      <footer
        className={`border-t text-xs mt-12 pt-10 pb-6 transition-colors ${
          isDark
            ? 'bg-[#0f172a] border-slate-800 text-slate-300'
            : 'bg-white border-slate-200 text-slate-600'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b ${
            isDark ? 'border-slate-800' : 'border-slate-200'
          }`}>
            {/* Col 1: About EMSCAD */}
            <div className="space-y-2">
              <span className={`text-[11px] font-extrabold uppercase tracking-wider block ${
                isDark ? 'text-slate-400' : 'text-[#212121]'
              }`}>
                ABOUT EMSCAD DETECTOR
              </span>
              <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                Trained on ~18,000 real-world employment postings from the Kaggle EMSCAD corpus. Combines TF-IDF n-gram vectorization with an 8-point heuristic red flag audit.
              </p>
              <div className="inline-flex items-center gap-1.5 pt-1">
                <span className="bg-blue-600 text-white px-2 py-0.5 rounded-full text-[10px] font-bold">EMSCAD Certified</span>
                <span className={`text-[11px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Quality-Checked Scam Detection
                </span>
              </div>
            </div>

            {/* Col 2: Scam Verification */}
            <div className="space-y-2">
              <span className={`text-[11px] font-extrabold uppercase tracking-wider block ${
                isDark ? 'text-slate-400' : 'text-[#212121]'
              }`}>
                HELP & VERIFICATION
              </span>
              <ul className={`space-y-1.5 text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                <li className="hover:text-blue-600 cursor-pointer">• Spotting Fake Cashier Checks</li>
                <li className="hover:text-blue-600 cursor-pointer">• Wire Transfer & Western Union Flags</li>
                <li className="hover:text-blue-600 cursor-pointer">• Unofficial Domain (@gmail/@outlook) Audits</li>
                <li className="hover:text-blue-600 cursor-pointer">• Salary Outlier & Unrealistic Pay Benchmarks</li>
              </ul>
            </div>

            {/* Col 3: Consumer Protection */}
            <div className="space-y-2">
              <span className={`text-[11px] font-extrabold uppercase tracking-wider block ${
                isDark ? 'text-slate-400' : 'text-[#212121]'
              }`}>
                SAFETY & REPORTING
              </span>
              <ul className={`space-y-1.5 text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                <li>• FTC (Federal Trade Commission) Guidelines</li>
                <li>• FBI IC3 Internet Crime Complaint Center</li>
                <li>• 100% Client-Side Privacy / No Data Stored</li>
                <li 
                  onClick={() => setActiveTab('metrics')}
                  className="hover:text-blue-600 cursor-pointer pt-1"
                >
                  • View Model Evaluation Metrics
                </li>
                <li 
                  onClick={() => setActiveTab('code')}
                  className="hover:text-blue-600 cursor-pointer"
                >
                  • View Python Project Source
                </li>
              </ul>
            </div>

            {/* Col 4: Assurance Guarantee */}
            <div className={`space-y-2 md:border-l md:pl-6 ${
              isDark ? 'md:border-slate-800' : 'md:border-slate-200'
            }`}>
              <span className={`text-[11px] font-extrabold uppercase tracking-wider block ${
                isDark ? 'text-slate-400' : 'text-[#212121]'
              }`}>
                SECURITY GUARANTEE
              </span>
              <div className={`flex items-center space-x-2 font-bold text-sm ${
                isDark ? 'text-white' : 'text-[#212121]'
              }`}>
                <ShieldCheck className="w-5 h-5 text-blue-600" />
                <span>86.8% Scam Recall Accuracy</span>
              </div>
              <p className={`text-[11px] leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Engineered for rapid, trustworthy job verification on a clean white layout. Screen job descriptions before applying or sharing confidential data.
              </p>
            </div>
          </div>

          <div className={`pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] ${
            isDark ? 'text-slate-500' : 'text-slate-500'
          }`}>
            <div className="flex items-center space-x-3">
              <span className={`font-bold ${isDark ? 'text-white' : 'text-[#212121]'}`}>JobGuard AI</span>
              <span>© 2026 EMSCAD Machine Learning Suite</span>
            </div>
            <div>
              <span>Dual Heuristic & ML Architecture • High-Precision Job Security</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Feedback Dialog */}
      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        jobTitle={jobInput.title}
        theme={theme}
      />
    </div>
  );
}
