import React, { useState } from 'react';
import { JobInput, AnalysisResult, BatchJobItem } from '../types';
import { analyzeJobPosting } from '../utils/nlpEngine';
import {
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Play,
} from 'lucide-react';

const SAMPLE_CSV_TEXT = `title,company,salary,email,location,description
Remote Data Entry Clerk,Apex Global,$65/hr,hiring@gmail.com,Remote,"URGENT HIRING! Apply immediately. Cashier check provided to buy equipment. Wire remaining funds via Western Union."
Senior Staff Engineer,Google,$220000/yr,jobs@google.com,"Mountain View, CA","Design distributed systems in Go and C++. Collaborate with team. 401k match, health dental vision, bachelor degree required."
Virtual Executive Assistant,Horizon LLC,$95000/yr,horizon.jobs@outlook.com,Remote,"Assist director with wire transfer logs and confidential errands. Act now. Contact via Telegram."
Marketing Coordinator,HubSpot,$62000/yr,recruiting@hubspot.com,"Boston, MA","Coordinate content campaigns. 2+ years experience. Comprehensive benefits, equal opportunity employer."`;

interface BatchAnalyzerProps {
  theme?: 'dark' | 'light';
}

export const BatchAnalyzer: React.FC<BatchAnalyzerProps> = ({ theme = 'dark' }) => {
  const [csvText, setCsvText] = useState(SAMPLE_CSV_TEXT);
  const [batchItems, setBatchItems] = useState<BatchJobItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedItem, setSelectedItem] = useState<BatchJobItem | null>(null);

  const isDark = theme === 'dark';

  const parseAndRunBatch = () => {
    setIsProcessing(true);
    try {
      const lines = csvText.trim().split('\n');
      if (lines.length <= 1) {
        setIsProcessing(false);
        return;
      }

      const parsedItems: BatchJobItem[] = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (!line.trim()) continue;

        const match = line.match(/(?:^|,)("(?:[^"]|"")*"|[^,]*)/g);
        if (!match) continue;

        const cells = match.map(c => c.replace(/^,/, '').replace(/^"|"$/g, '').replace(/""/g, '"').trim());

        const title = cells[0] || `Job #${i}`;
        const company = cells[1] || 'Unknown Company';
        const salary = cells[2] || '';
        const email = cells[3] || '';
        const location = cells[4] || 'Remote';
        const description = cells[5] || cells.slice(5).join(' ') || title;

        const jobInput: JobInput = {
          title,
          companyName: company,
          salaryStated: salary,
          contactEmail: email,
          location,
          description,
          hasCompanyLogo: false,
          hasQuestions: false,
          isTelecommuting: true
        };

        const result = analyzeJobPosting(jobInput);

        parsedItems.push({
          id: `batch-${i}`,
          title,
          company,
          snippet: description.slice(0, 120),
          salary,
          email,
          status: 'completed',
          result
        });
      }

      setBatchItems(parsedItems);
    } catch (err) {
      console.error('CSV parse error', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const fakeCount = batchItems.filter(b => b.result?.classification === 'Fake').length;
  const suspiciousCount = batchItems.filter(b => b.result?.classification === 'Suspicious').length;
  const genuineCount = batchItems.filter(b => b.result?.classification === 'Genuine').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className={`rounded-2xl border p-6 shadow-lg ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className={`text-base font-bold flex items-center space-x-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <UploadCloud className="w-5 h-5 text-emerald-400" />
              <span>Batch Job Posting Scanner</span>
            </h2>
            <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Screen multiple job listings at once. Paste CSV text or upload job posting feeds to run bulk scam analysis.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCsvText(SAMPLE_CSV_TEXT)}
              className={`px-3 py-2 rounded-sm border text-xs font-semibold transition-colors ${
                isDark
                  ? 'border-[#23334d] bg-[#101b2b] text-slate-300 hover:bg-[#192b45]'
                  : 'border-slate-300 bg-white text-[#2874f0] hover:bg-blue-50/50'
              }`}
            >
              Reset Sample CSV
            </button>
            <button
              onClick={parseAndRunBatch}
              disabled={isProcessing || !csvText.trim()}
              className={`inline-flex items-center space-x-1.5 px-6 py-2 rounded-sm text-xs font-extrabold uppercase tracking-wider shadow-md transition-colors cursor-pointer ${
                isDark
                  ? 'bg-[#fb641b] hover:bg-[#f45610] text-white disabled:bg-slate-800 disabled:text-slate-500'
                  : 'bg-[#fb641b] hover:bg-[#f45610] text-white disabled:bg-slate-300 disabled:text-slate-500'
              }`}
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isProcessing ? 'Processing...' : '⚡ Run Bulk Screen'}</span>
            </button>
          </div>
        </div>

        {/* CSV Input Area */}
        <div className="mt-4">
          <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            CSV Input (Headers: title, company, salary, email, location, description)
          </label>
          <textarea
            rows={5}
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            className={`w-full p-3 text-xs font-mono rounded-xl focus:outline-none focus:ring-2 border ${
              isDark
                ? 'bg-slate-950 border-slate-700/80 text-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20'
                : 'bg-slate-50/50 border-slate-300 focus:ring-slate-900'
            }`}
            placeholder="Paste CSV rows..."
          />
        </div>
      </div>

      {/* Summary KPI Cards (after batch run) */}
      {batchItems.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className={`p-4 rounded-xl border shadow-xs ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <span className={`text-[11px] font-medium uppercase ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Total Screened
            </span>
            <div className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{batchItems.length}</div>
          </div>
          <div className={`p-4 rounded-xl border shadow-xs ${isDark ? 'bg-rose-950/20 border-rose-800/40 text-rose-300' : 'bg-rose-50/20 border-rose-200 text-rose-600'}`}>
            <span className="text-[11px] font-medium uppercase">Scams Detected (Fake)</span>
            <div className="text-2xl font-bold mt-1 text-rose-400">{fakeCount}</div>
          </div>
          <div className={`p-4 rounded-xl border shadow-xs ${isDark ? 'bg-amber-950/20 border-amber-800/40 text-amber-300' : 'bg-amber-50/20 border-amber-200 text-amber-600'}`}>
            <span className="text-[11px] font-medium uppercase">Needs Review</span>
            <div className="text-2xl font-bold mt-1 text-amber-400">{suspiciousCount}</div>
          </div>
          <div className={`p-4 rounded-xl border shadow-xs ${isDark ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-300' : 'bg-emerald-50/20 border-emerald-200 text-emerald-600'}`}>
            <span className="text-[11px] font-medium uppercase">Verified Genuine</span>
            <div className="text-2xl font-bold mt-1 text-emerald-400">{genuineCount}</div>
          </div>
        </div>
      )}

      {/* Results Table */}
      {batchItems.length > 0 && (
        <div className={`rounded-2xl border shadow-lg overflow-hidden ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className={`p-4 border-b flex items-center justify-between ${isDark ? 'border-slate-800 bg-slate-950/40' : 'border-slate-100'}`}>
            <h3 className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Batch Classification Report
            </h3>
            <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              Click any row to inspect full red flags
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className={`w-full text-left text-xs ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
              <thead className={`font-semibold border-b ${isDark ? 'bg-slate-950 text-slate-400 border-slate-800' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                <tr>
                  <th className="py-3 px-4">Classification</th>
                  <th className="py-3 px-4">Risk Score</th>
                  <th className="py-3 px-4">Job Title & Company</th>
                  <th className="py-3 px-4">Stated Pay</th>
                  <th className="py-3 px-4">Top Red Flags Triggered</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-100'}`}>
                {batchItems.map((item) => {
                  const res = item.result!;
                  const isFake = res.classification === 'Fake';
                  const isSuspicious = res.classification === 'Suspicious';

                  return (
                    <tr
                      key={item.id}
                      onClick={() => setSelectedItem(item)}
                      className={`cursor-pointer transition-colors ${isDark ? 'hover:bg-slate-800/60' : 'hover:bg-slate-50/80'}`}
                    >
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full font-bold text-[11px] border ${
                            isFake
                              ? isDark ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' : 'bg-rose-50 text-rose-700 border-rose-200'
                              : isSuspicious
                              ? isDark ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-amber-50 text-amber-700 border-amber-200'
                              : isDark ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          {isFake ? <ShieldAlert className="w-3 h-3" /> : isSuspicious ? <AlertTriangle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                          <span>{res.classification}</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold whitespace-nowrap">
                        <span className={isFake ? 'text-rose-400' : isSuspicious ? 'text-amber-400' : 'text-emerald-400'}>
                          {res.riskScore}%
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.title}</div>
                        <div className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>{item.company}</div>
                      </td>

                      <td className={`py-3.5 px-4 font-mono text-[11px] ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                        {item.salary || '—'}
                      </td>

                      <td className={`py-3.5 px-4 max-w-xs truncate text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {res.redFlags.length > 0
                          ? res.redFlags.map(f => f.ruleName).join(', ')
                          : 'None — All 8 rules passed'}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedItem(item);
                          }}
                          className="text-emerald-400 hover:text-emerald-300 font-medium text-[11px]"
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail Modal for Selected Batch Item */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className={`rounded-2xl max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4 border ${
            isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-start justify-between">
              <div>
                <span className={`text-xs font-semibold uppercase ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>
                  Inspecting Batch Posting
                </span>
                <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{selectedItem.title}</h3>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{selectedItem.company} • {selectedItem.salary || 'No salary'}</p>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className={`text-sm font-bold p-1 ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-400 hover:text-slate-600'}`}
              >
                ✕
              </button>
            </div>

            <div className={`p-3 rounded-xl border text-xs ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <div className={`font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Raw Description Excerpt:</div>
              <p className={`font-mono text-[11px] whitespace-pre-wrap ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{selectedItem.snippet}</p>
            </div>

            {selectedItem.result && (
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <span className={`text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Classification:</span>
                  <span className="font-bold text-xs">{selectedItem.result.classification} ({selectedItem.result.riskScore}% risk)</span>
                </div>

                <div className="space-y-2">
                  <span className={`text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Triggered Red Flags ({selectedItem.result.redFlags.length}):
                  </span>
                  {selectedItem.result.redFlags.map((flag, idx) => (
                    <div
                      key={idx}
                      className={`p-2.5 rounded-lg border text-xs ${
                        isDark ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      <div className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{flag.title}</div>
                      <div className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{flag.reason}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2 text-right">
              <button
                onClick={() => setSelectedItem(null)}
                className={`px-4 py-2 rounded-lg text-xs font-medium ${
                  isDark ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold' : 'bg-slate-900 text-white'
                }`}
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
