import React, { useEffect, useState } from 'react';
import api from '../services/api';
import type { ProjectProposal } from '../types';
import { VersionDiffModal } from '../components/VersionDiffModal';
import { ProjectCertificateModal } from '../components/ProjectCertificateModal';
import { AiGradingCopilotDrawer } from '../components/AiGradingCopilotDrawer';
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sliders,
  RefreshCw,
  FolderKanban,
  Check,
  FolderGit2,
  Award,
  AlertTriangle,
  History
} from 'lucide-react';

export const GuideReviewPage: React.FC = () => {
  const [projects, setProjects] = useState<ProjectProposal[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isDiffModalOpen, setIsDiffModalOpen] = useState(false);
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Rubric state
  const [problemScore, setProblemScore] = useState<number>(3);
  const [methodologyScore, setMethodologyScore] = useState<number>(3);
  const [feasibilityScore, setFeasibilityScore] = useState<number>(3);
  const [innovationScore, setInnovationScore] = useState<number>(3);
  const [comments, setComments] = useState<string>('');

  const fetchAssignedProjects = async () => {
    setLoading(true);
    try {
      const res = await api.get('/projects');
      const list: ProjectProposal[] = res.data;
      setProjects(list);
      if (list.length > 0 && !selectedProjectId) {
        setSelectedProjectId(list[0].id);
        populateReviewFields(list[0]);
      } else if (selectedProjectId) {
        const found = list.find((p) => p.id === selectedProjectId);
        if (found) populateReviewFields(found);
      }
    } catch (err) {
      console.error('Failed to load assigned projects from database', err);
    } finally {
      setLoading(false);
    }
  };

  const populateReviewFields = (p: ProjectProposal) => {
    if (p.guideReview) {
      setProblemScore(p.guideReview.problemScore);
      setMethodologyScore(p.guideReview.methodologyScore);
      setFeasibilityScore(p.guideReview.feasibilityScore);
      setInnovationScore(p.guideReview.innovationScore);
      setComments(p.guideReview.comments || '');
    } else {
      setProblemScore(3);
      setMethodologyScore(3);
      setFeasibilityScore(3);
      setInnovationScore(3);
      setComments('');
    }
  };

  useEffect(() => {
    fetchAssignedProjects();
  }, []);

  const handleSelectProject = (id: string) => {
    setSelectedProjectId(id);
    const match = projects.find((p) => p.id === id);
    if (match) {
      populateReviewFields(match);
    }
  };

  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  const handleSubmitReview = async (decision: 'APPROVED' | 'REVISED' | 'REJECTED') => {
    if (!selectedProjectId) return;
    setIsSubmitting(true);
    setSuccessMessage(null);

    try {
      await api.post(`/reviews/${selectedProjectId}`, {
        problemScore,
        methodologyScore,
        feasibilityScore,
        innovationScore,
        comments,
        decision,
      });

      setSuccessMessage(`Decision recorded: ${decision}. Notification dispatched to team!`);
      await fetchAssignedProjects();
    } catch (err: any) {
      console.error('Failed to submit review', err);
      alert(err.response?.data?.message || 'Error recording evaluation');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarkComplete = async () => {
    if (!selectedProjectId) return;
    setIsCompleting(true);
    setSuccessMessage(null);
    try {
      await api.post(`/projects/${selectedProjectId}/complete`);
      setSuccessMessage('🎓 Project officially signed off as COMPLETED and auto-archived into historical repository!');
      await fetchAssignedProjects();
    } catch (err: any) {
      console.error('Failed to mark complete', err);
      alert(err.response?.data?.message || 'Error marking project complete');
    } finally {
      setIsCompleting(false);
    }
  };

  const handleApplyCopilot = (scores: {
    problemScore: number;
    methodologyScore: number;
    feasibilityScore: number;
    innovationScore: number;
    comments: string;
  }) => {
    setProblemScore(scores.problemScore);
    setMethodologyScore(scores.methodologyScore);
    setFeasibilityScore(scores.feasibilityScore);
    setInnovationScore(scores.innovationScore);
    setComments(scores.comments);
    setSuccessMessage('✨ AI Grading Copilot recommendations applied to rubric! You may adjust or tweak before final submission.');
  };

  const totalScore = problemScore + methodologyScore + feasibilityScore + innovationScore;
  const percentage = Math.round((totalScore / 20) * 100);

  if (loading) {
    return (
      <div className="py-20 text-center">
        <RefreshCw className="h-6 w-6 animate-spin text-emerald-600 mx-auto mb-2" />
        <p className="text-xs text-slate-500 font-semibold">Loading assigned proposals from database...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Internal Guide Workspace
            </span>
            <span className="text-xs text-slate-500">Live Rubric Marks & Approvals</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Guide Review & Rubric Evaluation
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Evaluate student team submissions retrieved from the database with attached AI vector screening reports.
          </p>
        </div>

        {/* Project Selector Dropdown if multiple projects in DB */}
        {projects.length > 1 && (
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-600 whitespace-nowrap">Select Proposal:</label>
            <select
              value={selectedProjectId || ''}
              onChange={(e) => handleSelectProject(e.target.value)}
              className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-800 shadow-2xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} ({p.teamName || p.teamLeadEmail})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-emerald-700 hover:text-emerald-900">Dismiss</button>
        </div>
      )}

      {!selectedProject ? (
        <div className="rounded-3xl border border-slate-200 bg-white/80 p-12 text-center shadow-xs">
          <FolderKanban className="h-10 w-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-700">No Proposals Pending Review</h3>
          <p className="text-xs text-slate-500 mt-1">When students submit proposals, they will appear here dynamically.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* SLA Escalation Warning Banner (Standout Feature #2) */}
          {selectedProject.slaBreached && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs flex items-center justify-between shadow-2xs animate-fade-in">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold text-rose-900">
                    SLA Review Window Breached ({selectedProject.slaDaysPending || 0} days pending)
                  </p>
                  <p className="text-[11px] text-rose-700 mt-0.5">
                    Tier {selectedProject.escalationTier || 1} coordinator escalation flag active. Please complete rubric evaluation promptly.
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-rose-200/70 text-rose-800 font-bold text-[10px] uppercase tracking-wider border border-rose-300">
                Tier {selectedProject.escalationTier || 1} Escalated
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left column: Student Submission & AI Summary (6 cols) */}
            <div className="lg:col-span-6 space-y-4">
              <div className="rounded-3xl border border-slate-200/90 bg-white/85 p-6 shadow-xs backdrop-blur-xl space-y-4">
                <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">
                      Team: {selectedProject.teamName || 'Active Team'} • {selectedProject.section}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-1">
                      {selectedProject.title}
                    </h3>
                    <span className="text-xs text-slate-500">{selectedProject.teamLeadEmail}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {(selectedProject.currentVersion || 1) > 1 && (
                      <button
                        type="button"
                        onClick={() => setIsDiffModalOpen(true)}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition cursor-pointer shadow-2xs"
                        title="View what student changed since last version"
                      >
                        <History className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Diff (v{selectedProject.currentVersion})</span>
                      </button>
                    )}
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                      selectedProject.status === 'APPROVED'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : selectedProject.status === 'UNDER_REVIEW'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}>
                      {selectedProject.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Domain & Tech Stack
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-xs font-semibold text-slate-700">
                    {selectedProject.domain}
                  </span>
                  {selectedProject.techStack && (
                    <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-xs font-semibold text-indigo-700">
                      {selectedProject.techStack}
                    </span>
                  )}
                </div>
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Problem Statement
                </span>
                <p className="text-xs text-slate-700 bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200 leading-relaxed">
                  {selectedProject.problemStatement}
                </p>
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Proposed Solution
                </span>
                <p className="text-xs text-slate-700 bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200 leading-relaxed">
                  {selectedProject.proposedSolution}
                </p>
              </div>

              {/* Attached AI Report from DB */}
              {selectedProject.validationReport ? (
                <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-indigo-900 font-bold text-xs">
                      <Sparkles className="h-4 w-4 text-indigo-600" />
                      <span>Live AI Validation Summary</span>
                    </div>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                      selectedProject.validationReport.similarityPercentage >= 70
                        ? 'bg-rose-100 text-rose-700 border-rose-200'
                        : 'bg-emerald-100 text-emerald-700 border-emerald-200'
                    }`}>
                      {selectedProject.validationReport.similarityPercentage}% Similarity
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    {selectedProject.validationReport.noveltySummary}
                  </p>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-500">
                  No AI validation report attached to this proposal yet.
                </div>
              )}

              {/* Final Deliverables Box (Phase 4 / Module 14) */}
              {(selectedProject.githubRepoUrl || selectedProject.status === 'DELIVERABLES_SUBMITTED' || selectedProject.status === 'COMPLETED') && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <FolderGit2 className="w-4 h-4 text-indigo-600" />
                      Final Deliverables
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      selectedProject.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' : 'bg-indigo-100 text-indigo-800'
                    }`}>
                      {selectedProject.status}
                    </span>
                  </div>
                  {selectedProject.githubRepoUrl && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">GitHub Repo:</span>
                      <a href={selectedProject.githubRepoUrl} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline font-mono truncate max-w-xs">
                        {selectedProject.githubRepoUrl}
                      </a>
                    </div>
                  )}
                  {selectedProject.demoVideoUrl && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Demo Video:</span>
                      <a href={selectedProject.demoVideoUrl} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline font-mono truncate max-w-xs">
                        {selectedProject.demoVideoUrl}
                      </a>
                    </div>
                  )}
                  {selectedProject.finalReportUrl && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Final Report:</span>
                      <span className="font-medium text-slate-800">{selectedProject.finalReportUrl}</span>
                    </div>
                  )}
                  {selectedProject.completedAt && (
                    <p className="text-[11px] text-emerald-700 font-semibold pt-1">
                      ✓ Completed & Archived: {new Date(selectedProject.completedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right column: Constrained 1-5 Dropdown Rubric & Decision (6 cols) */}
          <div className="lg:col-span-6 space-y-4">
            <div className="rounded-3xl border border-slate-200/90 bg-white/90 p-6 shadow-xs backdrop-blur-xl space-y-5">
              <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Sliders className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Evaluation Rubric (1–5 Scale)</h3>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsCopilotOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-purple-200 dark:border-purple-800 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/60 dark:to-indigo-950/60 hover:from-purple-100 hover:to-indigo-100 text-purple-700 dark:text-purple-300 text-xs font-bold transition cursor-pointer shadow-2xs"
                    title="Launch AI Grading Copilot to autonomously suggest marks and feedback"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                    <span>AI Copilot</span>
                  </button>
                  <div className="text-right">
                    <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">{totalScore} / 20</span>
                    <span className="text-xs text-slate-500 ml-1">({percentage}%)</span>
                  </div>
                </div>
              </div>

              {/* Rubric Criteria with Dropdowns */}
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/80 border border-slate-200">
                  <div>
                    <span className="font-bold text-slate-800 block">1. Problem Formulation & Clarity</span>
                    <span className="text-[11px] text-slate-500">Clear objectives and academic significance</span>
                  </div>
                  <select
                    value={problemScore}
                    onChange={(e) => setProblemScore(Number(e.target.value))}
                    className="px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-slate-800 font-bold shadow-2xs"
                  >
                    <option value={1}>1 - Poor</option>
                    <option value={2}>2 - Fair</option>
                    <option value={3}>3 - Good</option>
                    <option value={4}>4 - Very Good</option>
                    <option value={5}>5 - Excellent</option>
                  </select>
                </div>

                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/80 border border-slate-200">
                  <div>
                    <span className="font-bold text-slate-800 block">2. Methodology & Architecture</span>
                    <span className="text-[11px] text-slate-500">Appropriateness of algorithms & data flow</span>
                  </div>
                  <select
                    value={methodologyScore}
                    onChange={(e) => setMethodologyScore(Number(e.target.value))}
                    className="px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-slate-800 font-bold shadow-2xs"
                  >
                    <option value={1}>1 - Poor</option>
                    <option value={2}>2 - Fair</option>
                    <option value={3}>3 - Good</option>
                    <option value={4}>4 - Very Good</option>
                    <option value={5}>5 - Excellent</option>
                  </select>
                </div>

                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/80 border border-slate-200">
                  <div>
                    <span className="font-bold text-slate-800 block">3. Feasibility & Scope Alignment</span>
                    <span className="text-[11px] text-slate-500">Realistic timelines and resource requirements</span>
                  </div>
                  <select
                    value={feasibilityScore}
                    onChange={(e) => setFeasibilityScore(Number(e.target.value))}
                    className="px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-slate-800 font-bold shadow-2xs"
                  >
                    <option value={1}>1 - Poor</option>
                    <option value={2}>2 - Fair</option>
                    <option value={3}>3 - Good</option>
                    <option value={4}>4 - Very Good</option>
                    <option value={5}>5 - Excellent</option>
                  </select>
                </div>

                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/80 border border-slate-200">
                  <div>
                    <span className="font-bold text-slate-800 block">4. Novelty & Innovation Degree</span>
                    <span className="text-[11px] text-slate-500">Originality compared to historical archive</span>
                  </div>
                  <select
                    value={innovationScore}
                    onChange={(e) => setInnovationScore(Number(e.target.value))}
                    className="px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-slate-800 font-bold shadow-2xs"
                  >
                    <option value={1}>1 - Low Novelty</option>
                    <option value={2}>2 - Incremental</option>
                    <option value={3}>3 - Moderate</option>
                    <option value={4}>4 - High Novelty</option>
                    <option value={5}>5 - Highly Original</option>
                  </select>
                </div>
              </div>

              {/* Guide Comments */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Guide Qualitative Feedback & Directives
                </label>
                <textarea
                  rows={3}
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Enter directives for the student team..."
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition-all shadow-2xs"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
                  Official Recommendation
                </span>
                <div className="grid grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => handleSubmitReview('APPROVED')}
                    className="py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Approve Idea</span>
                  </button>

                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => handleSubmitReview('REVISED')}
                    className="py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white shadow-md shadow-amber-600/20 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <RotateCcw className="h-4 w-4" />
                    <span>Request Revision</span>
                  </button>

                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => handleSubmitReview('REJECTED')}
                    className="py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/20 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <XCircle className="h-4 w-4" />
                    <span>Reject</span>
                  </button>
                </div>

                {selectedProject.status !== 'COMPLETED' ? (
                  <button
                    type="button"
                    disabled={isCompleting}
                    onClick={handleMarkComplete}
                    className="w-full mt-3 py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700 shadow-md shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Award className="h-4 w-4" />
                    <span>{isCompleting ? 'Signing off & Archiving...' : 'Sign-Off & Mark Project COMPLETED (Auto-Archive)'}</span>
                  </button>
                ) : (
                  <div className="mt-3 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center">
                    <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                      🎓 Project Completed & Archival Record Sealed
                    </span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setIsCertModalOpen(true)}
                  className="w-full mt-2.5 py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border border-amber-300 dark:border-amber-800 bg-amber-50/80 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/60 shadow-xs transition-all cursor-pointer"
                >
                  <Award className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  <span>Preview Official Capstone Certificate</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      )}

      {selectedProject && (
        <VersionDiffModal
          isOpen={isDiffModalOpen}
          onClose={() => setIsDiffModalOpen(false)}
          projectId={selectedProject.id}
          currentProposal={{
            title: selectedProject.title,
            problemStatement: selectedProject.problemStatement,
            proposedSolution: selectedProject.proposedSolution,
            domain: selectedProject.domain,
            techStack: selectedProject.techStack,
            keywords: selectedProject.keywords,
            currentVersion: selectedProject.currentVersion || 1
          }}
        />
      )}

      {selectedProject && (
        <ProjectCertificateModal
          isOpen={isCertModalOpen}
          onClose={() => setIsCertModalOpen(false)}
          project={{
            id: selectedProject.id,
            title: selectedProject.title,
            domain: selectedProject.domain,
            projectType: selectedProject.projectType || 'Major',
            completedAt: selectedProject.completedAt || new Date().toISOString(),
            status: selectedProject.status
          }}
        />
      )}

      {selectedProject && (
        <AiGradingCopilotDrawer
          isOpen={isCopilotOpen}
          onClose={() => setIsCopilotOpen(false)}
          project={{
            title: selectedProject.title,
            problemStatement: selectedProject.problemStatement,
            proposedSolution: selectedProject.proposedSolution,
            techStack: selectedProject.techStack,
            domain: selectedProject.domain,
            noveltyScore: selectedProject.validationReport?.noveltyScore ?? 85.0,
            duplicateRisk: selectedProject.validationReport?.duplicateRisk ? 'HIGH' : 'LOW',
            hasGithubRepo: Boolean(selectedProject.githubRepoUrl),
            hasDemoVideo: Boolean(selectedProject.demoVideoUrl),
            hasFinalReport: Boolean(selectedProject.finalReportUrl),
            hasPresentation: Boolean(selectedProject.presentationUrl)
          }}
          onApplyScores={handleApplyCopilot}
        />
      )}
    </div>
  );
};
