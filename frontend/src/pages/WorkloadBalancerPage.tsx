import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { aiApi } from '../services/api';
import type { GuideCapacity, Project } from '../types';
import {
  Users,
  Building2,
  Filter,
  CheckCircle,
  AlertCircle,
  Clock,
  Sparkles,
  Sliders,
  Send,
  ChevronRight,
  X
} from 'lucide-react';

interface AiRecommendation {
  guide_name: string;
  guide_email: string;
  department: string;
  match_percentage: number;
  remaining_slots: number;
  recommendation_reason: string;
}

export const WorkloadBalancerPage: React.FC = () => {
  const { token, user } = useAuth();
  const [guides, setGuides] = useState<GuideCapacity[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [sectionFilter, setSectionFilter] = useState<string>('ALL');
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [selectedGuide, setSelectedGuide] = useState<string>('');
  const [assigning, setAssigning] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Edit capacity state
  const [editingGuide, setEditingGuide] = useState<string | null>(null);
  const [newMaxCap, setNewMaxCap] = useState<number>(3);

  // AI Recommendation state
  const [aiRecommendations, setAiRecommendations] = useState<AiRecommendation[]>([]);
  const [loadingAiRecs, setLoadingAiRecs] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);

  const fetchWorkloads = async () => {
    try {
      const url = sectionFilter === 'ALL'
        ? '/api/workload/guides'
        : `/api/workload/guides?section=${encodeURIComponent(sectionFilter)}`;
      
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setGuides(data);
      }
    } catch (err) {
      console.error('Failed to load guide capacities', err);
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
      }
    } catch (err) {
      console.error('Failed to load projects', err);
    }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchWorkloads(), fetchProjects()]).finally(() => setLoading(false));
  }, [sectionFilter]);

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject || !selectedGuide) {
      setStatusMessage({ type: 'error', text: 'Please select both a project proposal and a faculty guide.' });
      return;
    }

    setAssigning(true);
    setStatusMessage(null);
    try {
      const res = await fetch('/api/workload/assign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          projectId: selectedProject,
          guideEmail: selectedGuide
        })
      });

      if (res.ok) {
        setStatusMessage({
          type: 'success',
          text: 'Guide successfully assigned! Live dual-channel notification (Email + Discord) dispatched to the team and faculty.'
        });
        setSelectedProject('');
        setSelectedGuide('');
        fetchWorkloads();
        fetchProjects();
      } else {
        const err = await res.text();
        setStatusMessage({ type: 'error', text: err || 'Assignment failed. Guide may have exceeded maximum capacity.' });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Network error during guide assignment.' });
    } finally {
      setAssigning(false);
    }
  };

  const handleUpdateCapacity = async (guideEmail: string) => {
    try {
      const res = await fetch(`/api/workload/capacity/${encodeURIComponent(guideEmail)}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ maxProjects: newMaxCap })
      });
      if (res.ok) {
        setEditingGuide(null);
        fetchWorkloads();
      }
    } catch (err) {
      console.error('Failed to update capacity', err);
    }
  };

  const handleGetAiRecommendations = async () => {
    if (!selectedProject) {
      setStatusMessage({ type: 'error', text: 'Please select a project proposal first to match with faculty.' });
      return;
    }

    const proj = projects.find((p) => p.id === selectedProject);
    if (!proj) return;

    setLoadingAiRecs(true);
    setStatusMessage(null);
    try {
      const candidates = guides.map((g) => ({
        name: g.guideName || g.guideEmail.split('@')[0],
        email: g.guideEmail,
        department: g.department || 'CSE',
        expertise_domains: [
          'Computer Vision',
          'Natural Language Processing',
          'Cloud Computing & DevOps',
          'Cyber Security & Blockchain',
          'Computer Science & AI',
        ],
        current_load: g.currentProjects,
        max_capacity: g.maxProjects,
      }));

      const res = await aiApi.post('/api/ai/recommend-guide', {
        project_title: proj.title,
        project_domain: proj.domain || 'Computer Science & AI',
        keywords: proj.keywords || '',
        candidates,
      });

      setAiRecommendations(res.data.recommendations || []);
      setShowAiModal(true);
    } catch (err: any) {
      console.error('AI Guide Recommendation failed', err);
      setStatusMessage({
        type: 'error',
        text: 'AI Guide Matchmaker failed. Ensure AI microservice is active on port 8000.',
      });
    } finally {
      setLoadingAiRecs(false);
    }
  };

  const isCoordinator = ['ROLE_OVERALL_COORDINATOR', 'ROLE_SECTION_COORDINATOR', 'ROLE_ADMIN'].includes(user?.role || '');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/90 pb-6">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 font-semibold text-xs uppercase tracking-wider">
            <Sliders className="h-4 w-4" />
            Faculty Allocation & Governance
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            Guide Workload Balancer
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Real-time project load distribution across academic sections. Hard capacity caps prevent faculty burnout, and automatic notifications sync to Discord and institutional email.
          </p>
        </div>

        {/* Section Filter Pill */}
        <div className="flex items-center gap-2 bg-white/90 border border-slate-200 rounded-2xl p-1.5 shadow-2xs backdrop-blur-md">
          <Filter className="h-4 w-4 text-slate-400 ml-2" />
          <span className="text-xs font-semibold text-slate-500 mr-1">Section:</span>
          {['ALL', 'Section A', 'Section B'].map((sec) => (
            <button
              key={sec}
              onClick={() => setSectionFilter(sec)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                sectionFilter === sec
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {sec}
            </button>
          ))}
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
            <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Allocation Panel (For Coordinators & Admins) */}
      {isCoordinator && (
        <div className="rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50/40 via-white/80 to-blue-50/30 p-6 shadow-xs backdrop-blur-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-md shadow-indigo-600/20">
                <Send className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Direct Team-to-Guide Allocation</h3>
                <p className="text-[11px] text-slate-500">Allocate vetted project proposals to eligible faculty with remaining capacity slots.</p>
              </div>
            </div>
            <span className="text-[11px] font-bold text-indigo-700 bg-indigo-100/60 border border-indigo-200 px-2.5 py-1 rounded-full">
              Hard Cap Enforced (Max 3/Guide)
            </span>
          </div>

          <form onSubmit={handleAssign} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            <div className="md:col-span-6 space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">Select Project Proposal</label>
                <button
                  type="button"
                  onClick={handleGetAiRecommendations}
                  disabled={!selectedProject || loadingAiRecs}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold text-indigo-700 bg-indigo-100/80 border border-indigo-200 hover:bg-indigo-200/80 transition-all cursor-pointer disabled:opacity-40"
                >
                  <Sparkles className="h-3 w-3 text-indigo-600" />
                  {loadingAiRecs ? 'Analyzing...' : '🤖 Match Guide via AI'}
                </button>
              </div>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white/90 px-3 py-2.5 text-xs text-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none shadow-2xs"
              >
                <option value="">-- Choose Submitted Project Proposal --</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    [{p.section}] {p.title} ({p.guideEmail ? `Current Guide: ${p.guideEmail}` : 'UNASSIGNED'})
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-4 space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Assign to Faculty Guide</label>
              <select
                value={selectedGuide}
                onChange={(e) => setSelectedGuide(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white/90 px-3 py-2.5 text-xs text-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none shadow-2xs"
              >
                <option value="">-- Choose Available Faculty --</option>
                {guides.map((g) => {
                  const isFull = g.currentProjects >= g.maxProjects;
                  return (
                    <option key={g.guideEmail} value={g.guideEmail} disabled={isFull}>
                      {g.guideEmail} ({g.currentProjects}/{g.maxProjects} load) {isFull ? '• CAPACITY FULL' : ''}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={assigning}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-md shadow-indigo-600/20 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
              >
                {assigning ? 'Assigning...' : 'Confirm Assignment'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* AI Guide Recommendations Modal */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="rounded-xl bg-indigo-600 p-2 text-white shadow-md shadow-indigo-600/25">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">AI Faculty Guide Matchmaker</h3>
                  <p className="text-xs text-slate-500">
                    Domain vector matching & vacant load optimization (Module 9 / FR-7.4)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAiModal(false)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {aiRecommendations.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500">
                  No eligible faculty guides with available capacity found for this domain.
                </div>
              ) : (
                aiRecommendations.map((rec, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl border border-slate-200/90 bg-slate-50/50 p-4 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-slate-900">{rec.guide_name}</h4>
                          <span className="text-[10px] font-mono text-slate-500">({rec.guide_email})</span>
                          <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                            {rec.department}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                          {rec.recommendation_reason}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-xs font-extrabold text-indigo-700">
                          {rec.match_percentage}% Match
                        </div>
                        <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">
                          {rec.remaining_slots} slot(s) free
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                      <div className="w-1/2 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-indigo-600 h-1.5 rounded-full"
                          style={{ width: `${rec.match_percentage}%` }}
                        />
                      </div>

                      <button
                        onClick={() => {
                          setSelectedGuide(rec.guide_email);
                          setShowAiModal(false);
                          setStatusMessage({
                            type: 'success',
                            text: `Selected ${rec.guide_name} (${rec.guide_email}) based on AI recommendation. Click 'Confirm Assignment' to finalize.`,
                          });
                        }}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                      >
                        <span>Select This Guide</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowAiModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Guide Cards Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Users className="h-4 w-4 text-indigo-600" />
            Faculty Mentor Capacities ({guides.length})
          </h2>
          <span className="text-xs text-slate-500">
            Click edit cap to adjust maximum allowed teams per faculty member.
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500">Loading guide workloads...</div>
        ) : guides.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 bg-white/80 rounded-2xl border border-slate-200">
            No guides found matching this filter.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {guides.map((g) => {
              const percentage = Math.round((g.currentProjects / g.maxProjects) * 100);
              const isFull = g.currentProjects >= g.maxProjects;
              const isNearCap = percentage >= 66 && !isFull;

              return (
                <div
                  key={g.guideEmail}
                  className="rounded-3xl border border-slate-200/90 bg-white/90 p-5 shadow-xs backdrop-blur-xl flex flex-col justify-between hover:shadow-md transition-all space-y-4"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-md shadow-indigo-500/20">
                          {g.guideEmail.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900 truncate max-w-[160px]">
                            {g.guideEmail.split('@')[0]}
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-1">
                            <Building2 className="h-3 w-3 text-slate-400" />
                            {g.department} • {g.section}
                          </div>
                        </div>
                      </div>

                      <span
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                          isFull
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : isNearCap
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}
                      >
                        {isFull ? 'FULL' : `${g.maxProjects - g.currentProjects} Slots Left`}
                      </span>
                    </div>

                    {/* Progress Meter */}
                    <div className="mt-4 space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-600">Current Load</span>
                        <span className="text-slate-900 font-bold">
                          {g.currentProjects} / {g.maxProjects} Projects
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200/60">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isFull
                              ? 'bg-rose-500'
                              : isNearCap
                              ? 'bg-amber-500'
                              : 'bg-indigo-600'
                          }`}
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Footer & Cap Controls */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    {editingGuide === g.guideEmail ? (
                      <div className="flex items-center gap-2 w-full">
                        <span className="text-[11px] font-semibold text-slate-600">Cap:</span>
                        <input
                          type="number"
                          min="1"
                          max="10"
                          value={newMaxCap}
                          onChange={(e) => setNewMaxCap(parseInt(e.target.value) || 1)}
                          className="w-14 rounded-lg border border-slate-300 px-2 py-1 text-xs text-slate-800"
                        />
                        <button
                          onClick={() => handleUpdateCapacity(g.guideEmail)}
                          className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white font-bold text-[11px] hover:bg-indigo-700"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingGuide(null)}
                          className="px-2 py-1 rounded-lg text-slate-500 hover:bg-slate-100 text-[11px]"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="text-[11px] text-slate-500 flex items-center gap-1">
                          <Clock className="h-3 w-3 text-slate-400" />
                          Updated live
                        </span>
                        {['ROLE_OVERALL_COORDINATOR', 'ROLE_ADMIN'].includes(user?.role || '') && (
                          <button
                            onClick={() => {
                              setEditingGuide(g.guideEmail);
                              setNewMaxCap(g.maxProjects);
                            }}
                            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer"
                          >
                            Adjust Cap
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Audit note & Discord notification feature highlight */}
      <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-5 shadow-2xs backdrop-blur-md flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-purple-50 text-purple-600 border border-purple-200 flex items-center justify-center font-bold">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800">Automated Notification Dispatch</h4>
            <p className="text-[11px] text-slate-500">
              When a team is allocated to a guide, the backend delivers real-time notifications to the team leader and faculty inbox, and posts an embed directly to the team's Discord webhook.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
