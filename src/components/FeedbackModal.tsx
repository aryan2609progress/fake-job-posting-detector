import React, { useState } from 'react';
import { CheckCircle2, MessageSquare } from 'lucide-react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobTitle: string;
  theme?: 'dark' | 'light';
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  jobTitle,
  theme = 'dark',
}) => {
  const [perceivedLabel, setPerceivedLabel] = useState<'Genuine' | 'Fake'>('Genuine');
  const [feedbackReason, setFeedbackReason] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;
  const isDark = theme === 'dark';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className={`rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border ${
          isDark
            ? 'bg-slate-900 border-slate-800 text-slate-100'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MessageSquare className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-slate-700'}`} />
            <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>User Feedback Loop</h3>
          </div>
          <button
            onClick={onClose}
            className={`text-sm font-bold p-1 ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-400 hover:text-slate-600'}`}
          >
            ✕
          </button>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-2">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <h4 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Thank You!</h4>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Your feedback has been logged to retrain future EMSCAD model iterations.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <p className={isDark ? 'text-slate-300' : 'text-slate-600'}>
              Help us refine model weights for <strong>{jobTitle || 'this job posting'}</strong>.
            </p>

            <div>
              <label className={`block font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                In your judgment, is this job actually:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPerceivedLabel('Genuine')}
                  className={`p-2.5 rounded-lg border text-xs font-semibold transition-colors ${
                    perceivedLabel === 'Genuine'
                      ? isDark
                        ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                        : 'bg-emerald-50 border-emerald-400 text-emerald-800'
                      : isDark
                      ? 'border-slate-800 bg-slate-950 text-slate-300 hover:bg-slate-800'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  ✅ Actually Genuine
                </button>
                <button
                  type="button"
                  onClick={() => setPerceivedLabel('Fake')}
                  className={`p-2.5 rounded-lg border text-xs font-semibold transition-colors ${
                    perceivedLabel === 'Fake'
                      ? isDark
                        ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                        : 'bg-rose-50 border-rose-400 text-rose-800'
                      : isDark
                      ? 'border-slate-800 bg-slate-950 text-slate-300 hover:bg-slate-800'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  🚨 Actually a Scam / Fake
                </button>
              </div>
            </div>

            <div>
              <label className={`block font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Why was the model incorrect? (Optional)
              </label>
              <textarea
                rows={3}
                value={feedbackReason}
                onChange={(e) => setFeedbackReason(e.target.value)}
                placeholder="e.g. The company is an early-stage startup with no website yet, but I spoke to them on Zoom..."
                className={`w-full p-2.5 rounded-lg text-xs border ${
                  isDark
                    ? 'bg-slate-950 border-slate-700 text-slate-100 placeholder:text-slate-600'
                    : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
                }`}
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className={`px-3 py-1.5 rounded-lg border ${
                  isDark
                    ? 'border-slate-700 text-slate-300 hover:bg-slate-800'
                    : 'border-slate-300 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`px-4 py-1.5 rounded-lg font-medium transition-colors ${
                  isDark
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold'
                    : 'bg-slate-900 hover:bg-slate-800 text-white'
                }`}
              >
                Submit Feedback
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
