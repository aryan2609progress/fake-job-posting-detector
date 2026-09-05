import React, { useState } from 'react';
import { PYTHON_PROJECT_FILES, PythonFile } from '../data/pythonCodeArtifacts';
import { Copy, Check, Download, FileCode, FolderGit2 } from 'lucide-react';

interface PythonProjectExportProps {
  theme?: 'dark' | 'light';
}

export const PythonProjectExport: React.FC<PythonProjectExportProps> = ({ theme = 'dark' }) => {
  const [selectedFile, setSelectedFile] = useState<PythonFile>(PYTHON_PROJECT_FILES[0]);
  const [copied, setCopied] = useState(false);

  const isDark = theme === 'dark';

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([selectedFile.code], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = selectedFile.filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className={`rounded-2xl border p-6 shadow-lg ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                isDark ? 'bg-blue-950/40 text-blue-300 border-blue-800' : 'bg-blue-50 text-blue-700 border-blue-200'
              }`}>
                Python Streamlit & ML Pipeline
              </span>
              <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>Folder Structure from Spec</span>
            </div>
            <h2 className={`text-lg font-bold mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Complete Python Repository Files & Source Code
            </h2>
            <p className={`text-xs mt-1 max-w-3xl leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Every file specified in Section 6 of the project prompt is ready to inspect, copy, or download. Run locally with Python, pandas, scikit-learn, XGBoost, and Streamlit.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopy}
              className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                isDark
                  ? 'bg-slate-800 border-slate-700 hover:bg-slate-750 text-slate-200'
                  : 'bg-white border-slate-300 hover:bg-slate-50 text-slate-700'
              }`}
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Code'}</span>
            </button>

            <button
              onClick={handleDownload}
              className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shadow-sm ${
                isDark
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold'
                  : 'bg-slate-900 hover:bg-slate-800 text-white'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download {selectedFile.filename}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Code Browser Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        {/* Left File Tree Sidebar */}
        <div className={`rounded-2xl border p-4 shadow-lg space-y-2 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className={`text-xs font-bold uppercase tracking-wider px-2 py-1 flex items-center space-x-1.5 ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>
            <FolderGit2 className="w-4 h-4 text-emerald-400" />
            <span>fake-job-detector/</span>
          </div>

          <div className="space-y-1">
            {PYTHON_PROJECT_FILES.map((file) => {
              const isSelected = selectedFile.filename === file.filename;
              return (
                <button
                  key={file.filename}
                  onClick={() => setSelectedFile(file)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors flex items-center space-x-2 ${
                    isSelected
                      ? isDark
                        ? 'bg-emerald-500/15 text-emerald-300 font-semibold border border-emerald-500/30'
                        : 'bg-slate-900 text-white font-medium'
                      : isDark
                      ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <FileCode className={`w-3.5 h-3.5 ${isSelected ? 'text-emerald-400' : isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                  <span className="truncate">{file.path}</span>
                </button>
              );
            })}
          </div>

          <div className={`pt-4 border-t text-[11px] px-2 ${isDark ? 'border-slate-800 text-slate-400' : 'border-slate-100 text-slate-400'}`}>
            <strong className={`block mb-1 font-semibold ${isDark ? 'text-slate-200' : 'text-slate-600'}`}>Local CLI Launch:</strong>
            <pre className={`p-2 rounded border font-mono text-[10px] whitespace-pre-wrap ${
              isDark ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}>
              pip install -r requirements.txt{'\n'}
              streamlit run app.py
            </pre>
          </div>
        </div>

        {/* Right Code Viewer */}
        <div className="md:col-span-3 bg-slate-950 rounded-2xl border border-slate-800 shadow-xl overflow-hidden flex flex-col">
          <div className="bg-slate-900/90 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
              <span className="font-mono text-xs text-slate-300 font-semibold ml-2">
                {selectedFile.path}
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              {selectedFile.description}
            </span>
          </div>

          <pre className="p-5 text-slate-200 font-mono text-xs leading-relaxed overflow-x-auto max-h-[600px] select-text">
            <code>{selectedFile.code}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};
