import React, { useState } from 'react';
import {
  EMSCAD_DATASET_STATS,
  MODEL_METRICS,
  CONFUSION_MATRIX,
  TFIDF_FEATURE_WEIGHTS
} from '../data/emscadData';

interface ModelEvaluationHubProps {
  theme?: 'dark' | 'light';
}

export const ModelEvaluationHub: React.FC<ModelEvaluationHubProps> = ({ theme = 'dark' }) => {
  const [activeSubTab, setActiveSubTab] = useState<'metrics' | 'confusion' | 'dataset' | 'features'>('metrics');
  const isDark = theme === 'dark';

  const scamTokens = Object.entries(TFIDF_FEATURE_WEIGHTS)
    .filter(([_, info]) => info.weight > 0)
    .sort((a, b) => b[1].weight - a[1].weight);

  const genuineTokens = Object.entries(TFIDF_FEATURE_WEIGHTS)
    .filter(([_, info]) => info.weight < 0)
    .sort((a, b) => a[1].weight - b[1].weight);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className={`rounded-2xl border p-6 shadow-lg ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                isDark ? 'bg-purple-950/50 text-purple-300 border-purple-800' : 'bg-purple-50 text-purple-700 border-purple-200'
              }`}>
                Kaggle EMSCAD Benchmark
              </span>
              <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>17,880 Annotated Postings</span>
            </div>
            <h2 className={`text-lg font-bold mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Dataset Statistics, Model Benchmark & Evaluation Hub
            </h2>
            <p className={`text-xs mt-1 max-w-3xl leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Why <strong>Recall matters most:</strong> In fraud detection, missing an active employment scam (False Negative) results in victim financial loss or identity theft, whereas a false alarm (False Positive) merely causes a quick manual check.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <div className={`p-3 rounded-xl border text-center min-w-[120px] ${
              isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <span className={`text-[10px] uppercase font-semibold ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>Best Recall</span>
              <div className={`text-xl font-extrabold mt-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>86.8%</div>
              <span className="text-[10px] text-emerald-400 font-medium">XGBoost (Fake)</span>
            </div>
            <div className={`p-3 rounded-xl border text-center min-w-[120px] ${
              isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <span className={`text-[10px] uppercase font-semibold ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>ROC-AUC</span>
              <div className={`text-xl font-extrabold mt-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>0.984</div>
              <span className="text-[10px] text-purple-400 font-medium">High Separability</span>
            </div>
          </div>
        </div>

        {/* Sub-nav pills */}
        <div className={`flex border-t pt-4 mt-4 gap-2 overflow-x-auto ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
          {[
            { id: 'metrics', label: 'Model Comparison Table' },
            { id: 'confusion', label: 'Confusion Matrix (XGBoost)' },
            { id: 'dataset', label: 'EMSCAD Dataset Distribution' },
            { id: 'features', label: 'TF-IDF Learned Weights' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeSubTab === tab.id
                  ? isDark
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'bg-slate-900 text-white'
                  : isDark
                  ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab 1: Model Comparison Table */}
      {activeSubTab === 'metrics' && (
        <div className={`rounded-2xl border shadow-lg overflow-hidden p-6 space-y-4 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div>
            <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Model Comparison on Fraudulent Class (Test Split = 20%, Stratified)
            </h3>
            <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Evaluating TF-IDF features (unigram + bigram, 10,000 vocab) combined with binary metadata flags.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className={`w-full text-left text-xs ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
              <thead className={`font-semibold border-b ${isDark ? 'bg-slate-950 text-slate-400 border-slate-800' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                <tr>
                  <th className="py-3 px-4">Classifier Architecture</th>
                  <th className="py-3 px-4">Overall Accuracy</th>
                  <th className="py-3 px-4">Precision (Fake)</th>
                  <th className="py-3 px-4 font-bold text-purple-400">Recall (Fake) ⭐</th>
                  <th className="py-3 px-4">F1-Score (Fake)</th>
                  <th className="py-3 px-4">ROC-AUC</th>
                  <th className="py-3 px-4">Notes & Tradeoffs</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-100'}`}>
                {MODEL_METRICS.map((m, idx) => {
                  const isBest = m.modelName.includes('XGBoost');
                  return (
                    <tr
                      key={idx}
                      className={
                        isBest
                          ? isDark ? 'bg-purple-950/20 font-medium' : 'bg-purple-50/20 font-medium'
                          : isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50/60'
                      }
                    >
                      <td className="py-3.5 px-4">
                        <div className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{m.modelName}</div>
                        {isBest && (
                          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                            isDark ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            PRODUCTION PICK
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-mono">{m.accuracy}%</td>
                      <td className="py-3.5 px-4 font-mono">{m.precisionFake}%</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-purple-400">
                        {m.recallFake}%
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold">{m.f1Fake}%</td>
                      <td className="py-3.5 px-4 font-mono">{m.rocAuc}</td>
                      <td className={`py-3.5 px-4 max-w-sm text-[11px] leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {m.description}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className={`p-4 rounded-xl border text-xs leading-relaxed ${
            isDark ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-600'
          }`}>
            <strong className={isDark ? 'text-white' : 'text-slate-800'}>Key Takeaway for ML System Design: </strong>
            Because only ~4.8% of the dataset is fraudulent, a trivial dummy baseline predicting "Genuine" 100% of the time yields <strong>95.2% accuracy</strong> while catching 0 scams. That's why <strong>Recall on the minority class (86.8%)</strong> and <strong>F1-score (88.1%)</strong> are the true performance indicators.
          </div>
        </div>
      )}

      {/* Tab 2: Confusion Matrix */}
      {activeSubTab === 'confusion' && (
        <div className={`rounded-2xl border p-6 shadow-lg space-y-6 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div>
            <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Confusion Matrix Visualization (XGBoost on Test Set: N = 3,576)
            </h3>
            <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Breakdown of correct predictions vs false alarms and missed scams.
            </p>
          </div>

          <div className={`max-w-xl mx-auto p-6 rounded-2xl border space-y-4 ${
            isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="grid grid-cols-2 gap-3 text-center">
              {/* True Negative */}
              <div className={`p-4 rounded-xl border ${
                isDark ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-300' : 'bg-emerald-50 border-emerald-200'
              }`}>
                <span className="text-[10px] font-bold uppercase tracking-wider block">
                  True Negative (TN)
                </span>
                <span className="text-3xl font-extrabold my-1 block text-emerald-400">
                  {CONFUSION_MATRIX.trueNegative.toLocaleString()}
                </span>
                <span className={`text-xs ${isDark ? 'text-emerald-300' : 'text-emerald-600'}`}>
                  Real jobs correctly classified as Genuine
                </span>
              </div>

              {/* False Positive */}
              <div className={`p-4 rounded-xl border ${
                isDark ? 'bg-amber-950/30 border-amber-800/60 text-amber-300' : 'bg-amber-50 border-amber-200'
              }`}>
                <span className="text-[10px] font-bold uppercase tracking-wider block">
                  False Positive (FP)
                </span>
                <span className="text-3xl font-extrabold my-1 block text-amber-400">
                  {CONFUSION_MATRIX.falsePositive}
                </span>
                <span className={`text-xs ${isDark ? 'text-amber-300' : 'text-amber-600'}`}>
                  Real jobs falsely flagged (0.5% false alarm)
                </span>
              </div>

              {/* False Negative */}
              <div className={`p-4 rounded-xl border ${
                isDark ? 'bg-rose-950/30 border-rose-800/60 text-rose-300' : 'bg-rose-50 border-rose-200'
              }`}>
                <span className="text-[10px] font-bold uppercase tracking-wider block">
                  False Negative (FN) ⚠️
                </span>
                <span className="text-3xl font-extrabold my-1 block text-rose-400">
                  {CONFUSION_MATRIX.falseNegative}
                </span>
                <span className="text-xs font-medium text-rose-300">
                  Fake jobs missed (Worst case error)
                </span>
              </div>

              {/* True Positive */}
              <div className={`p-4 rounded-xl border ${
                isDark ? 'bg-purple-950/30 border-purple-800/60 text-purple-300' : 'bg-purple-50 border-purple-200'
              }`}>
                <span className="text-[10px] font-bold uppercase tracking-wider block">
                  True Positive (TP) ⭐
                </span>
                <span className="text-3xl font-extrabold my-1 block text-purple-400">
                  {CONFUSION_MATRIX.truePositive}
                </span>
                <span className={`text-xs ${isDark ? 'text-purple-300' : 'text-purple-600'}`}>
                  Fake jobs successfully caught (86.8% recall)
                </span>
              </div>
            </div>

            <div className={`text-[11px] text-center ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Total Test Samples: { (CONFUSION_MATRIX.trueNegative + CONFUSION_MATRIX.falsePositive + CONFUSION_MATRIX.falseNegative + CONFUSION_MATRIX.truePositive).toLocaleString()} (3,403 Legitimate + 173 Fraudulent)
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Dataset Distribution */}
      {activeSubTab === 'dataset' && (
        <div className={`rounded-2xl border p-6 shadow-lg space-y-5 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div>
            <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              EMSCAD (Employment Scam Aegean Dataset) Characteristics
            </h3>
            <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              17,880 real-world job postings collected between 2012 and 2014 by researchers at the University of the Aegean.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            {[
              { title: 'Class Balance', val: '95.16% Real vs 4.84% Fake', sub: '17,014 legitimate vs 866 fraudulent postings' },
              { title: 'Company Logo Presence', val: '81.8% Real vs 31.6% Fake', sub: 'Missing logo is a strong predictor of scam' },
              { title: 'Missing Company Profile', val: '62.1% in Fake vs 16.5% in Real', sub: 'Rule #1 direct empirical justification' },
              { title: 'Telecommuting Frequency', val: '18.0% in Fake vs 4.2% in Real', sub: 'Scammers heavily exploit remote tropes' },
              { title: 'Screening Questions Used', val: '50.3% in Real vs 25.4% in Fake', sub: 'Scam postings avoid detailed pre-screening' },
              { title: 'Common Fake Job Titles', val: 'Data Entry, Virtual Assistant, Clerk', sub: 'Target low-skill / high-volume seekers' },
            ].map((stat, i) => (
              <div
                key={i}
                className={`p-4 rounded-xl border ${
                  isDark ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <span className={`font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{stat.title}</span>
                <div className={`text-base font-bold mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{stat.val}</div>
                <p className={`text-[11px] mt-1 ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>{stat.sub}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: TF-IDF Learned Weights */}
      {activeSubTab === 'features' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Scam-pushing tokens */}
          <div className={`rounded-2xl border p-5 shadow-lg space-y-3 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-400" />
                <span>Top Scam-Predicting N-Grams (Pushes toward Fake)</span>
              </h3>
              <p className={`text-[11px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>
                Learned TF-IDF coefficient weights pushing log-odds toward fraudulent
              </p>
            </div>

            <div className="space-y-2">
              {scamTokens.slice(0, 10).map(([phrase, info], idx) => (
                <div
                  key={idx}
                  className={`p-2.5 rounded-lg border flex items-center justify-between text-xs ${
                    isDark ? 'bg-rose-950/20 border-rose-800/40 text-rose-200' : 'bg-rose-50/50 border-rose-100 text-slate-900'
                  }`}
                >
                  <div>
                    <span className={`font-mono font-bold ${isDark ? 'text-rose-300' : 'text-slate-900'}`}>"{phrase}"</span>
                    <div className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{info.reason}</div>
                  </div>
                  <span className="font-mono font-bold text-rose-400">+{info.weight.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Genuine-pushing tokens */}
          <div className={`rounded-2xl border p-5 shadow-lg space-y-3 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Top Legitimacy-Predicting N-Grams (Pushes toward Genuine)</span>
              </h3>
              <p className={`text-[11px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>
                Learned TF-IDF coefficient weights pushing log-odds toward legitimate
              </p>
            </div>

            <div className="space-y-2">
              {genuineTokens.slice(0, 10).map(([phrase, info], idx) => (
                <div
                  key={idx}
                  className={`p-2.5 rounded-lg border flex items-center justify-between text-xs ${
                    isDark ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-200' : 'bg-emerald-50/50 border-emerald-100 text-slate-900'
                  }`}
                >
                  <div>
                    <span className={`font-mono font-bold ${isDark ? 'text-emerald-300' : 'text-slate-900'}`}>"{phrase}"</span>
                    <div className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{info.reason}</div>
                  </div>
                  <span className="font-mono font-bold text-emerald-400">{info.weight.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
