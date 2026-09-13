import React, { useEffect, useState } from 'react';
import api, { aiApi } from '../services/api';
import type { ProjectProposal, ValidationReportData } from '../types';
import { VersionDiffModal } from '../components/VersionDiffModal';
import { AiMockVivaModal } from '../components/AiMockVivaModal';
import { ProjectCertificateModal } from '../components/ProjectCertificateModal';
import {
  Sparkles,
  Send,
  Lightbulb,
  RefreshCw,
  Info,
  Lock,
  FolderGit2,
  Video,
  FileText,
  CheckCircle2,
  Award,
  Presentation,
  FileUp,
  Wand2,
  UploadCloud,
  History,
  AlertTriangle,
  Bot
} from 'lucide-react';

export const SubmissionPage: React.FC = () => {
  const [projectId, setProjectId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [problemStatement, setProblemStatement] = useState('');
  const [proposedSolution, setProposedSolution] = useState('');
  const [domain, setDomain] = useState('Computer Science & AI');
  const [projectType, setProjectType] = useState<'Mini' | 'Major'>('Major');
  const [techStack, setTechStack] = useState('');
  const [keywords, setKeywords] = useState('');
  const [status, setStatus] = useState<string>('DRAFT');
  const [currentVersion, setCurrentVersion] = useState<number>(1);
  const [isDiffModalOpen, setIsDiffModalOpen] = useState(false);
  const [isVivaModalOpen, setIsVivaModalOpen] = useState(false);
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);

  // Deliverables State (Phase 4 / Module 14)
  const [githubRepoUrl, setGithubRepoUrl] = useState('');
  const [demoVideoUrl, setDemoVideoUrl] = useState('');
  const [finalReportUrl, setFinalReportUrl] = useState('');
  const [presentationUrl, setPresentationUrl] = useState('');
  const [completedAt, setCompletedAt] = useState<string | null>(null);
  const [completedBy, setCompletedBy] = useState<string | null>(null);
  const [isSubmittingDeliverables, setIsSubmittingDeliverables] = useState(false);

  // Document Intelligence State (Module 17 / FR-16.3)
  const [synopsisText, setSynopsisText] = useState('');
  const [showDocIntelligence, setShowDocIntelligence] = useState(false);
  const [isExtractingDoc, setIsExtractingDoc] = useState(false);

  // MinIO File Upload State (SRS Section 7.1 & 8)
  const [isUploadingReport, setIsUploadingReport] = useState(false);
  const [isUploadingPresentation, setIsUploadingPresentation] = useState(false);
  const [reportUploadMeta, setReportUploadMeta] = useState<string | null>(null);
  const [presentationUploadMeta, setPresentationUploadMeta] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isValidating, setIsValidating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationReport, setValidationReport] = useState<ValidationReportData | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Load active project proposal for the authenticated student team from database
  const loadMyProject = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/projects/my-project');
      if (res.data) {
        const p: ProjectProposal = res.data;
        setProjectId(p.id);
        setTitle(p.title || '');
        setProblemStatement(p.problemStatement || '');
        setProposedSolution(p.proposedSolution || '');
        setDomain(p.domain || 'Computer Science & AI');
        setProjectType((p.projectType as 'Mini' | 'Major') || 'Major');
        setTechStack(p.techStack || '');
        setKeywords(p.keywords || '');
        setStatus(p.status || 'DRAFT');
        setCurrentVersion(p.currentVersion || 1);
        setGithubRepoUrl(p.githubRepoUrl || '');
        setDemoVideoUrl(p.demoVideoUrl || '');
        setFinalReportUrl(p.finalReportUrl || '');
        setPresentationUrl(p.presentationUrl || '');
        setCompletedAt(p.completedAt || null);
        setCompletedBy(p.completedBy || null);
        if (p.validationReport) {
          setValidationReport(p.validationReport);
        }
      }
    } catch (err) {
      console.log('No existing project for user yet; ready to create new.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMyProject();
  }, []);

  // Save or Update Draft & Trigger AI Vector Similarity Screening
  const handleSaveAndValidate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsValidating(true);
    setNotification(null);

    try {
      const res = await api.post('/projects', {
        title,
        problemStatement,
        proposedSolution,
        domain,
        projectType,
        techStack,
        keywords,
        triggerAiValidation: true,
      });

      const saved: ProjectProposal = res.data;
      setProjectId(saved.id);
      setStatus(saved.status);
      if (saved.validationReport) {
        setValidationReport(saved.validationReport);
      }
      setNotification('Proposal saved to database. AI Vector similarity screening completed!');
    } catch (err: any) {
      setNotification('Error saving project to database: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsValidating(false);
    }
  };

  // Lock and submit to assigned Guide
  const handleFinalSubmit = async () => {
    if (!projectId) {
      setNotification('Please save your proposal first before submitting.');
      return;
    }

    setIsSubmitting(true);
    setNotification(null);
    try {
      const res = await api.post(`/projects/${projectId}/submit`);
      const updated: ProjectProposal = res.data;
      setStatus(updated.status);
      if (updated.validationReport) {
        setValidationReport(updated.validationReport);
      }
      setNotification('Project locked and officially submitted to assigned Internal Guide!');
    } catch (err: any) {
      setNotification('Submission error: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Final Deliverables (FR-12.1)
  const handleSubmitDeliverables = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId) return;
    setIsSubmittingDeliverables(true);
    setNotification(null);
    try {
      const res = await api.post(`/projects/${projectId}/deliverables`, {
        githubRepoUrl,
        demoVideoUrl,
        finalReportUrl,
        presentationUrl,
      });
      const updated: ProjectProposal = res.data;
      setStatus(updated.status);
      setNotification('Final deliverables submitted! Assigned Guide will review and provide institutional sign-off.');
    } catch (err: any) {
      setNotification('Deliverables error: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsSubmittingDeliverables(false);
    }
  };

  // Document Intelligence Extraction (Module 17)
  const handleExtractSynopsis = async () => {
    if (!synopsisText.trim()) return;
    setIsExtractingDoc(true);
    setNotification(null);
    try {
      const res = await aiApi.post('/api/ai/extract-synopsis', {
        text: synopsisText,
      });
      const data = res.data;
      if (data.title) setTitle(data.title);
      if (data.domain) setDomain(data.domain);
      if (data.problem_statement) setProblemStatement(data.problem_statement);
      if (data.proposed_solution) setProposedSolution(data.proposed_solution);
      if (data.tech_stack) setTechStack(data.tech_stack);
      if (data.keywords) setKeywords(data.keywords);
      setNotification('✨ Document Intelligence successfully parsed synopsis! Form fields auto-populated.');
      setShowDocIntelligence(false);
    } catch (err: any) {
      console.error('Extraction error', err);
      setNotification('Failed to extract synopsis: ' + (err.response?.data?.detail || err.message));
    } finally {
      setIsExtractingDoc(false);
    }
  };

  // MinIO S3 File Uploader (SRS Section 7.1)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'report' | 'presentation') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    if (target === 'report') setIsUploadingReport(true);
    else setIsUploadingPresentation(true);

    try {
      const res = await api.post('/files/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const { fileUrl, storageProvider, fileSize } = res.data;
      const sizeMb = (fileSize / (1024 * 1024)).toFixed(2);
      const meta = `${storageProvider} • ${sizeMb} MB`;

      if (target === 'report') {
        setFinalReportUrl(fileUrl);
        setReportUploadMeta(meta);
      } else {
        setPresentationUrl(fileUrl);
        setPresentationUploadMeta(meta);
      }
      setNotification(`File "${file.name}" successfully stored in ${storageProvider}!`);
    } catch (err: any) {
      console.error('Upload error', err);
      setNotification('Failed to upload file to storage: ' + (err.response?.data?.message || err.message));
    } finally {
      if (target === 'report') setIsUploadingReport(false);
      else setIsUploadingPresentation(false);
    }
  };

  // Parse JSON arrays safely from database
  let closestMatches: any[] = [];
  let alternativeDirections: string[] = [];
  let attributedFeatures: string[] = [];
  if (validationReport) {
    try {
      if (validationReport.closestMatchesJson) {
        closestMatches = JSON.parse(validationReport.closestMatchesJson);
      }
      if (validationReport.alternativeDirectionsJson) {
        alternativeDirections = JSON.parse(validationReport.alternativeDirectionsJson);
      }
      if (validationReport.attributedFeaturesJson) {
        attributedFeatures = JSON.parse(validationReport.attributedFeaturesJson);
      }
    } catch (e) {
      console.error('Error parsing JSON from validation report', e);
    }
  }

  const isLocked = status !== 'DRAFT' && status !== 'REVISE_REQUESTED';
  const isApproved = status.includes('APPROVED') || status === 'DELIVERABLES_SUBMITTED' || status === 'COMPLETED';

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-3xl border border-slate-200/90 bg-white/80 p-6 shadow-xs backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
                Stage 1 & 2: Proposal & AI Screening
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                status === 'COMPLETED'
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  : isApproved
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : isLocked
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-slate-100 text-slate-700 border-slate-200'
              }`}>
                {status.replace('_', ' ')}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Capstone Project Proposal & Deliverables
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Submit your project problem statement, run real-time vector novelty screening, and upload final deliverables.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {projectId && (
              <>
                <button
                  type="button"
                  onClick={() => setIsVivaModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-purple-200 dark:border-purple-800 bg-purple-50/90 dark:bg-purple-950/60 hover:bg-purple-100 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 text-xs font-bold transition cursor-pointer shadow-2xs"
                  title="Practice external examination with AI Viva Defense Simulator"
                >
                  <Bot className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                  <span>AI Mock Viva Defense</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsCertModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50/90 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-amber-800 dark:text-amber-300 text-xs font-bold transition cursor-pointer shadow-2xs"
                  title="Generate Official Capstone Completion Certificate"
                >
                  <Award className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>Capstone Certificate</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsDiffModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/80 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold transition cursor-pointer shadow-2xs"
                  title="View proposal revision versions and visual diffs"
                >
                  <History className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>Version History (v{currentVersion})</span>
                </button>
              </>
            )}
            <button
              onClick={loadMyProject}
              title="Reload project data from database"
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all shadow-2xs cursor-pointer"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin text-indigo-600 dark:text-indigo-400' : ''}`} />
            </button>
          </div>
        </div>

        {notification && (
          <div className="mt-4 p-3.5 rounded-2xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-900 font-semibold flex items-center gap-2 animate-fade-in">
            <Info className="h-4 w-4 text-indigo-600 shrink-0" />
            <span>{notification}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Submission Form & Deliverables */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main Proposal Form */}
          <div className="rounded-3xl border border-slate-200/90 bg-white/85 p-6 shadow-xs backdrop-blur-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>Project Proposal Details</span>
                {isLocked && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                    <Lock className="w-3 h-3" /> Locked for Guide Review
                  </span>
                )}
              </h2>
              <div className="flex items-center gap-2">
                {!isLocked && (
                  <button
                    type="button"
                    onClick={() => setShowDocIntelligence(!showDocIntelligence)}
                    className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg border border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 transition cursor-pointer"
                  >
                    <Wand2 className="w-3.5 h-3.5" />
                    <span>{showDocIntelligence ? 'Close AI Parser' : 'Auto-Fill from Draft / File'}</span>
                  </button>
                )}
                <span className="text-[11px] text-slate-400">Step 1 of 6</span>
              </div>
            </div>

            {/* Document Intelligence Synopsis Parser Dropzone (Module 17) */}
            {showDocIntelligence && !isLocked && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-50/70 to-indigo-50/70 border border-purple-200 space-y-3 animate-fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileUp className="w-4 h-4 text-purple-600" />
                    <span className="text-xs font-bold text-purple-900 uppercase tracking-wide">
                      Document Intelligence: Auto-Populate Proposal
                    </span>
                  </div>
                  <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded-full">
                    FastAPI Engine
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  Paste raw text from your proposal document or synopsis. AI will extract title, domain, problem statement, solution, tech stack, and keywords.
                </p>
                <textarea
                  rows={4}
                  value={synopsisText}
                  onChange={(e) => setSynopsisText(e.target.value)}
                  placeholder="Paste your project abstract, problem statement, or synopsis text here..."
                  className="w-full text-xs font-mono p-3 rounded-xl border border-purple-200 bg-white focus:ring-2 focus:ring-purple-500"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowDocIntelligence(false)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={isExtractingDoc || !synopsisText.trim()}
                    onClick={handleExtractSynopsis}
                    className="px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 transition flex items-center gap-1.5 shadow-md shadow-purple-600/20 disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isExtractingDoc ? 'Parsing Synopsis...' : 'Auto-Fill Form Fields'}</span>
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={handleSaveAndValidate} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Project Title</label>
                <input
                  type="text"
                  required
                  disabled={isLocked}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Automated Smart Attendance System using Face Recognition"
                  className="w-full text-xs font-medium border border-slate-200 rounded-xl p-3 bg-white focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50 disabled:text-slate-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Domain / Category</label>
                  <select
                    disabled={isLocked}
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    className="w-full text-xs font-medium border border-slate-200 rounded-xl p-3 bg-white focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50 disabled:text-slate-500"
                  >
                    <option value="Computer Science & AI">Computer Science & AI</option>
                    <option value="Computer Vision">Computer Vision</option>
                    <option value="Natural Language Processing">Natural Language Processing</option>
                    <option value="Cloud Computing & DevOps">Cloud Computing & DevOps</option>
                    <option value="Cyber Security & Blockchain">Cyber Security & Blockchain</option>
                    <option value="IoT & Embedded Systems">IoT & Embedded Systems</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Project Type</label>
                  <select
                    disabled={isLocked}
                    value={projectType}
                    onChange={(e) => setProjectType(e.target.value as 'Mini' | 'Major')}
                    className="w-full text-xs font-medium border border-slate-200 rounded-xl p-3 bg-white focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50 disabled:text-slate-500"
                  >
                    <option value="Major">Major Project (Final Year)</option>
                    <option value="Mini">Mini Project (3rd Year)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Problem Statement</label>
                <textarea
                  rows={3}
                  required
                  disabled={isLocked}
                  value={problemStatement}
                  onChange={(e) => setProblemStatement(e.target.value)}
                  placeholder="Describe the specific real-world challenge or limitation in existing solutions..."
                  className="w-full text-xs font-medium border border-slate-200 rounded-xl p-3 bg-white focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50 disabled:text-slate-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Proposed Solution</label>
                <textarea
                  rows={3}
                  required
                  disabled={isLocked}
                  value={proposedSolution}
                  onChange={(e) => setProposedSolution(e.target.value)}
                  placeholder="Explain your technical architecture, methodology, and unique innovations..."
                  className="w-full text-xs font-medium border border-slate-200 rounded-xl p-3 bg-white focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50 disabled:text-slate-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Technology Stack</label>
                  <input
                    type="text"
                    disabled={isLocked}
                    value={techStack}
                    onChange={(e) => setTechStack(e.target.value)}
                    placeholder="Python, FastAPI, React, PyTorch, Docker"
                    className="w-full text-xs font-medium border border-slate-200 rounded-xl p-3 bg-white focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50 disabled:text-slate-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Keywords (Comma Separated)</label>
                  <input
                    type="text"
                    disabled={isLocked}
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    placeholder="Face Recognition, Deep Learning, Edge Computing"
                    className="w-full text-xs font-medium border border-slate-200 rounded-xl p-3 bg-white focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50 disabled:text-slate-500"
                  />
                </div>
              </div>

              {!isLocked && (
                <div className="flex flex-col sm:flex-row items-center justify-end gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={isValidating}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className={`w-4 h-4 ${isValidating ? 'animate-spin' : ''}`} />
                    <span>{isValidating ? 'Running Vector Similarity...' : 'Save Draft & Screen AI'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleFinalSubmit}
                    disabled={isSubmitting || !projectId}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isSubmitting ? 'Locking & Submitting...' : 'Submit to Guide'}</span>
                  </button>
                </div>
              )}
            </form>
          </div>

          {/* Stage 5: Final Deliverables Submission Card (FR-12.1) */}
          <div className="rounded-3xl border border-slate-200/90 bg-white/85 p-6 shadow-xs backdrop-blur-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-indigo-600" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Capstone Final Deliverables</h3>
                  <p className="text-xs text-slate-500">Stage 5: Final code repository, demo video & report upload</p>
                </div>
              </div>
              <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                status === 'COMPLETED'
                  ? 'bg-emerald-100 text-emerald-800'
                  : status === 'DELIVERABLES_SUBMITTED'
                  ? 'bg-indigo-100 text-indigo-800'
                  : 'bg-slate-100 text-slate-700'
              }`}>
                {status === 'COMPLETED' ? 'Archived & Completed' : status === 'DELIVERABLES_SUBMITTED' ? 'Awaiting Sign-Off' : 'Pending Upload'}
              </span>
            </div>

            {completedAt && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Officially Signed Off & Archived</span>
                </div>
                <p className="text-emerald-800">
                  Signed off by: <strong>{completedBy}</strong> on {new Date(completedAt).toLocaleDateString()}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmitDeliverables} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-1">
                  <FolderGit2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>GitHub Code Repository URL</span>
                </label>
                <input
                  type="url"
                  required
                  disabled={status === 'COMPLETED'}
                  value={githubRepoUrl}
                  onChange={(e) => setGithubRepoUrl(e.target.value)}
                  placeholder="https://github.com/organization/project-name"
                  className="w-full text-xs font-medium border border-slate-200 rounded-xl p-3 bg-white focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-1">
                    <Video className="w-3.5 h-3.5 text-slate-500" />
                    <span>Demo Video Link (YouTube / Drive)</span>
                  </label>
                  <input
                    type="url"
                    disabled={status === 'COMPLETED'}
                    value={demoVideoUrl}
                    onChange={(e) => setDemoVideoUrl(e.target.value)}
                    placeholder="https://youtu.be/... or Google Drive"
                    className="w-full text-xs font-medium border border-slate-200 rounded-xl p-3 bg-white focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-slate-500" />
                      <span>Final Report Document (PDF)</span>
                    </label>
                    <label className={`cursor-pointer inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 ${
                      status === 'COMPLETED' ? 'opacity-50 pointer-events-none' : ''
                    }`}>
                      <UploadCloud className="w-3 h-3" />
                      <span>{isUploadingReport ? 'Uploading to MinIO...' : 'Upload to MinIO'}</span>
                      <input
                        type="file"
                        accept=".pdf,.docx"
                        disabled={status === 'COMPLETED' || isUploadingReport}
                        onChange={(e) => handleFileUpload(e, 'report')}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <input
                    type="text"
                    disabled={status === 'COMPLETED'}
                    value={finalReportUrl}
                    onChange={(e) => setFinalReportUrl(e.target.value)}
                    placeholder="Upload file or enter URL..."
                    className="w-full text-xs font-medium border border-slate-200 rounded-xl p-3 bg-white focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50"
                  />
                  {reportUploadMeta && (
                    <span className="text-[10px] text-emerald-700 font-semibold block mt-1">
                      ✓ {reportUploadMeta}
                    </span>
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Presentation className="w-3.5 h-3.5 text-slate-500" />
                    <span>Capstone Slide Deck (PPTX/PDF)</span>
                  </label>
                  <label className={`cursor-pointer inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 ${
                    status === 'COMPLETED' ? 'opacity-50 pointer-events-none' : ''
                  }`}>
                    <UploadCloud className="w-3 h-3" />
                    <span>{isUploadingPresentation ? 'Uploading to MinIO...' : 'Upload to MinIO'}</span>
                    <input
                      type="file"
                      accept=".pptx,.pdf"
                      disabled={status === 'COMPLETED' || isUploadingPresentation}
                      onChange={(e) => handleFileUpload(e, 'presentation')}
                      className="hidden"
                    />
                  </label>
                </div>
                <input
                  type="text"
                  disabled={status === 'COMPLETED'}
                  value={presentationUrl}
                  onChange={(e) => setPresentationUrl(e.target.value)}
                  placeholder="Upload slide deck or enter URL..."
                  className="w-full text-xs font-medium border border-slate-200 rounded-xl p-3 bg-white focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50"
                />
                {presentationUploadMeta && (
                  <span className="text-[10px] text-emerald-700 font-semibold block mt-1">
                    ✓ {presentationUploadMeta}
                  </span>
                )}
              </div>

              {status !== 'COMPLETED' && (
                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={isSubmittingDeliverables}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isSubmittingDeliverables ? 'Saving...' : 'Submit Deliverables for Sign-Off'}</span>
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Right Column: Real-Time AI Vector Screening Report */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-3xl border border-slate-200/90 bg-white/85 p-6 shadow-xs backdrop-blur-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-indigo-600" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900">AI Novelty & Vector Screen</h3>
                  <p className="text-[11px] text-slate-500">Cosine similarity vs. historical archives</p>
                </div>
              </div>
              {validationReport && (
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                  validationReport.similarityPercentage >= 70
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}>
                  {validationReport.similarityPercentage}% Similarity
                </span>
              )}
            </div>

            {!validationReport ? (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <Lightbulb className="h-8 w-8 mx-auto text-slate-300" />
                <p className="text-xs font-medium">No validation report generated yet.</p>
                <p className="text-[11px] text-slate-400">Save a draft to run the AI similarity algorithm.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Metric Badges */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-500 block">Novelty Index</span>
                    <span className="text-lg font-black text-slate-900">
                      {validationReport.noveltyScore} / 5.0
                    </span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-500 block">Scope Evaluation</span>
                    <span className="text-xs font-bold text-indigo-700 block mt-1">
                      {validationReport.scopeEvaluation}
                    </span>
                  </div>
                </div>

                {/* Summary Box */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed">
                  <span className="font-bold text-slate-800 block mb-1">AI Executive Summary:</span>
                  {validationReport.noveltySummary}
                </div>

                {/* AI Explainability: Attributed Sub-Features (Standout Feature #4) */}
                {attributedFeatures.length > 0 && (
                  <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-2">
                    <div className="flex items-center gap-1.5 text-purple-900 font-bold text-xs">
                      <Sparkles className="h-4 w-4 text-purple-600" />
                      <span>AI Explainability: Sub-Feature Attribution</span>
                    </div>
                    <p className="text-[11px] text-purple-800">
                      Similarity matches were triggered by these specific architectural sub-modules:
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {attributedFeatures.map((feat: string, idx: number) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-lg bg-white border border-purple-200 text-purple-700 text-[11px] font-semibold shadow-2xs"
                        >
                          • {feat}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Multi-Factor Risk & Feasibility Assessment (Standout Feature #5) */}
                {validationReport.riskLevel && (
                  <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-amber-900 font-bold text-xs">
                        <AlertTriangle className="h-4 w-4 text-amber-600" />
                        <span>Multi-Factor Risk & Feasibility Assessment</span>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        validationReport.riskLevel === 'LOW'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : validationReport.riskLevel === 'MODERATE'
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-rose-100 text-rose-800 border border-rose-300'
                      }`}>
                        {validationReport.riskLevel.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-700 leading-relaxed">
                      {validationReport.riskSummary}
                    </p>
                    {validationReport.timelineFeasibility && (
                      <div className="pt-1.5 border-t border-amber-200/60 text-[11px] text-amber-900 font-medium flex items-center gap-1.5">
                        <span className="font-bold">Milestone Cadence:</span>
                        <span>{validationReport.timelineFeasibility}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Closest Archive Matches from DB */}
                {closestMatches.length > 0 && (
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
                      Closest Matches in Historical Database
                    </span>
                    <div className="space-y-2">
                      {closestMatches.map((m: any, idx: number) => (
                        <div
                          key={idx}
                          className="p-3 rounded-2xl border border-slate-200 bg-white text-xs flex items-center justify-between shadow-2xs"
                        >
                          <div>
                            <span className="text-slate-800 font-bold line-clamp-1">{m.title}</span>
                            <span className="text-[11px] text-slate-500">{m.domain} • Year {m.academic_year || 'Historical'}</span>
                          </div>
                          <span className="text-xs font-bold text-rose-600 shrink-0 ml-2">
                            {m.similarity_percentage}% match
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Constructive Alternatives from DB */}
                {alternativeDirections.length > 0 && (
                  <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100">
                    <div className="flex items-center gap-1.5 text-indigo-900 font-bold text-xs mb-2">
                      <Lightbulb className="h-4 w-4 text-amber-500" />
                      <span>Recommended Alternative Directions (FR-6.6)</span>
                    </div>
                    <p className="text-[11px] text-slate-600 mb-2">
                      Suggestions to differentiate this work for your guide:
                    </p>
                    <ul className="space-y-2 text-[11px] text-slate-700">
                      {alternativeDirections.map((alt: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-indigo-600 font-bold">•</span>
                          <span>{alt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            <div className="pt-3 border-t border-slate-100 text-[10px] text-slate-500 flex items-center gap-1.5">
              <Info className="h-3.5 w-3.5 text-slate-400" />
              <span>AI Validation is advisory. Faculty guides make final decisions.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Version Diff Modal */}
      {projectId && (
        <VersionDiffModal
          isOpen={isDiffModalOpen}
          onClose={() => setIsDiffModalOpen(false)}
          projectId={projectId}
          currentProposal={{
            title,
            problemStatement,
            proposedSolution,
            domain,
            techStack,
            keywords,
            currentVersion
          }}
        />
      )}

      {/* AI Mock Viva Defense Simulator Modal */}
      {projectId && (
        <AiMockVivaModal
          isOpen={isVivaModalOpen}
          onClose={() => setIsVivaModalOpen(false)}
          project={{
            id: projectId,
            title: title || 'Deep Learning-based Facial Recognition & Attendance System',
            problemStatement: problemStatement || 'Automated attendance tracking using CNN facial embeddings and cosine similarity',
            techStack: techStack || 'Python, PyTorch, OpenCV, FastAPI, React, PostgreSQL',
            domain: domain || 'Computer Science & AI',
            projectType: projectType || 'Major'
          }}
        />
      )}

      {/* Official Capstone Certificate Modal */}
      {projectId && (
        <ProjectCertificateModal
          isOpen={isCertModalOpen}
          onClose={() => setIsCertModalOpen(false)}
          project={{
            id: projectId,
            title: title || 'Deep Learning-based Facial Recognition & Attendance System',
            domain: domain || 'Computer Science & AI',
            projectType: projectType || 'Major',
            completedAt: completedAt || new Date().toISOString(),
            status: status
          }}
        />
      )}
    </div>
  );
};
