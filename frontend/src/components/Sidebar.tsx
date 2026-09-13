import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  FileSpreadsheet,
  Users,
  Send,
  CheckSquare,
  Sparkles,
  ShieldAlert,
  BarChart3,
  Award,
  Layers,
  Scale,
  CalendarCheck,
  UserCheck,
  Activity
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab }) => {
  const { user } = useAuth();
  const role = user?.role;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard Overview', icon: LayoutDashboard, roles: ['*'] },

    // Student items
    {
      id: 'submission',
      label: user?.teamLead ? 'Submit Idea & AI Check' : 'View Team Proposal',
      icon: Send,
      roles: ['ROLE_STUDENT', 'ROLE_ADMIN'],
    },
    { id: 'team', label: 'Team Formation', icon: Users, roles: ['ROLE_STUDENT', 'ROLE_ADMIN'] },
    {
      id: 'contribution',
      label: user?.teamLead ? 'Contribution & Approvals' : 'Log My Contribution',
      icon: Award,
      roles: ['ROLE_STUDENT', 'ROLE_ADMIN'],
    },

    // Internal Guide items
    {
      id: 'guide-reviews',
      label: 'Assigned Teams & Rubric',
      icon: CheckSquare,
      roles: ['ROLE_INTERNAL_GUIDE', 'ROLE_SECTION_COORDINATOR', 'ROLE_OVERALL_COORDINATOR', 'ROLE_ADMIN'],
    },

    // Milestone Reviews (Module 11 / Phase 3 & 4)
    {
      id: 'milestones',
      label: 'Milestone CIE Reviews',
      icon: CalendarCheck,
      roles: ['ROLE_STUDENT', 'ROLE_INTERNAL_GUIDE', 'ROLE_PANEL', 'ROLE_SECTION_COORDINATOR', 'ROLE_OVERALL_COORDINATOR', 'ROLE_ADMIN'],
    },

    // Panelist items (Phase 4)
    {
      id: 'panel-reviews',
      label: 'Independent Panel Review',
      icon: Scale,
      roles: ['ROLE_PANEL', 'ROLE_SECTION_COORDINATOR', 'ROLE_OVERALL_COORDINATOR', 'ROLE_ADMIN'],
    },

    // Section-wise Guide items
    {
      id: 'section-oversight',
      label: 'Section Teams Oversight',
      icon: Layers,
      roles: ['ROLE_SECTION_COORDINATOR', 'ROLE_OVERALL_COORDINATOR', 'ROLE_ADMIN'],
    },

    // Overall Coordinator items
    {
      id: 'guide-allocation',
      label: 'Guide Workload Balancer',
      icon: BarChart3,
      roles: ['ROLE_OVERALL_COORDINATOR', 'ROLE_ADMIN'],
    },

    // Admin & Ops items
    { id: 'bulk-import', label: 'Bulk Excel Importer', icon: FileSpreadsheet, roles: ['ROLE_ADMIN'] },
    { id: 'audit-logs', label: 'System Audit Logs', icon: ShieldAlert, roles: ['ROLE_ADMIN'] },
    {
      id: 'system-health',
      label: 'System Diagnostics',
      icon: Activity,
      roles: ['ROLE_ADMIN', 'ROLE_OVERALL_COORDINATOR', 'ROLE_SECTION_COORDINATOR'],
    },

    // Profile & CV Skills (Modules 3 & 4)
    { id: 'profile', label: 'Profile & Skills CV', icon: UserCheck, roles: ['*'] },
  ];

  const visibleItems = navItems.filter(
    (item) => item.roles.includes('*') || (role && item.roles.includes(role))
  );

  return (
    <aside className="w-64 border-r border-slate-200/90 bg-white/75 backdrop-blur-md p-4 flex flex-col justify-between shrink-0 shadow-2xs">
      <div className="space-y-1">
        <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">
          Navigation Menu
        </div>
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* AI Assistance Badge */}
      <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/60 to-blue-50/50 p-3.5 text-xs shadow-2xs">
        <div className="flex items-center gap-2 text-indigo-800 font-bold mb-1">
          <Sparkles className="h-4 w-4 text-indigo-600" />
          <span>AI Novelty Engine</span>
        </div>
        <p className="text-[11px] text-slate-600 leading-relaxed">
          Vector similarity checks & fuzzy Excel column reconciliation are active.
        </p>
      </div>
    </aside>
  );
};
