import React, { useEffect, useState } from 'react';
import { useAuth, PRESET_ROLES } from '../context/AuthContext';
import api, { aiApi } from '../services/api';
import type { DashboardStats, ProjectProposal } from '../types';
import {
  Sparkles,
  FileCheck2,
  Users,
  ArrowUpRight,
  CheckCircle2,
  Crown,
  GraduationCap,
  RefreshCw,
  FolderKanban,
  Download,
  BarChart3,
  PieChart,
  Layers,
  Scale,
  Search,
  X
} from 'lucide-react';

interface DashboardPageProps {
  onNavigate: (tab: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [projects, setProjects] = useState<ProjectProposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [exportingProjects, setExportingProjects] = useState(false);
  const [exportingWorkload, setExportingWorkload] = useState(false);

  // Natural Language Search State (Module 15 / FR-14.5)
  const [nlQuery, setNlQuery] = useState('');
  const [isSearchingNl, setIsSearchingNl] = useState(false);
  const [nlFilters, setNlFilters] = useState<{
    domain?: string | null;
    status?: string | null;
    tech?: string | null;
    year?: string | null;
    explanation?: string | null;
  } | null>(null);

  const currentRole = PRESET_ROLES.find((r) => {
    if (r.role !== user?.role) return false;
    if (user?.role === 'ROLE_STUDENT') {
      return r.isTeamLead === user?.teamLead;
    }
    return true;
  });

  const fetchLiveDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, projectsRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/projects'),
      ]);
      setStats(statsRes.data);
      setProjects(projectsRes.data);
    } catch (err) {
      console.error('Failed to load live dashboard data from Spring Boot', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveDashboardData();
  }, [user]);

  const handleExportProjectsCsv = async () => {
    setExportingProjects(true);
    try {
      const response = await api.get('/reports/export/projects-csv', {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `CPLMS_Projects_Report_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Failed to export projects CSV', err);
      alert('Failed to export projects report.');
    } finally {
      setExportingProjects(false);
    }
  };

  const handleExportWorkloadCsv = async () => {
    setExportingWorkload(true);
    try {
      const response = await api.get('/reports/export/workload-csv', {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `CPLMS_Faculty_Workload_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Failed to export workload CSV', err);
      alert('Failed to export workload report.');
    } finally {
      setExportingWorkload(false);
    }
  };

  const handleNlSearch = async (queryText?: string) => {
    const q = (queryText !== undefined ? queryText : nlQuery).trim();
    if (!q) {
      setNlFilters(null);
      return;
    }
    setIsSearchingNl(true);
    try {
      const res = await aiApi.post('/api/ai/nl-query', { query: q });
      const { domain_filter, status_filter, tech_keyword, year_filter, explanation } = res.data;
      setNlFilters({
        domain: domain_filter,
        status: status_filter,
        tech: tech_keyword,
        year: year_filter,
        explanation,
      });
    } catch (err) {
      console.error('Failed to run NL query', err);
    } finally {
      setIsSearchingNl(false);
    }
  };

  const handleResetNlSearch = () => {
    setNlQuery('');
    setNlFilters(null);
  };

  const displayedProjects = projects.filter((p) => {
    if (!nlFilters) return true;
    if (nlFilters.domain && !p.domain?.toLowerCase().includes(nlFilters.domain.toLowerCase())) {
      return false;
    }
    if (nlFilters.status && !p.status?.toLowerCase().includes(nlFilters.status.toLowerCase())) {
      return false;
    }
    if (
      nlFilters.tech &&
      !(
        p.techStack?.toLowerCase().includes(nlFilters.tech.toLowerCase()) ||
        p.title?.toLowerCase().includes(nlFilters.tech.toLowerCase())
      )
    ) {
      return false;
    }
    if (nlFilters.year && !p.createdAt?.includes(nlFilters.year)) {
      return false;
    }
    return true;
  });

  // Domain Distribution Calculations
  const domainCounts = projects.reduce((acc: Record<string, number>, p) => {
    const d = p.domain || 'General Engineering';
    acc[d] = (acc[d] || 0) + 1;
    return acc;
  }, {});

  const totalProjs = projects.length || 1;

  const stages = [
    { num: 1, name: 'Idea Submission', owner: 'Team Lead', desc: 'Metadata + problem & solution' },
    { num: 2, name: 'AI Validation', owner: 'AI Engine', desc: 'Embeddings + cosine similarity check' },
    { num: 3, name: 'Internal Guide Review', owner: 'Assigned Guide', desc: 'Rubric marks (1-5) & recommendation' },
    { num: 4, name: 'Independent Panel', owner: 'Panelists', desc: '3-Reviewer blind rubric evaluation' },
    { num: 5, name: 'Completion', owner: 'Student / Guide', desc: 'Deliverables & code repository upload' },
    { num: 6, name: 'Overall Sign-Off', owner: 'Overall Coord', desc: 'Institutional audit & reporting' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner in Light Theme with Frosted Glass */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-gradient-to-r from-white via-indigo-50/40 to-blue-50/50 p-7 shadow-xs backdrop-blur-xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${currentRole?.badgeColor} flex items-center gap-1`}>
                {user?.teamLead && <Crown className="h-3 w-3 text-indigo-700" />}
                <span>{currentRole?.title}</span>
              </span>
              <span className="text-xs text-slate-500 font-medium">Verified Institutional Session</span>
              {user?.section && (
                <span className="text-xs font-semibold bg-white text-slate-700 border border-slate-200 px-2.5 py-0.5 rounded-full shadow-2xs">
                  {user.section}
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Welcome, {user?.fullName}
            </h1>
            <p className="text-xs text-slate-600 mt-1.5 max-w-2xl leading-relaxed">
              {currentRole?.desc}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={fetchLiveDashboardData}
              title="Refresh live metrics from database"
              className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-all shadow-2xs cursor-pointer"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-indigo-600' : ''}`} />
            </button>

            {user?.role === 'ROLE_STUDENT' && (
              <button
                onClick={() => onNavigate('submission')}
                className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-2xl shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
              >
                <Sparkles className="h-4 w-4" />
                <span>{user?.teamLead ? 'Submit Idea & Run AI Screen' : 'View Team Proposal'}</span>
              </button>
            )}
            {user?.role === 'ROLE_ADMIN' && (
              <button
                onClick={() => onNavigate('bulk-import')}
                className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-2xl shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
              >
                <ArrowUpRight className="h-4 w-4" />
                <span>Bulk Excel Importer</span>
              </button>
            )}
            {user?.role === 'ROLE_PANEL' && (
              <button
                onClick={() => onNavigate('panel-reviews')}
                className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-2xl shadow-md shadow-amber-600/20 transition-all cursor-pointer"
              >
                <Scale className="h-4 w-4" />
                <span>Panel Evaluation</span>
              </button>
            )}
            {(user?.role === 'ROLE_INTERNAL_GUIDE' || user?.role === 'ROLE_SECTION_COORDINATOR') && (
              <button
                onClick={() => onNavigate('guide-reviews')}
                className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-2xl shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
              >
                <FileCheck2 className="h-4 w-4" />
                <span>Assigned Rubric Reviews</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Institutional Export Bar (Phase 5 - Institutional Reporting) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
          <Download className="w-4 h-4 text-indigo-600" />
          <span>Institutional Reporting & Compliance Exports:</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportProjectsCsv}
            disabled={exportingProjects}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            {exportingProjects ? 'Exporting...' : 'Export Projects (CSV)'}
          </button>
          <button
            onClick={handleExportWorkloadCsv}
            disabled={exportingWorkload}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            {exportingWorkload ? 'Exporting...' : 'Export Faculty Workload (CSV)'}
          </button>
        </div>
      </div>

      {/* Live Metrics Row from Database */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200/90 bg-white/80 p-5 shadow-xs backdrop-blur-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Active Database Proposals</span>
            <FileCheck2 className="h-4 w-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {loading ? <span className="animate-pulse text-slate-300">...</span> : stats?.totalProjects ?? 0}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-semibold mt-2">
            <span>{stats?.approvedProjects ?? 0} approved</span>
            <span className="text-slate-400 font-normal">• {stats?.underReviewProjects ?? 0} under review</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white/80 p-5 shadow-xs backdrop-blur-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">AI Validation Rate</span>
            <Sparkles className="h-4 w-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {loading ? <span className="animate-pulse text-slate-300">...</span> : `${stats?.validationRate ?? 100}%`}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-indigo-700 font-semibold mt-2">
            <span>Vector similarity active</span>
            <span className="text-slate-400 font-normal">• Live pgvector</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white/80 p-5 shadow-xs backdrop-blur-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Guide Capacity Load</span>
            <Users className="h-4 w-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {loading ? <span className="animate-pulse text-slate-300">...</span> : `${stats?.guideWorkloadRatio ?? 0}%`}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-amber-700 font-semibold mt-2">
            <span>{stats?.availableGuideSlots ?? 0} slots remaining</span>
            <span className="text-slate-400 font-normal">• Max 3 / guide</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white/80 p-5 shadow-xs backdrop-blur-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Enrolled Students</span>
            <GraduationCap className="h-4 w-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {loading ? <span className="animate-pulse text-slate-300">...</span> : stats?.totalStudents ?? 0}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-blue-700 font-semibold mt-2">
            <span>{stats?.totalFaculty ?? 0} faculty guides</span>
            <span className="text-slate-400 font-normal">• Live accounts</span>
          </div>
        </div>
      </div>

      {/* Visual Analytics Row (Phase 5 - Module 20 Analytics) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Domain Distribution Visual Chart */}
        <div className="lg:col-span-6 rounded-3xl border border-slate-200/90 bg-white/85 p-6 shadow-xs backdrop-blur-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <PieChart className="w-5 h-5 text-indigo-600" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">Domain Distribution Analytics</h3>
                <p className="text-xs text-slate-500">Breakdown of proposals across engineering domains</p>
              </div>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md">
              Live Feed
            </span>
          </div>

          <div className="space-y-3 pt-1">
            {Object.entries(domainCounts).map(([domain, count], idx) => {
              const pct = Math.round((count / totalProjs) * 100);
              const colors = [
                'bg-indigo-600',
                'bg-blue-500',
                'bg-emerald-500',
                'bg-purple-500',
                'bg-amber-500',
              ];
              const color = colors[idx % colors.length];

              return (
                <div key={domain} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">{domain}</span>
                    <span className="font-mono text-slate-500">
                      {count} project ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full ${color} rounded-full transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Lifecycle Health & Guide Workload Meter */}
        <div className="lg:col-span-6 rounded-3xl border border-slate-200/90 bg-white/85 p-6 shadow-xs backdrop-blur-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-600" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">Governance & Review Health</h3>
                <p className="text-xs text-slate-500">Status pipeline & workload capacity overview</p>
              </div>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md">
              Capacity: Max 3
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50 space-y-1">
              <span className="text-xs text-slate-500 font-medium">Guide Capacity Load</span>
              <div className="text-xl font-bold text-slate-800">
                {stats?.guideWorkloadRatio ?? 0}%
              </div>
              <p className="text-[11px] text-emerald-600 font-medium">
                {stats?.availableGuideSlots ?? 0} mentor slots open
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50 space-y-1">
              <span className="text-xs text-slate-500 font-medium">AI Screening Success</span>
              <div className="text-xl font-bold text-slate-800">
                {stats?.validationRate ?? 100}%
              </div>
              <p className="text-[11px] text-indigo-600 font-medium">
                0 false duplicates
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl border border-slate-200 bg-gradient-to-r from-indigo-50/50 to-emerald-50/50 text-xs text-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              <span className="font-semibold">6-Stage Academic Pipeline Operational</span>
            </div>
            <button
              onClick={() => onNavigate('panel-reviews')}
              className="text-indigo-600 hover:text-indigo-700 font-bold hover:underline"
            >
              Panel Reviews &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* Live Projects in Database (Filtered by caller role) */}
      <div className="rounded-3xl border border-slate-200/90 bg-white/85 p-6 shadow-xs backdrop-blur-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <FolderKanban className="h-5 w-5 text-indigo-600" />
            <div>
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">Active Proposals in Database</h2>
              <p className="text-xs text-slate-500">Live records retrieved via Spring Boot REST API for role: {user?.role}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
              {displayedProjects.length} of {projects.length} {projects.length === 1 ? 'Record' : 'Records'}
            </span>
          </div>
        </div>

        {/* Natural Language Query Bar (Module 15 / FR-14.5) */}
        <div className="rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50/60 via-white to-blue-50/40 p-3.5 space-y-2.5">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleNlSearch();
            }}
            className="flex items-center gap-2"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={nlQuery}
                onChange={(e) => setNlQuery(e.target.value)}
                placeholder="Ask in Natural Language (e.g. 'Show Computer Vision projects from 2024' or 'Approved proposals in Cloud')..."
                className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-hidden shadow-2xs"
              />
              {nlQuery && (
                <button
                  type="button"
                  onClick={handleResetNlSearch}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={isSearchingNl || !nlQuery.trim()}
              className="rounded-xl bg-indigo-600 hover:bg-indigo-700 px-4 py-2 text-xs font-bold text-white shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shrink-0"
            >
              {isSearchingNl ? (
                <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent animate-spin rounded-full" />
              ) : (
                <Sparkles className="h-3.5 w-3.5" />
              )}
              <span>AI Search</span>
            </button>
          </form>

          {/* Preset Prompts & Active Filter Indicator */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
            <div className="flex flex-wrap items-center gap-1.5 text-slate-500">
              <span className="font-semibold text-slate-600">Quick Filters:</span>
              {[
                'Computer Vision',
                'Approved in Cloud',
                'Under Review',
                'Python Projects',
              ].map((query) => (
                <button
                  key={query}
                  type="button"
                  onClick={() => {
                    setNlQuery(query);
                    handleNlSearch(query);
                  }}
                  className="rounded-lg bg-white border border-slate-200 px-2 py-0.5 text-[10px] font-medium text-slate-600 hover:border-indigo-300 hover:text-indigo-600 transition-all cursor-pointer shadow-2xs"
                >
                  {query}
                </button>
              ))}
            </div>

            {nlFilters && (
              <div className="flex items-center gap-1.5 text-indigo-800 font-medium bg-indigo-100/70 border border-indigo-200 px-2.5 py-0.5 rounded-lg">
                <Sparkles className="h-3 w-3 text-indigo-600 shrink-0" />
                <span>{nlFilters.explanation}</span>
                <button
                  onClick={handleResetNlSearch}
                  className="ml-1 text-indigo-600 hover:text-indigo-900 font-bold cursor-pointer"
                >
                  Clear
                </button>
              </div>
            )}
          </div>
        </div>

        {displayedProjects.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            {nlFilters ? 'No projects match your AI search criteria. Try a different query.' : 'No projects registered in the database for your account yet.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="pb-3 font-bold">Project Title</th>
                  <th className="pb-3 font-bold">Team / Lead</th>
                  <th className="pb-3 font-bold">Domain & Stack</th>
                  <th className="pb-3 font-bold">AI Similarity</th>
                  <th className="pb-3 font-bold">Guide Assignment</th>
                  <th className="pb-3 font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayedProjects.map((proj) => (
                  <tr key={proj.id} className="hover:bg-slate-50/70">
                    <td className="py-3.5 max-w-xs pr-3">
                      <span className="font-bold text-slate-900 block truncate">{proj.title}</span>
                      <span className="text-[11px] text-slate-500">{proj.projectType} Project • {proj.section}</span>
                    </td>
                    <td className="py-3.5 text-slate-700">
                      <span className="font-semibold block">{proj.teamName || 'Team'}</span>
                      <span className="text-[11px] text-slate-500">{proj.teamLeadEmail}</span>
                    </td>
                    <td className="py-3.5 text-slate-600">
                      <span className="font-medium text-slate-800 block">{proj.domain}</span>
                      <span className="text-[10px] text-slate-500 line-clamp-1">{proj.techStack}</span>
                    </td>
                    <td className="py-3.5">
                      {proj.validationReport ? (
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          proj.validationReport.similarityPercentage >= 70
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}>
                          <Sparkles className="h-3 w-3" />
                          {proj.validationReport.similarityPercentage}% match
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Pending AI Check</span>
                      )}
                    </td>
                    <td className="py-3.5 text-slate-700">
                      <span className="font-semibold block">{proj.assignedGuideName || 'Unassigned'}</span>
                      <span className="text-[11px] text-slate-500">{proj.assignedGuideEmail}</span>
                    </td>
                    <td className="py-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        proj.status.includes('APPROVED')
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : proj.status === 'UNDER_REVIEW' || proj.status === 'PANEL_UNDER_REVIEW'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : proj.status === 'REVISE_REQUESTED'
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}>
                        {proj.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Six-Stage Academic Lifecycle Pipeline */}
      <div className="rounded-3xl border border-slate-200/90 bg-white/80 p-6 shadow-xs backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">Academic 6-Stage Project Lifecycle</h2>
            <p className="text-xs text-slate-500">Formal governance pipeline tailored for students, guides, and coordinators</p>
          </div>
          <span className="text-[11px] px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold">
            Institutional Workflow
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
          {stages.map((stage) => (
            <div
              key={stage.num}
              className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 flex flex-col justify-between hover:bg-white hover:border-indigo-200 hover:shadow-sm transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="h-6 w-6 rounded-lg bg-indigo-600/10 text-indigo-700 border border-indigo-200 text-xs font-bold flex items-center justify-center">
                    {stage.num}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-500">{stage.owner}</span>
                </div>
                <h3 className="text-xs font-bold text-slate-900">{stage.name}</h3>
                <p className="text-[11px] text-slate-500 mt-1 leading-snug">{stage.desc}</p>
              </div>
              <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center gap-1.5 text-[10px] text-indigo-700 font-semibold">
                <CheckCircle2 className="h-3.5 w-3.5 text-indigo-600" />
                <span>Audited Step</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
