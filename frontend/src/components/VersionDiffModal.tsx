import React, { useEffect, useState } from 'react';
import api from '../services/api';
import type { ProjectProposal, ProjectVersion } from '../types';
import { GitCompare, Clock, X, History } from 'lucide-react';

export interface VersionDiffModalProps {
  isOpen?: boolean;
  onClose: () => void;
  project?: ProjectProposal;
  projectId?: string;
  currentProposal?: {
    title: string;
    problemStatement: string;
    proposedSolution: string;
    domain?: string;
    techStack?: string;
    keywords?: string;
    currentVersion?: number;
  };
}

export const VersionDiffModal: React.FC<VersionDiffModalProps> = ({
  isOpen = true,
  project,
  projectId,
  currentProposal,
  onClose
}) => {
  const [versions, setVersions] = useState<ProjectVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVersionNum, setSelectedVersionNum] = useState<number | null>(null);

  const effectiveProjectId = projectId || project?.id;
  const currentVer = currentProposal?.currentVersion || project?.currentVersion || 1;
  const activeTitle = currentProposal?.title || project?.title || '';
  const activeProblem = currentProposal?.problemStatement || project?.problemStatement || '';
  const activeSolution = currentProposal?.proposedSolution || project?.proposedSolution || '';
  const activeTech = currentProposal?.techStack || project?.techStack || '';

  useEffect(() => {
    if (!isOpen || !effectiveProjectId) return;
    const fetchVersions = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/projects/${effectiveProjectId}/versions`);
        const list: ProjectVersion[] = res.data;
        setVersions(list);
        if (list.length > 0) {
          setSelectedVersionNum(list[0].versionNumber);
        }
      } catch (err) {
        console.error('Failed to load project versions', err);
      } finally {
        setLoading(false);
      }
    };
    fetchVersions();
  }, [isOpen, effectiveProjectId]);

  if (!isOpen) return null;

  const selectedVersion = versions.find((v) => v.versionNumber === selectedVersionNum);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-4xl w-full p-6 md:p-8 shadow-2xl border border-slate-200 space-y-6 max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20">
              <History className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">Proposal Version History & Visual Diff</h2>
                <span className="rounded-full bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 text-[10px] font-bold text-indigo-700">
                  Current Version: v{currentVer}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Audit revision deltas between historical drafts and current submission for "{activeTitle}"
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-all cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="py-16 text-center text-xs text-slate-500 font-medium">
            <div className="h-6 w-6 border-2 border-indigo-600 border-t-transparent animate-spin rounded-full mx-auto mb-2" />
            Loading revision timeline...
          </div>
        ) : versions.length === 0 ? (
          <div className="py-12 text-center text-slate-500 space-y-2">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <Clock className="h-6 w-6" />
            </div>
            <h4 className="text-xs font-bold text-slate-700">No Prior Revisions Archived Yet</h4>
            <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
              This proposal is currently at baseline (Version 1). Prior revisions are automatically snapshotted whenever a faculty mentor requests changes.
            </p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-6 pr-1">
            {/* Version Select Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-600 shrink-0 mr-1">Compare Against:</span>
              {versions.map((ver) => (
                <button
                  key={ver.id}
                  onClick={() => setSelectedVersionNum(ver.versionNumber)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                    selectedVersionNum === ver.versionNumber
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <span>v{ver.versionNumber} Snapshot</span>
                  <span className="text-[10px] opacity-80 font-normal">
                    ({new Date(ver.createdAt).toLocaleDateString()})
                  </span>
                </button>
              ))}
            </div>

            {selectedVersion && (
              <div className="space-y-4">
                {/* Diff Summary Alert */}
                <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-900 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GitCompare className="h-4 w-4 text-indigo-600 shrink-0" />
                    <span className="font-semibold">Comparing v{selectedVersion.versionNumber} (Historical) with v{currentVer} (Current Active)</span>
                  </div>
                  <span className="text-[11px] text-slate-500">
                    Archived: {new Date(selectedVersion.createdAt).toLocaleString()}
                  </span>
                </div>

                {/* Side-by-Side Comparison Columns */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* Left: Previous Version */}
                  <div className="rounded-2xl border border-rose-200/80 bg-rose-50/30 p-4 space-y-3">
                    <div className="flex items-center justify-between border-b border-rose-200/60 pb-2">
                      <span className="font-bold text-rose-800">Version {selectedVersion.versionNumber} (Previous)</span>
                      <span className="text-[10px] font-mono text-rose-600">Prior Snapshot</span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                        Title
                      </span>
                      <p className="font-semibold text-slate-800">{selectedVersion.title}</p>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                        Problem Statement
                      </span>
                      <p className="text-slate-700 leading-relaxed bg-white/60 p-2.5 rounded-xl border border-rose-100 text-[11px]">
                        {selectedVersion.problemStatement}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                        Proposed Solution & Methodology
                      </span>
                      <p className="text-slate-700 leading-relaxed bg-white/60 p-2.5 rounded-xl border border-rose-100 text-[11px]">
                        {selectedVersion.proposedSolution}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                        Technology Stack
                      </span>
                      <span className="text-slate-700 font-mono text-[11px]">{selectedVersion.techStack || 'None'}</span>
                    </div>
                  </div>

                  {/* Right: Current Active Version */}
                  <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/30 p-4 space-y-3">
                    <div className="flex items-center justify-between border-b border-emerald-200/60 pb-2">
                      <span className="font-bold text-emerald-800">Version {currentVer} (Current Active)</span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        Live Revision
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                        Title
                      </span>
                      <p className="font-semibold text-slate-900">{activeTitle}</p>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                        Problem Statement
                      </span>
                      <p className="text-slate-800 leading-relaxed bg-white p-2.5 rounded-xl border border-emerald-100 text-[11px] shadow-2xs">
                        {activeProblem}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                        Proposed Solution & Methodology
                      </span>
                      <p className="text-slate-800 leading-relaxed bg-white p-2.5 rounded-xl border border-emerald-100 text-[11px] shadow-2xs">
                        {activeSolution}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                        Technology Stack
                      </span>
                      <span className="text-slate-900 font-mono text-[11px] font-bold">{activeTech}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-slate-100 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer"
          >
            Close Diff Viewer
          </button>
        </div>
      </div>
    </div>
  );
};
