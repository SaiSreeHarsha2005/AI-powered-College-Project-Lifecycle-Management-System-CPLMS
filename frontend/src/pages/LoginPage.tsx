import React, { useState } from 'react';
import { useAuth, PRESET_ROLES } from '../context/AuthContext';
import { Sparkles, ArrowRight, ShieldCheck, Lock, Mail, AlertCircle, Crown } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, quickLogin, ssoLogin, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Institutional SSO State
  const [showSsoModal, setShowSsoModal] = useState(false);
  const [ssoProvider, setSsoProvider] = useState<'MICROSOFT' | 'GOOGLE'>('MICROSOFT');
  const [ssoEmail, setSsoEmail] = useState('saisa.student@gcet.edu.in');

  const handleOpenSso = (provider: 'MICROSOFT' | 'GOOGLE') => {
    setSsoProvider(provider);
    setShowSsoModal(true);
  };

  const handleConfirmSsoLogin = async () => {
    if (!ssoEmail.trim()) return;
    setError(null);
    try {
      await ssoLogin(ssoProvider, ssoEmail.trim());
      setShowSsoModal(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Institutional SSO authentication failed.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid institutional credentials or server unreachable.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100/90 to-indigo-50/50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden selection:bg-indigo-600 selection:text-white">
      {/* Subtle background ambient circles */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-600 shadow-xl shadow-indigo-600/20 mb-3">
          <Sparkles className="h-7 w-7 text-white" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          CPLMS Academic Portal
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-600">
          College Project Lifecycle Management & Governance System
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl px-4 sm:px-0 z-10">
        {/* Main Card */}
        <div className="bg-white/85 border border-slate-200/90 backdrop-blur-xl py-8 px-6 sm:px-10 shadow-xl shadow-slate-200/60 rounded-3xl">
          {error && (
            <div className="mb-5 flex items-center gap-3 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Institutional Email</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 pl-3.5 flex items-center">
                  <Mail className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@gcet.edu.in"
                  className="block w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl bg-slate-50/80 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all shadow-2xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 pl-3.5 flex items-center">
                  <Lock className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl bg-slate-50/80 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all shadow-2xs"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 transition-all shadow-md shadow-indigo-600/20 disabled:opacity-50 cursor-pointer"
            >
              <span>{loading ? 'Verifying Credentials...' : 'Sign In with Institutional ID'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Institutional Single Sign-On (Microsoft 365 & Google Workspace) */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white/95 px-3 text-[10px] font-bold tracking-wider text-slate-500 rounded-full border border-slate-200">
                Institutional Single Sign-On (SSO)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            {/* Microsoft 365 / Outlook Button (College Standard) */}
            <button
              type="button"
              onClick={() => handleOpenSso('MICROSOFT')}
              disabled={loading}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl border border-slate-300/80 bg-white hover:bg-blue-50/40 hover:border-blue-400 text-xs font-bold text-slate-800 transition-all shadow-xs cursor-pointer group"
            >
              {/* Microsoft 4-square Logo */}
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 21 21">
                <rect x="1" y="1" width="9" height="9" fill="#f25022" />
                <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
                <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
                <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
              </svg>
              <span className="truncate">Sign in with Microsoft 365 / Outlook</span>
              <span className="ml-auto text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200 shrink-0">
                College Standard
              </span>
            </button>

            {/* Google Workspace Button */}
            <button
              type="button"
              onClick={() => handleOpenSso('GOOGLE')}
              disabled={loading}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl border border-slate-300/80 bg-white hover:bg-slate-50 hover:border-slate-400 text-xs font-bold text-slate-800 transition-all shadow-xs cursor-pointer group"
            >
              {/* Google G Logo */}
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span className="truncate">Sign in with Google Workspace</span>
              <span className="ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 shrink-0">
                Google ID
              </span>
            </button>
          </div>

          {/* 1-Click Role Switcher Grid */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <div className="flex items-center gap-2 mb-2 text-xs font-bold text-slate-800">
              <ShieldCheck className="h-4 w-4 text-indigo-600" />
              <span>1-Click Role Switcher (Immediate Evaluation)</span>
            </div>
            <p className="text-[11px] text-slate-500 mb-3">
              Click any actor role below to automatically authenticate with pre-seeded accounts:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {PRESET_ROLES.map((preset) => (
                <button
                  key={preset.email}
                  type="button"
                  onClick={() => quickLogin(preset.email)}
                  className="text-left p-3 rounded-2xl border border-slate-200/80 bg-slate-50/60 hover:bg-white hover:border-indigo-300 hover:shadow-md hover:shadow-indigo-500/5 transition-all group flex flex-col justify-between cursor-pointer"
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-bold text-slate-800 group-hover:text-indigo-700 flex items-center gap-1">
                      {preset.isTeamLead && <Crown className="h-3 w-3 text-indigo-600" />}
                      <span>{preset.title}</span>
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${preset.badgeColor}`}>
                      {preset.role.replace('ROLE_', '')}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 mt-1 line-clamp-1">{preset.email}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Interactive Institutional SSO Modal */}
        {showSsoModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-2xl ${ssoProvider === 'MICROSOFT' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-800'}`}>
                    {ssoProvider === 'MICROSOFT' ? (
                      <svg className="h-5 w-5" viewBox="0 0 21 21">
                        <rect x="1" y="1" width="9" height="9" fill="#f25022" />
                        <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
                        <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
                        <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      {ssoProvider === 'MICROSOFT' ? 'Microsoft 365 (Outlook / Entra ID)' : 'Google Workspace Identity'}
                    </h3>
                    <p className="text-[11px] text-slate-500">Institutional Single Sign-On Gateway</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSsoModal(false)}
                  className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-all cursor-pointer"
                >
                  &times;
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Institutional Email Address
                  </label>
                  <input
                    type="email"
                    value={ssoEmail}
                    onChange={(e) => setSsoEmail(e.target.value)}
                    placeholder="saisa.student@gcet.edu.in"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-hidden transition-all shadow-2xs font-mono"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    Supports any institutional domain (e.g. <code>@gcet.edu.in</code>).
                  </p>
                </div>

                {/* Quick Selection for Demonstration & Pilot */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-bold text-slate-600 block">
                    Quick University Pilot Identities:
                  </span>
                  <div className="grid grid-cols-1 gap-1.5">
                    {[
                      { label: 'Student (Team Lead)', email: 'student.lead@gcet.edu.in', role: 'Student Lead' },
                      { label: 'Student (Team Member)', email: 'student.member@gcet.edu.in', role: 'Student Member' },
                      { label: 'Faculty Guide / Mentor', email: 'internalguide@gcet.edu.in', role: 'Guide' },
                      { label: 'Project Coordinator', email: 'coordinator@gcet.edu.in', role: 'Coordinator' },
                      { label: 'Panel Evaluator', email: 'panel.member@gcet.edu.in', role: 'Panelist' },
                    ].map((item) => (
                      <button
                        key={item.email}
                        type="button"
                        onClick={() => setSsoEmail(item.email)}
                        className="flex items-center justify-between px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 text-left text-xs transition-all cursor-pointer"
                      >
                        <span className="font-semibold text-slate-700">{item.label}</span>
                        <span className="text-[10px] font-mono text-slate-500">{item.email}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-[11px] text-indigo-900 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-indigo-600" />
                    <span>JIT Auto-Provisioning Active</span>
                  </div>
                  <p className="text-slate-600 leading-snug">
                    New institutional accounts are automatically provisioned with verified credentials and logged in the system audit trail.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowSsoModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmSsoLogin}
                    disabled={loading || !ssoEmail.trim()}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
                  >
                    {loading ? (
                      <div className="h-4 w-4 border-2 border-white border-t-transparent animate-spin rounded-full" />
                    ) : (
                      <ArrowRight className="h-4 w-4" />
                    )}
                    <span>Authorize & Sign In</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <p className="mt-6 text-center text-[11px] text-slate-500">
          Enforces server-side RBAC with Spring Security 6 & JWT • Light Institutional Edition
        </p>
      </div>
    </div>
  );
};
