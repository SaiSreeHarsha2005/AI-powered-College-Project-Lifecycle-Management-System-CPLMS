import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import type { ContributionEntry, Project } from '../types';
import {
  Award,
  Clock,
  GitCommit,
  CheckCircle2,
  XCircle,
  AlertCircle,
  PlusCircle,
  Send,
  MessageSquare,
  ExternalLink,
  Crown
} from 'lucide-react';

export const ContributionPage: React.FC = () => {
  const { token, user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [contributions, setContributions] = useState<ContributionEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // New contribution form state (Student Level 1)
  const [moduleName, setModuleName] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [hoursSpent, setHoursSpent] = useState<number>(5);
  const [githubUrl, setGithubUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Leader review state
  const [reviewFeedback, setReviewFeedback] = useState<{ [id: string]: string }>({});

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data: Project[] = await res.json();
        setProjects(data);
        if (data.length > 0 && !selectedProjectId) {
          setSelectedProjectId(data[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load projects', err);
    }
  };

  const fetchContributions = async (projectId: string) => {
    if (!projectId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/contributions/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setContributions(data);
      }
    } catch (err) {
      console.error('Failed to load contributions', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (selectedProjectId) {
      fetchContributions(selectedProjectId);
    }
  }, [selectedProjectId]);

  const handleLogContribution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId || !moduleName || !taskDescription) {
      setStatusMessage({ type: 'error', text: 'Please fill in all mandatory contribution fields.' });
      return;
    }

    setSubmitting(true);
    setStatusMessage(null);
    try {
      const res = await fetch('/api/contributions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          projectId: selectedProjectId,
          moduleName,
          taskDescription,
          hoursSpent,
          githubCommitOrPr: githubUrl
        })
      });

      if (res.ok) {
        setStatusMessage({
          type: 'success',
          text: 'Contribution submitted! Queued for Team Leader review (Level 2 Approval).'
        });
        setModuleName('');
        setTaskDescription('');
        setHoursSpent(5);
        setGithubUrl('');
        fetchContributions(selectedProjectId);
      } else {
        const err = await res.text();
        setStatusMessage({ type: 'error', text: err || 'Failed to submit contribution.' });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Network error.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleLeaderReview = async (contributionId: string, approve: boolean) => {
    try {
      const feedback = reviewFeedback[contributionId] || (approve ? 'Verified and approved by Team Leader.' : 'Revision requested.');
      const res = await fetch(`/api/contributions/${contributionId}/leader-review`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          approve,
          feedback
        })
      });

      if (res.ok) {
        setStatusMessage({
          type: 'success',
          text: `Contribution ${approve ? 'approved' : 'rejected'}. Discord & Email notification updated!`
        });
        fetchContributions(selectedProjectId);
      } else {
        const err = await res.text();
        setStatusMessage({ type: 'error', text: err || 'Review update failed.' });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Network error.' });
    }
  };

  const activeProject = projects.find((p) => p.id === selectedProjectId);
  const isLeader = user?.teamLead || ['ROLE_ADMIN', 'ROLE_INTERNAL_GUIDE', 'ROLE_SECTION_COORDINATOR', 'ROLE_OVERALL_COORDINATOR'].includes(user?.role || '');

  // Calculate statistics
  const totalHours = contributions.reduce((acc, c) => acc + (c.hoursSpent || 0), 0);
  const approvedHours = contributions
    .filter((c) => c.leaderApprovalStatus === 'APPROVED')
    .reduce((acc, c) => acc + (c.hoursSpent || 0), 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/90 pb-6">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 font-semibold text-xs uppercase tracking-wider">
            <Award className="h-4 w-4" />
            Two-Level Accountability Protocol
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            Individual Contribution Tracking
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Phase 2 Milestone: Level 1 student self-reporting + Level 2 Team Leader verification.
            {activeProject && (
              <span className="font-semibold text-indigo-700 ml-1">
                Active: Team {activeProject.teamName} ({activeProject.section})
              </span>
            )}
          </p>
        </div>

        {/* Project Selector */}
        <div className="flex items-center gap-2 bg-white/90 border border-slate-200 rounded-2xl p-2 shadow-2xs backdrop-blur-md">
          <span className="text-xs font-bold text-slate-600 whitespace-nowrap">Project:</span>
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="rounded-xl border-none bg-slate-50 px-3 py-1.5 text-xs text-slate-800 font-semibold focus:ring-0 outline-none"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                [{p.section}] {p.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {statusMessage && (
        <div
          className={`p-4 rounded-2xl border text-xs font-semibold flex items-center gap-3 transition-all ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Summary Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="rounded-3xl border border-slate-200/90 bg-white/90 p-5 shadow-xs backdrop-blur-xl">
          <div className="text-xs font-semibold text-slate-500">Total Work Logged</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{totalHours.toFixed(1)}</span>
            <span className="text-xs text-slate-500">Hours</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-400">Across {contributions.length} log submissions</div>
        </div>

        <div className="rounded-3xl border border-slate-200/90 bg-white/90 p-5 shadow-xs backdrop-blur-xl">
          <div className="text-xs font-semibold text-slate-500">Leader Verified Hours</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-600">{approvedHours.toFixed(1)}</span>
            <span className="text-xs text-slate-500">Hours Approved</span>
          </div>
          <div className="mt-1 text-[11px] text-emerald-600 font-semibold">
            {totalHours > 0 ? `${Math.round((approvedHours / totalHours) * 100)}% verified` : '0%'}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200/90 bg-white/90 p-5 shadow-xs backdrop-blur-xl">
          <div className="text-xs font-semibold text-slate-500">Pending Review</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-600">
              {contributions.filter((c) => c.leaderApprovalStatus === 'PENDING').length}
            </span>
            <span className="text-xs text-slate-500">Entries</span>
          </div>
          <div className="mt-1 text-[11px] text-amber-600 font-semibold">Awaiting Team Lead sign-off</div>
        </div>
      </div>

      {/* Level 1: Student Self-Reporting Form */}
      <div className="rounded-3xl border border-slate-200/90 bg-white/90 p-6 shadow-xs backdrop-blur-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200 flex items-center justify-center font-bold text-xs">
              <PlusCircle className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Level 1: Log My Project Contribution</h3>
              <p className="text-[11px] text-slate-500">Record tasks accomplished, modules coded, hours dedicated, and Git verification links.</p>
            </div>
          </div>
          <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-full">
            Self-Log
          </span>
        </div>

        <form onSubmit={handleLogContribution} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Module / Feature Name *</label>
              <input
                type="text"
                placeholder="e.g. Authentication, Discord Webhook Dispatcher, AI Microservice"
                value={moduleName}
                onChange={(e) => setModuleName(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-200 bg-white/90 px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none shadow-2xs"
              >
              </input>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Hours Dedicated *</label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="100"
                  value={hoursSpent}
                  onChange={(e) => setHoursSpent(parseFloat(e.target.value) || 1)}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white/90 px-3 py-2 text-xs text-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none shadow-2xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Git Commit / PR URL</label>
                <input
                  type="url"
                  placeholder="https://github.com/..."
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white/90 px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none shadow-2xs"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Task Summary & Deliverables *</label>
            <textarea
              rows={2}
              placeholder="Describe specifically what you implemented, tests written, bugs resolved, and architecture decisions made..."
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-200 bg-white/90 px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none shadow-2xs resize-none"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-md shadow-indigo-600/20 disabled:opacity-50 cursor-pointer flex items-center gap-2"
            >
              <Send className="h-3.5 w-3.5" />
              {submitting ? 'Submitting...' : 'Submit Contribution'}
            </button>
          </div>
        </form>
      </div>

      {/* Level 2: Contribution Dossier & Leader Review Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">
              Contribution Dossier ({contributions.length})
            </h2>
            {isLeader && (
              <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Crown className="h-3 w-3 text-indigo-600" />
                Team Lead Review Access
              </span>
            )}
          </div>
          <span className="text-xs text-slate-500">
            Reviewed items are permanently logged in the audit ledger and guide dossier.
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500">Loading contribution logs...</div>
        ) : contributions.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 bg-white/80 rounded-2xl border border-slate-200">
            No contributions submitted for this project yet. Use the form above to log work!
          </div>
        ) : (
          <div className="space-y-4">
            {contributions.map((c) => {
              const isApproved = c.leaderApprovalStatus === 'APPROVED';
              const isRejected = c.leaderApprovalStatus === 'REJECTED';
              const isPending = c.leaderApprovalStatus === 'PENDING';

              return (
                <div
                  key={c.id}
                  className="rounded-3xl border border-slate-200/90 bg-white/90 p-5 shadow-xs backdrop-blur-xl space-y-3 transition-all hover:shadow-md"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs">
                        {c.studentEmail.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">{c.studentEmail}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2">
                          <span className="font-semibold text-indigo-600">Module: {c.moduleName}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-slate-400" />
                            {c.hoursSpent} hrs
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-full border flex items-center gap-1 ${
                          isApproved
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : isRejected
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {isApproved && <CheckCircle2 className="h-3 w-3" />}
                        {isRejected && <XCircle className="h-3 w-3" />}
                        {isPending && <Clock className="h-3 w-3" />}
                        {c.leaderApprovalStatus}
                      </span>
                    </div>
                  </div>

                  {/* Task Description */}
                  <p className="text-xs text-slate-700 leading-relaxed bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
                    {c.taskDescription}
                  </p>

                  {/* Links & Details */}
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-1">
                    {c.githubCommitOrPr ? (
                      <a
                        href={c.githubCommitOrPr}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 hover:underline"
                      >
                        <GitCommit className="h-3.5 w-3.5" />
                        <span>View Git Verification Link</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">No Git URL provided</span>
                    )}

                    {c.leaderFeedback && (
                      <div className="text-[11px] text-slate-600 bg-indigo-50/50 px-2.5 py-1 rounded-lg border border-indigo-100 flex items-center gap-1.5">
                        <MessageSquare className="h-3 w-3 text-indigo-500" />
                        <span className="font-semibold text-indigo-900">Leader Note:</span>
                        <span>{c.leaderFeedback}</span>
                      </div>
                    )}
                  </div>

                  {/* Leader Action Row (Level 2 Approval) */}
                  {isLeader && isPending && (
                    <div className="pt-3 border-t border-slate-100 space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Optional feedback or revision remarks..."
                          value={reviewFeedback[c.id] || ''}
                          onChange={(e) =>
                            setReviewFeedback({ ...reviewFeedback, [c.id]: e.target.value })
                          }
                          className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 outline-none"
                        />
                        <button
                          onClick={() => handleLeaderReview(c.id, true)}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-all cursor-pointer flex items-center gap-1 shadow-xs"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleLeaderReview(c.id, false)}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-all cursor-pointer flex items-center gap-1"
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          Reject
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
