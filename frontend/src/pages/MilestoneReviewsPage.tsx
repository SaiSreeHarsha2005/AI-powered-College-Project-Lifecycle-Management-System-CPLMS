import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { ProjectProposal, MilestoneReview } from '../types';
import {
  Calendar,
  CheckCircle2,
  Clock,
  UploadCloud,
  Award,
  RefreshCw,
  Presentation,
  Check
} from 'lucide-react';

export const MilestoneReviewsPage: React.FC = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<ProjectProposal[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [milestones, setMilestones] = useState<MilestoneReview[]>([]);
  const [activeStage, setActiveStage] = useState<string>('REVIEW_1');
  const [loading, setLoading] = useState<boolean>(true);

  // Student submission form state
  const [submissionUrl, setSubmissionUrl] = useState('');
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Faculty evaluation state
  const [innovationScore, setInnovationScore] = useState<number>(4);
  const [designScore, setDesignScore] = useState<number>(4);
  const [implementationScore, setImplementationScore] = useState<number>(4);
  const [documentationScore, setDocumentationScore] = useState<number>(4);
  const [presentationScore, setPresentationScore] = useState<number>(4);
  const [evaluatorFeedback, setEvaluatorFeedback] = useState<string>('');
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);

  const isFaculty = user?.role === 'ROLE_INTERNAL_GUIDE' ||
    user?.role === 'ROLE_SECTION_COORDINATOR' ||
    user?.role === 'ROLE_OVERALL_COORDINATOR' ||
    user?.role === 'ROLE_PANEL' ||
    user?.role === 'ROLE_ADMIN';

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await api.get('/projects');
      const list: ProjectProposal[] = res.data;
      setProjects(list);
      if (list.length > 0 && !selectedProjectId) {
        setSelectedProjectId(list[0].id);
        fetchMilestones(list[0].id);
      } else if (selectedProjectId) {
        fetchMilestones(selectedProjectId);
      }
    } catch (err) {
      console.error('Error fetching projects for milestones', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMilestones = async (projId: string) => {
    try {
      const res = await api.get(`/milestones/project/${projId}`);
      const data: MilestoneReview[] = res.data;
      setMilestones(data);
      // Pre-fill active stage fields
      const current = data.find((m) => m.stageName === activeStage);
      if (current) {
        setSubmissionUrl(current.submissionUrl || '');
        setSubmissionNotes(current.submissionNotes || '');
        setInnovationScore(current.innovationScore || 4);
        setDesignScore(current.designScore || 4);
        setImplementationScore(current.implementationScore || 4);
        setDocumentationScore(current.documentationScore || 4);
        setPresentationScore(current.presentationScore || 4);
        setEvaluatorFeedback(current.evaluatorFeedback || '');
      }
    } catch (err) {
      console.error('Error loading milestones', err);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleSelectStage = (stageName: string) => {
    setActiveStage(stageName);
    const m = milestones.find((item) => item.stageName === stageName);
    if (m) {
      setSubmissionUrl(m.submissionUrl || '');
      setSubmissionNotes(m.submissionNotes || '');
      setInnovationScore(m.innovationScore || 4);
      setDesignScore(m.designScore || 4);
      setImplementationScore(m.implementationScore || 4);
      setDocumentationScore(m.documentationScore || 4);
      setPresentationScore(m.presentationScore || 4);
      setEvaluatorFeedback(m.evaluatorFeedback || '');
    }
  };

  const currentMilestone = milestones.find((m) => m.stageName === activeStage);

  const handleSubmitMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentMilestone) return;
    setIsSubmitting(true);
    setNotification(null);
    try {
      await api.post(`/milestones/${currentMilestone.id}/submit`, {
        submissionUrl,
        submissionNotes,
      });
      setNotification(`Deliverables submitted for ${currentMilestone.stageTitle}!`);
      if (selectedProjectId) fetchMilestones(selectedProjectId);
    } catch (err: any) {
      setNotification('Submission error: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEvaluateMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentMilestone) return;
    setIsEvaluating(true);
    setNotification(null);
    try {
      await api.post(`/milestones/${currentMilestone.id}/evaluate`, {
        innovationScore,
        designScore,
        implementationScore,
        documentationScore,
        presentationScore,
        evaluatorFeedback,
      });
      setNotification(`Evaluation recorded for ${currentMilestone.stageTitle}!`);
      if (selectedProjectId) fetchMilestones(selectedProjectId);
    } catch (err: any) {
      setNotification('Evaluation error: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsEvaluating(false);
    }
  };

  const stagesMeta = [
    { key: 'REVIEW_1', label: 'Review 1', subtitle: 'Concept & Need' },
    { key: 'REVIEW_2', label: 'Review 2', subtitle: 'Architecture & Design' },
    { key: 'REVIEW_3', label: 'Review 3', subtitle: 'Code & Prototype' },
    { key: 'FINAL_VIVA', label: 'Final Viva', subtitle: 'Capstone Defense' },
  ];

  const totalRubricMarks = innovationScore + designScore + implementationScore + documentationScore + presentationScore;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs backdrop-blur-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <Calendar className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
              Module 11 & 12: Continuous Internal Evaluation (CIE)
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Academic Milestone Reviews (Review 1, 2, 3 & Final Viva)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track progressive deadlines, upload milestone slide decks, and record marks across 5 standard criteria.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => selectedProjectId && fetchMilestones(selectedProjectId)}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition shadow-2xs"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-indigo-600' : ''}`} />
          </button>
        </div>
      </div>

      {notification && (
        <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl text-xs font-semibold text-indigo-900 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-indigo-600" />
          <span>{notification}</span>
        </div>
      )}

      {/* Project Selector Bar */}
      {projects.length > 1 && (
        <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between gap-3 text-xs">
          <span className="font-bold text-slate-700">Select Project:</span>
          <select
            value={selectedProjectId || ''}
            onChange={(e) => {
              setSelectedProjectId(e.target.value);
              fetchMilestones(e.target.value);
            }}
            className="flex-1 max-w-md p-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs font-medium"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title} ({p.teamName || 'Team Alpha'})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* 4-Stage Progressive Tab Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stagesMeta.map((s, idx) => {
          const m = milestones.find((item) => item.stageName === s.key);
          const isCurrent = activeStage === s.key;
          const isEvaluated = m?.status === 'EVALUATED';
          const isSubmitted = m?.status === 'SUBMITTED';

          return (
            <button
              key={s.key}
              onClick={() => handleSelectStage(s.key)}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                isCurrent
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
                  : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                  isCurrent ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  Milestone {idx + 1}
                </span>
                {isEvaluated ? (
                  <CheckCircle2 className={`w-4 h-4 ${isCurrent ? 'text-emerald-300' : 'text-emerald-600'}`} />
                ) : isSubmitted ? (
                  <Clock className={`w-4 h-4 ${isCurrent ? 'text-amber-200' : 'text-amber-500'}`} />
                ) : null}
              </div>
              <h4 className={`font-bold text-sm ${isCurrent ? 'text-white' : 'text-slate-900'}`}>
                {s.label}
              </h4>
              <p className={`text-xs mt-0.5 ${isCurrent ? 'text-indigo-100' : 'text-slate-500'}`}>
                {s.subtitle}
              </p>
              {m?.totalScore != null && (
                <div className={`mt-2 pt-2 border-t text-xs font-bold ${
                  isCurrent ? 'border-white/20 text-emerald-200' : 'border-slate-100 text-emerald-600'
                }`}>
                  Score: {m.totalScore} / 25
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Milestone Details & Submissions */}
      {currentMilestone && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Stage Information & Student Submission */}
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-xs font-bold text-indigo-600 uppercase tracking-wide">
                    {currentMilestone.stageName.replace('_', ' ')}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                    {currentMilestone.stageTitle}
                  </h3>
                </div>
                <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${
                  currentMilestone.status === 'EVALUATED'
                    ? 'bg-emerald-100 text-emerald-800'
                    : currentMilestone.status === 'SUBMITTED'
                    ? 'bg-indigo-100 text-indigo-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {currentMilestone.status}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                  <Clock className="w-4 h-4 text-slate-500" />
                  <span>Scheduled Deadline</span>
                </div>
                <p>
                  Due Date: <strong>{currentMilestone.deadline ? new Date(currentMilestone.deadline).toLocaleDateString() : 'Week 4 of Term'}</strong>
                </p>
              </div>

              {/* Student Upload Form */}
              <form onSubmit={handleSubmitMilestone} className="space-y-4 pt-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-1">
                    <Presentation className="w-3.5 h-3.5 text-slate-500" />
                    <span>Milestone Slide Deck / Deliverable Link</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={submissionUrl}
                    onChange={(e) => setSubmissionUrl(e.target.value)}
                    placeholder="https://drive.google.com/... or MinIO URL"
                    className="w-full text-xs font-medium border border-slate-200 rounded-xl p-3 bg-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Work Progress Notes & Summary
                  </label>
                  <textarea
                    rows={3}
                    value={submissionNotes}
                    onChange={(e) => setSubmissionNotes(e.target.value)}
                    placeholder="Briefly describe what has been accomplished for this review milestone..."
                    className="w-full text-xs font-medium border border-slate-200 rounded-xl p-3 bg-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition flex items-center gap-1.5 shadow-md shadow-indigo-600/20 disabled:opacity-50 cursor-pointer"
                  >
                    <UploadCloud className="w-4 h-4" />
                    <span>{isSubmitting ? 'Uploading...' : 'Submit Milestone Deliverables'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right: Faculty Evaluation Card across 5 Criteria (Module 12) */}
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-500" />
                  <h3 className="text-base font-bold text-slate-900">
                    Milestone Marks & Evaluation (Module 12)
                  </h3>
                </div>
                <span className="text-sm font-black text-indigo-600">
                  Total: {totalRubricMarks} / 25
                </span>
              </div>

              <form onSubmit={handleEvaluateMilestone} className="space-y-4">
                <div className="space-y-3 text-xs">
                  {/* Criteria 1: Innovation */}
                  <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 bg-slate-50">
                    <span className="font-semibold text-slate-700">1. Innovation & Novelty</span>
                    <select
                      value={innovationScore}
                      disabled={!isFaculty}
                      onChange={(e) => setInnovationScore(Number(e.target.value))}
                      className="text-xs font-bold p-1.5 rounded-lg border border-slate-300 bg-white"
                    >
                      {[1, 2, 3, 4, 5].map((n) => (
                        <option key={n} value={n}>{n} Marks</option>
                      ))}
                    </select>
                  </div>

                  {/* Criteria 2: Design */}
                  <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 bg-slate-50">
                    <span className="font-semibold text-slate-700">2. Architecture & Design</span>
                    <select
                      value={designScore}
                      disabled={!isFaculty}
                      onChange={(e) => setDesignScore(Number(e.target.value))}
                      className="text-xs font-bold p-1.5 rounded-lg border border-slate-300 bg-white"
                    >
                      {[1, 2, 3, 4, 5].map((n) => (
                        <option key={n} value={n}>{n} Marks</option>
                      ))}
                    </select>
                  </div>

                  {/* Criteria 3: Implementation */}
                  <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 bg-slate-50">
                    <span className="font-semibold text-slate-700">3. Implementation & Code Quality</span>
                    <select
                      value={implementationScore}
                      disabled={!isFaculty}
                      onChange={(e) => setImplementationScore(Number(e.target.value))}
                      className="text-xs font-bold p-1.5 rounded-lg border border-slate-300 bg-white"
                    >
                      {[1, 2, 3, 4, 5].map((n) => (
                        <option key={n} value={n}>{n} Marks</option>
                      ))}
                    </select>
                  </div>

                  {/* Criteria 4: Documentation */}
                  <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 bg-slate-50">
                    <span className="font-semibold text-slate-700">4. Report Documentation & SRS</span>
                    <select
                      value={documentationScore}
                      disabled={!isFaculty}
                      onChange={(e) => setDocumentationScore(Number(e.target.value))}
                      className="text-xs font-bold p-1.5 rounded-lg border border-slate-300 bg-white"
                    >
                      {[1, 2, 3, 4, 5].map((n) => (
                        <option key={n} value={n}>{n} Marks</option>
                      ))}
                    </select>
                  </div>

                  {/* Criteria 5: Presentation */}
                  <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 bg-slate-50">
                    <span className="font-semibold text-slate-700">5. Team Presentation & Viva Defense</span>
                    <select
                      value={presentationScore}
                      disabled={!isFaculty}
                      onChange={(e) => setPresentationScore(Number(e.target.value))}
                      className="text-xs font-bold p-1.5 rounded-lg border border-slate-300 bg-white"
                    >
                      {[1, 2, 3, 4, 5].map((n) => (
                        <option key={n} value={n}>{n} Marks</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Evaluator Feedback & Required Revisions
                  </label>
                  <textarea
                    rows={3}
                    disabled={!isFaculty}
                    value={evaluatorFeedback}
                    onChange={(e) => setEvaluatorFeedback(e.target.value)}
                    placeholder="Provide qualitative feedback for students on this milestone..."
                    className="w-full text-xs font-medium border border-slate-200 rounded-xl p-3 bg-white focus:ring-2 focus:ring-amber-500 disabled:bg-slate-50"
                  />
                </div>

                {isFaculty && (
                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      disabled={isEvaluating}
                      className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition flex items-center gap-1.5 shadow-md shadow-emerald-600/20 disabled:opacity-50 cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>{isEvaluating ? 'Recording...' : 'Record Milestone Evaluation'}</span>
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
