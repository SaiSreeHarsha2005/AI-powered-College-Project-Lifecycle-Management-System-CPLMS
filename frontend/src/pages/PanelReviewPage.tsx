import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { ProjectProposal, PanelReview, PanelSummary } from '../types';
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  RotateCcw,
  RefreshCw,
  Eye,
  EyeOff,
  Scale,
  Users,
  Award
} from 'lucide-react';

export const PanelReviewPage: React.FC = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<ProjectProposal[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [panelSummary, setPanelSummary] = useState<PanelSummary | null>(null);
  const [blindReviewMode, setBlindReviewMode] = useState<boolean>(true);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Rubric state
  const [problemScore, setProblemScore] = useState<number>(4);
  const [methodologyScore, setMethodologyScore] = useState<number>(4);
  const [feasibilityScore, setFeasibilityScore] = useState<number>(4);
  const [innovationScore, setInnovationScore] = useState<number>(3);
  const [comments, setComments] = useState<string>('');

  const fetchPolicy = async () => {
    try {
      const res = await api.get('/panel-reviews/policy');
      if (res.data && typeof res.data.blindReviewMode === 'boolean') {
        setBlindReviewMode(res.data.blindReviewMode);
      }
    } catch (err) {
      console.error('Failed to fetch blind review policy', err);
    }
  };

  const togglePolicy = async () => {
    try {
      const res = await api.post('/panel-reviews/policy', {
        blindReviewMode: !blindReviewMode,
      });
      if (res.data) {
        setBlindReviewMode(res.data.blindReviewMode);
      }
    } catch (err) {
      console.error('Failed to toggle policy', err);
    }
  };

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await api.get('/projects');
      const list: ProjectProposal[] = res.data;
      setProjects(list);
      if (list.length > 0 && !selectedProjectId) {
        setSelectedProjectId(list[0].id);
        fetchPanelSummary(list[0].id);
      } else if (selectedProjectId) {
        fetchPanelSummary(selectedProjectId);
      }
    } catch (err) {
      console.error('Failed to fetch projects', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPanelSummary = async (projectId: string) => {
    try {
      const res = await api.get(`/panel-reviews/project/${projectId}/summary`);
      setPanelSummary(res.data);
      // Pre-fill if current panelist already reviewed
      const userReview = res.data.reviews?.find(
        (r: PanelReview) => r.panelistEmail === user?.email
      );
      if (userReview) {
        setProblemScore(userReview.rubricProblemScore);
        setMethodologyScore(userReview.rubricMethodologyScore);
        setFeasibilityScore(userReview.rubricFeasibilityScore);
        setInnovationScore(userReview.rubricInnovationScore);
        setComments(userReview.comments || '');
      } else {
        setProblemScore(4);
        setMethodologyScore(4);
        setFeasibilityScore(4);
        setInnovationScore(3);
        setComments('');
      }
    } catch (err) {
      console.error('Failed to fetch panel summary', err);
    }
  };

  useEffect(() => {
    fetchPolicy();
    fetchProjects();
  }, []);

  const handleSelectProject = (projectId: string) => {
    setSelectedProjectId(projectId);
    fetchPanelSummary(projectId);
  };

  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  const totalScore = problemScore + methodologyScore + feasibilityScore + innovationScore;
  const avgScore = (totalScore / 4).toFixed(1);

  const handleSubmit = async (decision: 'APPROVED' | 'REVISION' | 'REJECTED') => {
    if (!selectedProjectId) return;
    setIsSubmitting(true);
    setSuccessMessage(null);
    try {
      await api.post('/panel-reviews', {
        projectId: selectedProjectId,
        panelistEmail: user?.email || 'panel.member@gcet.edu.in',
        panelistName: user?.fullName || 'Dr. S. K. Gupta (Panelist)',
        rubricProblemScore: problemScore,
        rubricMethodologyScore: methodologyScore,
        rubricFeasibilityScore: feasibilityScore,
        rubricInnovationScore: innovationScore,
        comments,
        decision,
      });

      setSuccessMessage(`Panel evaluation submitted successfully with decision: ${decision}`);
      await fetchProjects();
      await fetchPanelSummary(selectedProjectId);
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit panel review');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Policy Toggle Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <Scale className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-slate-900">Independent Panel Review</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Conduct multi-reviewer independent scoring with blind review protection to avoid anchoring bias.
          </p>
        </div>

        {/* Blind Review Policy Toggle */}
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 p-3 rounded-xl">
          <div className="flex items-center gap-2">
            {blindReviewMode ? (
              <EyeOff className="w-4 h-4 text-amber-600" />
            ) : (
              <Eye className="w-4 h-4 text-blue-600" />
            )}
            <div className="text-xs">
              <span className="font-semibold text-slate-800 block">
                {blindReviewMode ? 'Blind Review Active' : 'Open Review Mode'}
              </span>
              <span className="text-slate-500">
                {blindReviewMode ? 'Guide marks hidden' : 'Guide marks visible'}
              </span>
            </div>
          </div>
          <button
            onClick={togglePolicy}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              blindReviewMode
                ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
            }`}
          >
            Switch to {blindReviewMode ? 'Open' : 'Blind'}
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-800 text-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="font-medium">{successMessage}</span>
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center text-slate-400 bg-white rounded-xl border border-slate-200">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-indigo-600 mb-3" />
          <p className="text-sm font-medium">Loading projects for panel evaluation...</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-slate-200">
          <Scale className="w-12 h-12 mx-auto text-slate-300 mb-3" />
          <h3 className="text-base font-semibold text-slate-700">No Projects Found</h3>
          <p className="text-sm text-slate-500 mt-1">Submit proposals first to begin panel review.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Projects Selector Sidebar */}
          <div className="lg:col-span-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">
              Assigned Projects ({projects.length})
            </h3>
            <div className="space-y-2">
              {projects.map((p) => {
                const isSelected = p.id === selectedProjectId;
                return (
                  <button
                    key={p.id}
                    onClick={() => handleSelectProject(p.id)}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-amber-50/50 border-amber-300 ring-2 ring-amber-500/20 shadow-sm'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-slate-100 text-slate-700">
                        {p.domain}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          p.status.includes('APPROVED')
                            ? 'bg-emerald-100 text-emerald-800'
                            : p.status.includes('REJECT')
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {p.status}
                      </span>
                    </div>
                    <h4 className="font-semibold text-sm text-slate-800 mt-2 line-clamp-2">
                      {p.title}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">Team: {p.teamName || 'Team Alpha'}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Project Details & Panel Scoring Form */}
          {selectedProject && (
            <div className="lg:col-span-8 space-y-6">
              {/* Proposal Header */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
                      {selectedProject.projectType} Project Proposal
                    </span>
                    <h2 className="text-xl font-bold text-slate-900 mt-0.5">
                      {selectedProject.title}
                    </h2>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-500 block">Assigned Guide</span>
                    <span className="text-xs font-semibold text-slate-800">
                      {selectedProject.assignedGuideName || 'Prof. Anita Deshmukh'}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div>
                    <h4 className="text-xs font-semibold text-slate-500 uppercase">Problem Statement</h4>
                    <p className="text-slate-700 mt-0.5">{selectedProject.problemStatement}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-500 uppercase">Proposed Solution</h4>
                    <p className="text-slate-700 mt-0.5">{selectedProject.proposedSolution}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md font-mono">
                      Tech: {selectedProject.techStack}
                    </span>
                  </div>
                </div>

                {/* AI Validation Summary Insight */}
                {selectedProject.validationReport && (
                  <div className="mt-4 p-4 rounded-xl border border-indigo-100 bg-indigo-50/40 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-indigo-600" />
                        <span className="text-xs font-bold text-indigo-900 uppercase">
                          AI Screening Report
                        </span>
                      </div>
                      <span className="text-xs font-bold text-indigo-700">
                        Similarity: {selectedProject.validationReport.similarityPercentage}%
                      </span>
                    </div>
                    <p className="text-xs text-slate-700">
                      {selectedProject.validationReport.noveltySummary}
                    </p>
                  </div>
                )}

                {/* Guide's Prior Review (Controlled by Blind Mode) */}
                <div className="mt-4 p-4 rounded-xl border border-slate-200 bg-slate-50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-700 uppercase">
                      Guide's Preliminary Evaluation
                    </span>
                    {blindReviewMode ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded">
                        <EyeOff className="w-3.5 h-3.5" /> Blind Review Shield Enabled
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded">
                        <Eye className="w-3.5 h-3.5" /> Open Review Mode
                      </span>
                    )}
                  </div>
                  {blindReviewMode ? (
                    <p className="text-xs text-slate-500 italic">
                      Guide marks and remarks are hidden to eliminate anchoring bias during independent panel scoring.
                    </p>
                  ) : selectedProject.guideReview ? (
                    <div className="space-y-1 text-xs text-slate-700">
                      <p>
                        <strong>Guide Score:</strong> {selectedProject.guideReview.totalScore} / 20 (
                        {selectedProject.guideReview.percentage}%) •{' '}
                        <span className="font-semibold text-emerald-600">
                          {selectedProject.guideReview.decision}
                        </span>
                      </p>
                      <p>
                        <strong>Comments:</strong> {selectedProject.guideReview.comments}
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500">No guide review submitted yet.</p>
                  )}
                </div>
              </div>

              {/* Panel Rubric Evaluation Form */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-600" />
                    <h3 className="font-bold text-slate-900 text-lg">Panel Evaluation Rubric</h3>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-500 block">Rubric Score</span>
                    <span className="text-lg font-bold text-amber-600">{avgScore} / 5.0</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Problem Score */}
                  <div className="space-y-1.5 p-3 rounded-lg border border-slate-100 bg-slate-50/50">
                    <label className="text-xs font-semibold text-slate-700 block">
                      1. Problem Statement & Need (1-5)
                    </label>
                    <select
                      value={problemScore}
                      onChange={(e) => setProblemScore(Number(e.target.value))}
                      className="w-full text-sm font-medium border border-slate-300 rounded-lg p-2 bg-white focus:ring-2 focus:ring-amber-500"
                    >
                      <option value={1}>1 - Weak / Poorly Defined</option>
                      <option value={2}>2 - Marginal</option>
                      <option value={3}>3 - Acceptable</option>
                      <option value={4}>4 - Well Articulated</option>
                      <option value={5}>5 - Outstanding / Critical</option>
                    </select>
                  </div>

                  {/* Methodology Score */}
                  <div className="space-y-1.5 p-3 rounded-lg border border-slate-100 bg-slate-50/50">
                    <label className="text-xs font-semibold text-slate-700 block">
                      2. Methodology & Architecture (1-5)
                    </label>
                    <select
                      value={methodologyScore}
                      onChange={(e) => setMethodologyScore(Number(e.target.value))}
                      className="w-full text-sm font-medium border border-slate-300 rounded-lg p-2 bg-white focus:ring-2 focus:ring-amber-500"
                    >
                      <option value={1}>1 - Inadequate Technical Stack</option>
                      <option value={2}>2 - Basic</option>
                      <option value={3}>3 - Standard Industry Fit</option>
                      <option value={4}>4 - Sound Architectural Design</option>
                      <option value={5}>5 - State of the Art</option>
                    </select>
                  </div>

                  {/* Feasibility Score */}
                  <div className="space-y-1.5 p-3 rounded-lg border border-slate-100 bg-slate-50/50">
                    <label className="text-xs font-semibold text-slate-700 block">
                      3. Feasibility & Scope (1-5)
                    </label>
                    <select
                      value={feasibilityScore}
                      onChange={(e) => setFeasibilityScore(Number(e.target.value))}
                      className="w-full text-sm font-medium border border-slate-300 rounded-lg p-2 bg-white focus:ring-2 focus:ring-amber-500"
                    >
                      <option value={1}>1 - Unrealistic Timeline</option>
                      <option value={2}>2 - Risky Scope</option>
                      <option value={3}>3 - Manageable for Term</option>
                      <option value={4}>4 - High Achievability</option>
                      <option value={5}>5 - Exemplary Planning</option>
                    </select>
                  </div>

                  {/* Innovation Score */}
                  <div className="space-y-1.5 p-3 rounded-lg border border-slate-100 bg-slate-50/50">
                    <label className="text-xs font-semibold text-slate-700 block">
                      4. Novelty & Innovation (1-5)
                    </label>
                    <select
                      value={innovationScore}
                      onChange={(e) => setInnovationScore(Number(e.target.value))}
                      className="w-full text-sm font-medium border border-slate-300 rounded-lg p-2 bg-white focus:ring-2 focus:ring-amber-500"
                    >
                      <option value={1}>1 - Redundant / Pure Clone</option>
                      <option value={2}>2 - Minor Incremental</option>
                      <option value={3}>3 - Good Engineering Application</option>
                      <option value={4}>4 - Highly Novel Features</option>
                      <option value={5}>5 - Original Research Potential</option>
                    </select>
                  </div>
                </div>

                {/* Comments Field */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 block">
                    Panel Remarks & Technical Directives
                  </label>
                  <textarea
                    rows={3}
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    placeholder="Enter formal panel recommendations, required modifications, or approval notes..."
                    className="w-full p-3 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                {/* Decision Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    disabled={isSubmitting}
                    onClick={() => handleSubmit('REJECTED')}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-lg text-sm font-semibold border border-rose-200 text-rose-700 bg-rose-50 hover:bg-rose-100 transition flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-4 h-4" /> Reject Proposal
                  </button>
                  <button
                    disabled={isSubmitting}
                    onClick={() => handleSubmit('REVISION')}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-lg text-sm font-semibold border border-amber-200 text-amber-800 bg-amber-50 hover:bg-amber-100 transition flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" /> Request Revision
                  </button>
                  <button
                    disabled={isSubmitting}
                    onClick={() => handleSubmit('APPROVED')}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-lg text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm transition flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Approve for Capstone
                  </button>
                </div>
              </div>

              {/* Panel Consensus Summary */}
              {panelSummary && panelSummary.reviews && panelSummary.reviews.length > 0 && (
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-slate-600" />
                      <h4 className="font-bold text-slate-900">Panel Consensus Log</h4>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 rounded-full text-slate-700">
                      {panelSummary.reviewCount} Reviewer(s) Submitted
                    </span>
                  </div>

                  <div className="space-y-3">
                    {panelSummary.reviews.map((rev) => (
                      <div
                        key={rev.id || rev.panelistEmail}
                        className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/70 text-xs space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-800">
                            {rev.panelistName || rev.panelistEmail}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              rev.decision === 'APPROVED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : rev.decision === 'REJECTED'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {rev.decision}
                          </span>
                        </div>
                        <p className="text-slate-600 italic">"{rev.comments}"</p>
                        <div className="flex gap-3 text-slate-500 pt-1 text-[11px]">
                          <span>Problem: {rev.rubricProblemScore}/5</span>
                          <span>Methodology: {rev.rubricMethodologyScore}/5</span>
                          <span>Feasibility: {rev.rubricFeasibilityScore}/5</span>
                          <span>Novelty: {rev.rubricInnovationScore}/5</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
