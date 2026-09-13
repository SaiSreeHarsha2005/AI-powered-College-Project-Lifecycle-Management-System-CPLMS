import React, { useEffect, useState } from 'react';
import { aiApi } from '../services/api';
import { 
  Bot, 
  X, 
  Send, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Lightbulb, 
  ArrowRight, 
  RotateCcw, 
  Award, 
  HelpCircle,
  TrendingUp
} from 'lucide-react';

interface VivaQuestion {
  id: number;
  question: string;
  topic_area: string;
  examiner_intent: string;
  hint: string;
}

interface VivaEvaluation {
  score_out_of_10: number;
  verdict: string;
  strengths: string[];
  missing_points: string[];
  examiner_coaching_tip: string;
  sample_impressive_answer: string;
}

interface AiMockVivaModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: {
    id?: string;
    title: string;
    problemStatement: string;
    proposedSolution?: string;
    techStack: string;
    domain?: string;
    projectType?: string;
  };
}

export const AiMockVivaModal: React.FC<AiMockVivaModalProps> = ({
  isOpen,
  onClose,
  project
}) => {
  const [questions, setQuestions] = useState<VivaQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [studentAnswer, setStudentAnswer] = useState('');
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [currentEvaluation, setCurrentEvaluation] = useState<VivaEvaluation | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [showSample, setShowSample] = useState(false);
  const [history, setHistory] = useState<{ question: VivaQuestion; answer: string; evaluation: VivaEvaluation }[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);

  const fetchQuestions = async () => {
    try {
      setLoadingQuestions(true);
      setIsCompleted(false);
      setHistory([]);
      setCurrentIdx(0);
      setCurrentEvaluation(null);
      setStudentAnswer('');

      const res = await aiApi.post('/viva/generate-questions', {
        project_title: project.title,
        problem_statement: project.problemStatement,
        proposed_solution: project.proposedSolution,
        tech_stack: project.techStack,
        domain: project.domain || 'Computer Science & Engineering'
      });

      setQuestions(res.data.questions || []);
    } catch (err) {
      console.error('Failed to generate viva questions', err);
    } finally {
      setLoadingQuestions(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchQuestions();
    }
  }, [isOpen, project.title]);

  if (!isOpen) return null;

  const currentQ = questions[currentIdx];

  const handleEvaluate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentAnswer.trim() || !currentQ) return;

    setEvaluating(true);
    try {
      const res = await aiApi.post('/viva/evaluate-answer', {
        question: currentQ.question,
        topic_area: currentQ.topic_area,
        student_answer: studentAnswer,
        project_title: project.title,
        tech_stack: project.techStack
      });

      const evaluation: VivaEvaluation = res.data;
      setCurrentEvaluation(evaluation);
      setHistory((prev) => [...prev, { question: currentQ, answer: studentAnswer, evaluation }]);
    } catch (err) {
      console.error('Error evaluating answer', err);
    } finally {
      setEvaluating(false);
    }
  };

  const handleNext = () => {
    if (currentIdx + 1 < questions.length) {
      setCurrentIdx((prev) => prev + 1);
      setCurrentEvaluation(null);
      setStudentAnswer('');
      setShowHint(false);
      setShowSample(false);
    } else {
      setIsCompleted(true);
    }
  };

  const overallScore = history.length > 0
    ? (history.reduce((acc, h) => acc + h.evaluation.score_out_of_10, 0) / history.length).toFixed(1)
    : '0';

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-3xl w-full p-6 md:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-6 max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">AI Mock Viva Defense Simulator</h2>
                <span className="rounded-full bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 px-2.5 py-0.5 text-[10px] font-bold text-purple-700 dark:text-purple-300">
                  External Examiner AI
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                Cross-examination defense for: "{project.title}"
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-all cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        {loadingQuestions ? (
          <div className="py-20 text-center text-xs text-slate-500 dark:text-slate-400 space-y-3">
            <div className="h-8 w-8 border-3 border-purple-600 border-t-transparent animate-spin rounded-full mx-auto" />
            <p className="font-semibold text-slate-700 dark:text-slate-300">Formulating cross-examination viva defense questions...</p>
            <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
              Analyzing problem statement, architecture boundaries, and tech stack trade-offs.
            </p>
          </div>
        ) : isCompleted ? (
          /* Completion Screen */
          <div className="flex-1 overflow-y-auto space-y-6 py-6 text-center">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
              <Award className="w-8 h-8" />
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Viva Simulation Completed
              </span>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                Preparedness Score: {overallScore} / 10
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                {Number(overallScore) >= 8.5
                  ? 'Outstanding defense! Your technical justifications are rigorous and ready for the external examination committee.'
                  : Number(overallScore) >= 7.0
                  ? 'Solid defense. Review the coaching tips below to address minor algorithmic and scaling questions during viva.'
                  : 'Good foundation. Practice articulating specific performance metrics and architectural trade-offs.'}
              </p>
            </div>

            {/* Performance breakdown list */}
            <div className="text-left space-y-3 max-w-xl mx-auto">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Question Performance Breakdown:
              </h4>
              {history.map((h, i) => (
                <div key={i} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 dark:text-slate-200">Q{i + 1}: {h.question.topic_area}</span>
                    <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                      h.evaluation.score_out_of_10 >= 8.5
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}>
                      {h.evaluation.score_out_of_10} / 10
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-1">{h.question.question}</p>
                </div>
              ))}
            </div>

            <div className="flex justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={fetchQuestions}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Retake Defense
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition shadow-md shadow-indigo-600/20 cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* Active Question Step */
          <div className="flex-1 overflow-y-auto space-y-5 pr-1">
            
            {/* Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
                <span>Question {currentIdx + 1} of {questions.length}</span>
                <span className="text-purple-600 dark:text-purple-400 font-bold">{currentQ?.topic_area}</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 transition-all duration-300"
                  style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Question Card */}
            <div className="p-4 rounded-2xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/80 space-y-2">
              <div className="flex items-center gap-1.5 text-purple-900 dark:text-purple-300 font-bold text-xs">
                <Bot className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                <span>External Examiner Asks:</span>
              </div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-relaxed">
                "{currentQ?.question}"
              </p>
              
              <div className="pt-2 flex items-center justify-between text-[11px] border-t border-purple-200/50 dark:border-purple-900/50">
                <span className="text-purple-700 dark:text-purple-400 italic">
                  Examiner intent: {currentQ?.examiner_intent}
                </span>
                <button
                  type="button"
                  onClick={() => setShowHint(!showHint)}
                  className="text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-1 hover:underline cursor-pointer"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>{showHint ? 'Hide Hint' : 'Need a Hint?'}</span>
                </button>
              </div>

              {showHint && (
                <div className="mt-2 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-800 dark:text-amber-300 flex items-start gap-2 animate-fade-in">
                  <Lightbulb className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-600" />
                  <span>{currentQ?.hint}</span>
                </div>
              )}
            </div>

            {/* Answer Form & Real-time Evaluation */}
            {!currentEvaluation ? (
              <form onSubmit={handleEvaluate} className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Your Technical Defense:
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={studentAnswer}
                    onChange={(e) => setStudentAnswer(e.target.value)}
                    placeholder="Provide your technical reasoning, architectural trade-offs, and metrics (e.g., 'We selected this because... which reduced latency to...')."
                    className="w-full text-xs font-medium border border-slate-200 dark:border-slate-700 rounded-xl p-3 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 shadow-2xs"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={evaluating || !studentAnswer.trim()}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 transition flex items-center gap-2 shadow-md shadow-purple-600/20 disabled:opacity-50 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{evaluating ? 'Examiner Evaluating Defense...' : 'Submit Defense to Examiner'}</span>
                  </button>
                </div>
              </form>
            ) : (
              /* Evaluation Feedback Box */
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Examiner Grade:</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-black ${
                        currentEvaluation.score_out_of_10 >= 8.5
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : currentEvaluation.score_out_of_10 >= 7.0
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      }`}>
                        {currentEvaluation.score_out_of_10} / 10 • {currentEvaluation.verdict}
                      </span>
                    </div>
                  </div>

                  {/* Strengths & Missing Points */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 space-y-1">
                      <span className="font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Key Strengths:
                      </span>
                      <ul className="space-y-1 text-[11px] text-emerald-800 dark:text-emerald-400 pl-4 list-disc">
                        {currentEvaluation.strengths.map((s, i) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 space-y-1">
                      <span className="font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                        Missing Considerations:
                      </span>
                      <ul className="space-y-1 text-[11px] text-amber-800 dark:text-amber-400 pl-4 list-disc">
                        {currentEvaluation.missing_points.map((m, i) => (
                          <li key={i}>{m}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Coaching Tip */}
                  <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-900 dark:text-indigo-300 flex items-start gap-2">
                    <TrendingUp className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block text-[11px] uppercase tracking-wider">Committee Coaching Tip:</span>
                      <p className="text-[11px] text-indigo-800 dark:text-indigo-300 mt-0.5 leading-relaxed">
                        {currentEvaluation.examiner_coaching_tip}
                      </p>
                    </div>
                  </div>

                  {/* Sample Answer Toggle */}
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => setShowSample(!showSample)}
                      className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{showSample ? 'Hide Model Defense' : 'View Sample 10/10 Model Defense'}</span>
                    </button>
                    {showSample && (
                      <p className="mt-2 p-3 rounded-xl bg-white dark:bg-slate-800 border border-purple-200 dark:border-purple-800 text-[11px] text-slate-700 dark:text-slate-300 font-medium leading-relaxed animate-fade-in shadow-2xs">
                        "{currentEvaluation.sample_impressive_answer}"
                      </p>
                    )}
                  </div>
                </div>

                {/* Next Button */}
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 transition flex items-center gap-1.5 shadow-md shadow-indigo-600/20 cursor-pointer"
                  >
                    <span>{currentIdx + 1 < questions.length ? 'Next Viva Question' : 'Complete Viva & View Report'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
