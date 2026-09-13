import React, { useEffect, useState } from 'react';
import { useAuth, PRESET_ROLES } from '../context/AuthContext';
import { ShieldCheck, LogOut, ChevronDown, UserCircle2, Sparkles, Building2, Crown, Sun, Moon } from 'lucide-react';

import { NotificationCenter } from './NotificationCenter';
import { AiAssistantModal } from './AiAssistantModal';
import defaultInstitutionConfig from '../config/institution';

export const Navbar: React.FC = () => {
  const { user, logout, quickLogin } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);
  const enableDemoPersonas = import.meta.env.VITE_ENABLE_DEMO_PERSONAS !== 'false';

  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || document.documentElement.classList.contains('dark');
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  // Match active user to preset
  const currentRoleInfo = PRESET_ROLES.find((r) => {
    if (r.role !== user?.role) return false;
    if (user?.role === 'ROLE_STUDENT') {
      return r.isTeamLead === user?.teamLead;
    }
    return true;
  });

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/90 dark:border-slate-800 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md shadow-xs">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Brand & Logo */}
        <div className="flex items-center gap-3">
          <img 
            src={defaultInstitutionConfig.logoUrl} 
            alt={`${defaultInstitutionConfig.acronym} Logo`} 
            className="h-10 w-10 object-contain rounded-xl p-0.5 bg-white border border-slate-200/90 dark:border-slate-700 shadow-xs" 
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-tight text-slate-900 dark:text-white sm:text-lg">CPLMS</span>
              <span className="rounded bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 text-xs font-semibold text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                {defaultInstitutionConfig.acronym}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">{defaultInstitutionConfig.tagline}</p>
          </div>
        </div>

        {/* Center / Section & Department Info */}
        <div className="hidden lg:flex items-center gap-2.5">
          {user?.department && (
            <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 bg-slate-100/70 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-full">
              <Building2 className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
              <span>{user.department}</span>
            </div>
          )}
          {user?.section && (
            <span className="text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 px-2.5 py-1 rounded-full">
              {user.section}
            </span>
          )}
          {user?.role === 'ROLE_STUDENT' && (
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 border ${
              user.teamLead
                ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
            }`}>
              {user.teamLead && <Crown className="h-3 w-3 text-indigo-600 dark:text-indigo-400" />}
              {user.teamLead ? 'Team Lead' : 'Team Member'}
            </span>
          )}
        </div>

        {/* Right side: Role Switcher & User Actions */}
        <div className="flex items-center gap-3">
          {/* Quick Role Switcher - only rendered when enableDemoPersonas is true */}
          {enableDemoPersonas && (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className={`flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-medium transition-all shadow-2xs ${
                  currentRoleInfo ? currentRoleInfo.badgeColor : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200'
                }`}
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                <span className="font-semibold">{currentRoleInfo?.title || user?.role}</span>
                <ChevronDown className="h-3 w-3 opacity-60" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 origin-top-right rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 shadow-xl backdrop-blur-xl z-50">
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300">
                    Switch Active Role (Evaluation Demo)
                  </div>
                  <div className="mt-1 space-y-1">
                    {PRESET_ROLES.map((roleItem) => {
                      const isSelected =
                        user?.role === roleItem.role &&
                        (roleItem.role !== 'ROLE_STUDENT' || roleItem.isTeamLead === user?.teamLead);

                      return (
                        <button
                          key={roleItem.email}
                          onClick={() => {
                            setDropdownOpen(false);
                            quickLogin(roleItem.email);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-colors flex flex-col ${
                            isSelected
                              ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 font-semibold border border-indigo-200 dark:border-indigo-800'
                              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                          }`}
                        >
                          <span className="flex items-center justify-between">
                            <span className="flex items-center gap-1.5">
                              {roleItem.isTeamLead && <Crown className="h-3 w-3 text-indigo-600 dark:text-indigo-400" />}
                              <span>{roleItem.title}</span>
                            </span>
                            {isSelected && (
                              <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400"></span>
                            )}
                          </span>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-normal mt-0.5">{roleItem.desc}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Quick AI Assistant Trigger */}
          <button
            onClick={() => setAiAssistantOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-xs font-bold text-indigo-700 dark:text-indigo-300 transition shadow-2xs cursor-pointer"
            title="Open AI Engineering Assistant"
          >
            <Sparkles className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
            <span className="hidden md:inline">AI Assistant</span>
          </button>

          {/* Obsidian Dark Mode Switcher */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-600 dark:text-amber-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer shadow-2xs"
            title={isDark ? "Switch to Day Mode" : "Switch to Obsidian Dark Mode"}
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {/* Discord/Email Multi-Channel Notification Center */}
          <NotificationCenter />

          {/* User Profile & Logout */}
          <div className="flex items-center gap-3 border-l border-slate-200 dark:border-slate-800 pl-3">
            <div className="hidden md:flex flex-col text-right">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{user?.fullName}</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">{user?.email}</span>
            </div>
            <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300">
              <UserCircle2 className="h-5 w-5 text-slate-500 dark:text-slate-400" />
            </div>
            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
      <AiAssistantModal
        isOpen={aiAssistantOpen}
        onClose={() => setAiAssistantOpen(false)}
      />
    </header>
  );
};
