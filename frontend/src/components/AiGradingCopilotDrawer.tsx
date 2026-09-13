import React, { useState } from 'react';
import { aiApi } from '../services/api';
import { 
  Sparkles, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  Sliders, 
  Check, 
  ShieldCheck, 
  RefreshCw,
  BrainCircuit,
  MessageSquare
} from 'lucide-react';

export interface CopilotRubricResult {
  problem_score: number;
  methodology_score: number;
  feasibility_score: number;
  innovation_score: number;
  total_score: number;
  percentage: number;
  recommended_decision: 'APPROVED' | 'REVISED' | 'REJECTED' | string;
  confidence_score: number;
  criteria_breakdown: Array<{
    criterion: string;
    suggested_score: number;
    max_score: number;
    rationale: string;
  }>;
  drafted_feedback: string;
  key_strengths: string[];
  potential_risks: string[];
}

interface AiGradingCopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  project: {
    title: string;
    problemStatement: string;
    proposedSolution?: string;
    techStack?: string;
    domain?: string;
    noveltyScore?: number;
    duplicateRisk?: string;
    hasGithubRepo?: boolean;
    hasDemoVideo?: boolean;
    hasFinalReport?: boolean;
    hasPresentation?: boolean;
  };
  onApplyScores: (scores: {
    problemScore: number;
    methodologyScore: number;
    feasibilityScore: number;
    innovationScore: number;
    comments: string;
    recommendation?: 'APPROVED' | 'REVISED' | 'REJECTED';
  }) => void;
}

export const AiGradingCopilotDrawer: React.FC<AiGradingCopilotDrawerProps> = ({
  isOpen,
  onClose,
  project,
  onApplyScores
}) => {
  const [loading, setLoading] = useState(false);
  const [copilotData, setCopilotData] = useState<CopilotRubricResult | null>(null);
  const [applied, setApplied] = useState(false);

  // Auto-fetch analysis when opened
  React.useEffect(() => {
    if (isOpen && !copilotData && !loading) {
      runAnalysis();
    }
  }, [isOpen]);

  const runAnalysis = async () => {
    setLoading(true);
    setApplied(false);
    try {
      const res = await aiApi.post('/faculty/copilot-rubric', {
        title: project.title,
        problem_statement: project.problemStatement,
        proposed_solution: project.proposedSolution || '',
        tech_stack: project.techStack || '',
        domain: project.domain || '',
        novelty_score: project.noveltyScore ?? 85.0,
        duplicate_risk: project.duplicateRisk || 'LOW',
        has_github_repo: Boolean(project.hasGithubRepo),
        has_demo_video: Boolean(project.hasDemoVideo),
        has_final_report: Boolean(project.hasFinalReport),
        has_presentation: Boolean(project.hasPresentation)
      });
      setCopilotData(res.data);
    } catch (err) {
      console.error('Failed to run AI grading copilot', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (!copilotData) return;
    onApplyScores({
      problemScore: copilotData.problem_score,
      methodologyScore: copilotData.methodology_score,
      feasibilityScore: copilotData.feasibility_score,
      innovationScore: copilotData.innovation_score,
      comments: copilotData.drafted_feedback,
      recommendation: (copilotData.recommended_decision as any) || 'APPROVED'
    });
    setApplied(true);
    setTimeout(() => {
      onClose();
      setApplied(false);
    }, 900);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-scale-up">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center shadow-inner">
              <BrainCircuit className="h-5 w-5 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base tracking-tight text-white">
                  Faculty AI Grading Copilot
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-white/20 text-white border border-white/30 uppercase tracking-wider">
                  Advisory Mode
                </span>
              </div>
              <p className="text-xs text-white/80 line-clamp-1">
                Autonomous Rubric Assister • {project.title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-white/70 hover:text-white hover:bg-white/15 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-slate-800 dark:text-slate-100">
          {loading ? (
            <div className="py-20 text-center space-y-3">
              <RefreshCw className="h-8 w-8 animate-spin text-emerald-600 dark:text-emerald-400 mx-auto" />
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                AI Copilot is reviewing project parameters...
              </p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Synthesizing problem statement, technology stack benchmarks, vector novelty screening, and submitted artifacts.
              </p>
            </div>
          ) : copilotData ? (
            <>
              {/* Executive Recommendation Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/30 border border-emerald-200 dark:border-emerald-800/60 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-center sm:text-left">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                    Recommended Overall Decision
                  </span>
                  <div className="flex items-center gap-2.5">
                    <span className={`px-3 py-1 rounded-full text-xs font-black tracking-wide border ${
                      copilotData.recommended_decision === 'APPROVED'
                        ? 'bg-emerald-600 text-white border-emerald-700'
                        : copilotData.recommended_decision === 'REVISED'
                        ? 'bg-amber-500 text-white border-amber-600'
                        : 'bg-rose-600 text-white border-rose-700'
                    }`}>
                      {copilotData.recommended_decision}
                    </span>
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                      Total: <strong className="text-emerald-700 dark:text-emerald-400">{copilotData.total_score} / 20</strong> ({copilotData.percentage}%)
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-white dark:bg-slate-800 px-3.5 py-2 rounded-xl border border-emerald-100 dark:border-slate-700 shadow-2xs">
                  <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Confidence Index</span>
                    <span className="text-xs font-black text-slate-800 dark:text-slate-100">
                      {copilotData.confidence_score}% High
                    </span>
                  </div>
                </div>
              </div>

              {/* 4 Rubric Criteria Breakdown */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                    <Sliders className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                    Criterion Recommendations & Rationales
                  </h4>
                  <span className="text-[11px] text-slate-500">Autonomous ABET/IEEE Alignment</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {copilotData.criteria_breakdown.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 space-y-2 hover:border-emerald-300 dark:hover:border-emerald-600 transition"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1">
                          {item.criterion}
                        </span>
                        <span className="px-2 py-0.5 rounded-lg text-xs font-black bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          {item.suggested_score} / 5
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                        {item.rationale}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Drafted Qualitative Feedback */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                    <MessageSquare className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                    Drafted Faculty Directives & Qualitative Comments
                  </label>
                  <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded-md">
                    Ready to Insert
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/80 dark:border-indigo-800/50 text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-sans shadow-inner">
                  "{copilotData.drafted_feedback}"
                </div>
              </div>

              {/* Strengths & Risks */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="p-3 rounded-2xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 space-y-1.5">
                  <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Key Strengths
                  </span>
                  <ul className="text-[11px] text-slate-600 dark:text-slate-400 space-y-1 list-disc list-inside">
                    {copilotData.key_strengths.map((str, i) => (
                      <li key={i}>{str}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 rounded-2xl bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40 space-y-1.5">
                  <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-600" /> Panel Risk Advisory
                  </span>
                  <ul className="text-[11px] text-slate-600 dark:text-slate-400 space-y-1 list-disc list-inside">
                    {copilotData.potential_risks.map((rsk, i) => (
                      <li key={i}>{rsk}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </>
          ) : (
            <div className="py-12 text-center text-xs text-slate-500">
              No analysis available. Click "Re-Analyze" to trigger copilot.
            </div>
          )}
        </div>

        {/* Action Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={runAnalysis}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Re-Analyze</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={loading || !copilotData || applied}
              onClick={handleApply}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-white shadow-lg transition-all cursor-pointer ${
                applied
                  ? 'bg-emerald-600 shadow-emerald-600/30'
                  : 'bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:opacity-95 shadow-teal-600/25'
              } disabled:opacity-50`}
            >
              {applied ? (
                <>
                  <Check className="h-4 w-4" />
                  <span>Applied to Rubric!</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 text-emerald-200" />
                  <span>Apply AI Suggestions to Rubric</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
