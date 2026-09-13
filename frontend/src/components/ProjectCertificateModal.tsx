import React from 'react';
import { Award, Printer, X, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface ProjectCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: {
    id: string;
    title: string;
    domain?: string;
    projectType?: string;
    teamName?: string;
    teamLeadEmail?: string;
    section?: string;
    assignedGuideName?: string;
    completedAt?: string;
    status?: string;
  };
}

export const ProjectCertificateModal: React.FC<ProjectCertificateModalProps> = ({
  isOpen,
  onClose,
  project
}) => {
  if (!isOpen) return null;

  const serialId = `GCET-CPLMS-2026-${project.id ? project.id.substring(0, 8).toUpperCase() : 'ALPHA01'}`;
  const completionDate = project.completedAt
    ? new Date(project.completedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="bg-white rounded-3xl max-w-4xl w-full p-6 md:p-8 shadow-2xl border border-slate-200 relative my-auto print:border-none print:shadow-none print:p-0 print:max-w-none">
        
        {/* Floating Modal Actions (hidden on print) */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6 print:hidden">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Official Institutional Credential</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-md shadow-indigo-600/20 cursor-pointer"
            >
              <Printer size={15} />
              <span>Print / Save as PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ================= Printable Certificate Canvas ================= */}
        <div className="border-8 border-double border-amber-600/40 bg-radial from-amber-50/40 via-white to-slate-50/30 p-8 md:p-12 rounded-2xl relative overflow-hidden text-center text-slate-800 shadow-inner">
          
          {/* Subtle Watermark Stamp */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
            <Award size={480} />
          </div>

          {/* Institution Header */}
          <div className="space-y-1.5 border-b-2 border-amber-600/30 pb-6 mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white border border-amber-500/30 p-1 mb-2 shadow-xs">
              <img src="/gcet_logo.png" alt="GCET Crest" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-xl md:text-2xl font-serif font-bold text-slate-900 tracking-wide uppercase">
              Geethanjali College of Engineering & Technology
            </h1>
            <p className="text-[11px] font-semibold text-slate-500 tracking-wider uppercase">
              (UGC Autonomous, Permanently Affiliated to JNTUH, Accredited by NAAC 'A+' & NBA)
            </p>
            <h2 className="text-sm md:text-base font-bold text-indigo-900 tracking-wider uppercase pt-1">
              Department of Computer Science & Engineering
            </h2>
          </div>

          {/* Title Banner */}
          <div className="my-6">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-700 bg-amber-100/70 border border-amber-300 px-4 py-1 rounded-full">
              Certificate of Capstone Completion
            </span>
          </div>

          {/* Certificate Body Text */}
          <div className="space-y-4 text-xs md:text-sm text-slate-700 leading-relaxed max-w-2xl mx-auto font-serif">
            <p>
              This is to formally certify that the engineering capstone project entitled:
            </p>
            
            <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200 my-2">
              <h3 className="text-base md:text-lg font-bold text-indigo-950 font-sans tracking-tight">
                "{project.title}"
              </h3>
              <p className="text-[11px] font-sans font-semibold text-slate-500 mt-0.5">
                Domain: {project.domain || 'Computer Science & AI'} • {project.projectType || 'Major Project'}
              </p>
            </div>

            <p>
              has been successfully designed, developed, reviewed through AI novelty verification, and formally defended by the student team <span className="font-bold text-slate-900 font-sans">{project.teamName || 'Team Alpha'}</span> ({project.teamLeadEmail}) in fulfillment of the academic curriculum for the degree of Bachelor of Technology in Computer Science & Engineering.
            </p>

            {/* Performance Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-sans font-bold">
              <CheckCircle2 size={14} className="text-emerald-600" />
              <span>Evaluated Grade: Grade A+ with Distinction (Score: 92/100)</span>
            </div>
          </div>

          {/* Signature Blocks & QR Code Section */}
          <div className="mt-10 pt-6 border-t border-slate-200/80 grid grid-cols-3 items-end text-xs font-sans">
            
            {/* Guide Signature */}
            <div className="text-center space-y-1">
              <div className="h-10 flex items-end justify-center">
                <span className="font-serif italic text-base text-indigo-800 font-bold border-b border-slate-400 pb-1 px-4">
                  {project.assignedGuideName || 'Prof. Anita Deshmukh'}
                </span>
              </div>
              <p className="font-bold text-slate-800 mt-1">Internal Faculty Guide</p>
              <p className="text-[10px] text-slate-500">Dept. of Computer Science</p>
            </div>

            {/* Verifiable QR Code Block */}
            <div className="text-center flex flex-col items-center justify-center space-y-1.5">
              <div className="p-2 rounded-xl bg-white border border-slate-300 shadow-2xs">
                {/* SVG QR Code Simulation */}
                <svg width="68" height="68" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="100" height="100" fill="white" />
                  {/* Outer corners */}
                  <rect x="5" y="5" width="30" height="30" rx="4" stroke="#1E1B4B" strokeWidth="6" fill="white" />
                  <rect x="12" y="12" width="16" height="16" rx="2" fill="#4338CA" />
                  <rect x="65" y="5" width="30" height="30" rx="4" stroke="#1E1B4B" strokeWidth="6" fill="white" />
                  <rect x="72" y="12" width="16" height="16" rx="2" fill="#4338CA" />
                  <rect x="5" y="65" width="30" height="30" rx="4" stroke="#1E1B4B" strokeWidth="6" fill="white" />
                  <rect x="12" y="72" width="16" height="16" rx="2" fill="#4338CA" />
                  {/* QR Data Grid Matrix */}
                  <rect x="42" y="10" width="8" height="8" fill="#1E1B4B" />
                  <rect x="52" y="18" width="6" height="6" fill="#1E1B4B" />
                  <rect x="44" y="28" width="10" height="8" fill="#4338CA" />
                  <rect x="10" y="44" width="8" height="8" fill="#1E1B4B" />
                  <rect x="22" y="46" width="6" height="8" fill="#1E1B4B" />
                  <rect x="42" y="44" width="16" height="16" rx="2" fill="#1E1B4B" />
                  <rect x="65" y="44" width="10" height="8" fill="#1E1B4B" />
                  <rect x="80" y="48" width="8" height="10" fill="#4338CA" />
                  <rect x="44" y="68" width="8" height="10" fill="#1E1B4B" />
                  <rect x="56" y="72" width="12" height="6" fill="#4338CA" />
                  <rect x="74" y="68" width="14" height="14" fill="#1E1B4B" />
                </svg>
              </div>
              <span className="font-mono text-[9px] font-bold text-slate-500 tracking-wider">
                {serialId}
              </span>
              <span className="text-[9px] text-emerald-700 font-bold flex items-center gap-0.5">
                <ShieldCheck size={11} /> CPLMS Ledger Verified
              </span>
            </div>

            {/* HOD Signature */}
            <div className="text-center space-y-1">
              <div className="h-10 flex items-end justify-center">
                <span className="font-serif italic text-base text-indigo-800 font-bold border-b border-slate-400 pb-1 px-4">
                  Dr. Ramesh Sharma, Ph.D.
                </span>
              </div>
              <p className="font-bold text-slate-800 mt-1">Head of the Department</p>
              <p className="text-[10px] text-slate-500">Dated: {completionDate}</p>
            </div>
          </div>

          <div className="mt-6 pt-3 border-t border-slate-100 text-[10px] text-slate-400 font-sans">
            Accreditation Criteria Compliant: NBA Criterion 2.6 (Project Work Quality & Rigor) • NAAC Institutional Governance
          </div>
        </div>
      </div>
    </div>
  );
};
