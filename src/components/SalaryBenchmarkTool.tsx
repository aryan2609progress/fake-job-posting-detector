import React, { useState } from 'react';
import { SALARY_BENCHMARKS } from '../data/emscadData';
import { evaluateSalary } from '../utils/redFlagRules';
import { DollarSign } from 'lucide-react';

interface SalaryBenchmarkToolProps {
  theme?: 'dark' | 'light';
}

export const SalaryBenchmarkTool: React.FC<SalaryBenchmarkToolProps> = ({ theme = 'dark' }) => {
  const [selectedRole, setSelectedRole] = useState('data entry');
  const [seniority, setSeniority] = useState<'Junior' | 'Mid' | 'Senior' | 'Lead'>('Junior');
  const [testSalary, setTestSalary] = useState('$65/hr');

  const isDark = theme === 'dark';
  const benchmarkData = SALARY_BENCHMARKS[selectedRole] || SALARY_BENCHMARKS['data entry'];
  const seniorityKey = seniority.toLowerCase() as 'junior' | 'mid' | 'senior' | 'lead';
  const bounds = benchmarkData[seniorityKey];
  const [minBound, maxBound] = bounds;
  const median = Math.round((minBound + maxBound) / 2);

  const evaluation = evaluateSalary(selectedRole, testSalary, seniority);

  const selectClass = isDark
    ? 'w-full p-2 border border-slate-700 rounded-lg bg-slate-950 text-slate-100 text-xs focus:border-emerald-500 focus:outline-none'
    : 'w-full p-2 border border-slate-300 rounded-lg bg-white text-slate-900 text-xs focus:ring-slate-900';

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className={`rounded-2xl border p-6 shadow-lg ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="flex items-center space-x-3 mb-2">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
            isDark ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-600'
          }`}>
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <h2 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Salary Benchmarking & Scam Outlier Detector
            </h2>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Rule #5 Heuristic: Scammers bait victims with entry-level salaries that are 2x-4x standard market compensation.
            </p>
          </div>
        </div>

        {/* Input Controls */}
        <div className={`grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5 p-4 rounded-xl border text-xs ${
          isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <div>
            <label className={`block font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Select Benchmark Role</label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className={selectClass}
            >
              {Object.keys(SALARY_BENCHMARKS).map((role) => (
                <option key={role} value={role}>
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={`block font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Target Experience Level</label>
            <select
              value={seniority}
              onChange={(e) => setSeniority(e.target.value as any)}
              className={selectClass}
            >
              <option value="Junior">Entry-Level / Junior (0-2 yrs)</option>
              <option value="Mid">Mid-Level (2-5 yrs)</option>
              <option value="Senior">Senior (5-8 yrs)</option>
              <option value="Lead">Lead / Staff / Director (8+ yrs)</option>
            </select>
          </div>

          <div>
            <label className={`block font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Proposed Stated Compensation</label>
            <input
              type="text"
              value={testSalary}
              onChange={(e) => setTestSalary(e.target.value)}
              placeholder="e.g. $65/hr or $120,000"
              className={selectClass}
            />
          </div>
        </div>

        {/* Evaluation Output Card */}
        {evaluation && (
          <div className={`mt-6 p-5 rounded-2xl border space-y-4 ${
            isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>
                  Rule #5 Analysis Result
                </span>
                <div className={`text-base font-bold mt-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Equivalent: ${evaluation.statedAmount?.toLocaleString()} / year
                </div>
              </div>

              <span
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border self-start sm:self-auto ${
                  evaluation.status === 'unrealistic_high'
                    ? isDark ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' : 'bg-rose-100 text-rose-800 border-rose-300'
                    : evaluation.status === 'above_market'
                    ? isDark ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-amber-100 text-amber-800 border-amber-300'
                    : isDark ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                }`}
              >
                {evaluation.status === 'unrealistic_high' ? '🚨 SCAM LURE: UNREALISTIC HIGH' : evaluation.status.replace('_', ' ')}
              </span>
            </div>

            <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              {evaluation.message}
            </p>

            {/* Visual Gauge Spectrum */}
            <div className="space-y-1.5 pt-2">
              <div className={`flex justify-between text-[11px] font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                <span>Entry Min: ${minBound.toLocaleString()}</span>
                <span className={`font-bold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>Market Median: ${median.toLocaleString()}</span>
                <span>Upper Ceiling: ${maxBound.toLocaleString()}</span>
              </div>
              <div className={`w-full h-3 rounded-full overflow-hidden relative ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}>
                <div className="absolute left-[20%] right-[20%] bg-emerald-400/50 h-full" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Benchmark Reference Grid */}
      <div className={`rounded-2xl border p-6 shadow-lg ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
        <h3 className={`text-xs font-bold uppercase tracking-wider mb-3 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
          EMSCAD-Calibrated Industry Reference Table (Annual USD)
        </h3>
        <div className="overflow-x-auto">
          <table className={`w-full text-left text-xs ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
            <thead className={`font-semibold border-b ${isDark ? 'bg-slate-950 text-slate-400 border-slate-800' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
              <tr>
                <th className="py-2.5 px-4">Role Title</th>
                <th className="py-2.5 px-4">Junior Range</th>
                <th className="py-2.5 px-4">Mid Range</th>
                <th className="py-2.5 px-4">Senior Range</th>
                <th className="py-2.5 px-4">Scam Trigger Threshold</th>
              </tr>
            </thead>
            <tbody className={`divide-y font-mono ${isDark ? 'divide-slate-800' : 'divide-slate-100'}`}>
              {Object.entries(SALARY_BENCHMARKS).map(([role, boundsMap]) => (
                <tr key={role} className={isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}>
                  <td className={`py-2 px-4 font-sans font-medium capitalize ${isDark ? 'text-white' : 'text-slate-900'}`}>{role}</td>
                  <td className={`py-2 px-4 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>${boundsMap.junior[0].toLocaleString()} - ${boundsMap.junior[1].toLocaleString()}</td>
                  <td className={`py-2 px-4 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>${boundsMap.mid[0].toLocaleString()} - ${boundsMap.mid[1].toLocaleString()}</td>
                  <td className={`py-2 px-4 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>${boundsMap.senior[0].toLocaleString()} - ${boundsMap.senior[1].toLocaleString()}</td>
                  <td className="py-2 px-4 text-rose-400 font-bold">&gt; ${(boundsMap.junior[1] * 1.6).toLocaleString()} for Entry</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
