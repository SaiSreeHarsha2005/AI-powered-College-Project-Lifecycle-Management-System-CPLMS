import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { TeamDetailsDto } from '../types';
import {
  Users,
  UserPlus,
  Crown,
  CheckCircle2,
  RefreshCw,
  Send,
  Link,
  AlertCircle
} from 'lucide-react';

export const TeamPage: React.FC = () => {
  const { user } = useAuth();
  const [teamData, setTeamData] = useState<TeamDetailsDto | null>(null);
  const [loading, setLoading] = useState(true);

  // Modal / Form state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newWebhookUrl, setNewWebhookUrl] = useState('');

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Frontend & UI');

  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchTeam = async () => {
    setLoading(true);
    try {
      const res = await api.get('/teams/my-team');
      setTeamData(res.data);
    } catch (err) {
      console.error('Failed to load team details', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, [user]);

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;
    setIsProcessing(true);
    setError(null);
    try {
      await api.post('/teams', {
        name: newTeamName.trim(),
        discordWebhookUrl: newWebhookUrl.trim(),
      });
      setMessage('Team created successfully! You are the designated Team Leader.');
      setShowCreateModal(false);
      fetchTeam();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setIsProcessing(true);
    setError(null);
    try {
      await api.post('/teams/invite', {
        email: inviteEmail.trim(),
        role: inviteRole,
      });
      setMessage(`Invitation dispatched to ${inviteEmail} via Institutional Email & Discord!`);
      setShowInviteModal(false);
      setInviteEmail('');
      fetchTeam();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRespondInvite = async (inviteId: string, accept: boolean) => {
    setIsProcessing(true);
    setError(null);
    try {
      await api.post(`/teams/invites/${inviteId}/respond`, { accept });
      setMessage(accept ? 'Invitation accepted! Welcome to the team.' : 'Invitation declined.');
      fetchTeam();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const isLeader = user?.teamLead || teamData?.team?.leaderEmail === user?.email;

  if (loading) {
    return (
      <div className="py-20 text-center">
        <RefreshCw className="h-6 w-6 animate-spin text-indigo-600 mx-auto mb-2" />
        <p className="text-xs text-slate-500 font-semibold">Loading team details from database...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              Phase 2 Team Formation
            </span>
            <span className="text-xs text-slate-500">FR-4.1 to FR-4.6</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Team Formation & Member Allocation
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Form your capstone project team, invite peers by institutional email, assign module roles, and configure multi-channel notifications.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!teamData?.team && user?.role === 'ROLE_STUDENT' && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
            >
              <Users className="h-4 w-4" />
              <span>Create New Team</span>
            </button>
          )}
          {teamData?.team && isLeader && teamData.members.length < 4 && (
            <button
              onClick={() => setShowInviteModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
            >
              <UserPlus className="h-4 w-4" />
              <span>Invite Team Member</span>
            </button>
          )}
        </div>
      </div>

      {message && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>{message}</span>
          </div>
          <button onClick={() => setMessage(null)} className="text-emerald-700 hover:text-emerald-900">Dismiss</button>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-bold flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-rose-600" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-rose-700 hover:text-rose-900">Dismiss</button>
        </div>
      )}

      {/* Pending Invitations For Me */}
      {teamData?.pendingInvitesForMe && teamData.pendingInvitesForMe.length > 0 && (
        <div className="rounded-3xl border border-indigo-200 bg-indigo-50/60 p-6 shadow-xs backdrop-blur-xl">
          <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-900 mb-3 flex items-center gap-1.5">
            <Users className="h-4 w-4 text-indigo-600" />
            <span>Pending Team Invitations ({teamData.pendingInvitesForMe.length})</span>
          </h3>
          <div className="space-y-2">
            {teamData.pendingInvitesForMe.map((inv) => (
              <div
                key={inv.id}
                className="p-4 rounded-2xl bg-white border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
              >
                <div>
                  <span className="font-bold text-slate-900 text-xs">Invitation to join Project Team</span>
                  <p className="text-[11px] text-slate-500">Designated Role: <strong className="text-indigo-700">{inv.claimedRole}</strong></p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    disabled={isProcessing}
                    onClick={() => handleRespondInvite(inv.id, true)}
                    className="px-4 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Accept</span>
                  </button>
                  <button
                    disabled={isProcessing}
                    onClick={() => handleRespondInvite(inv.id, false)}
                    className="px-4 py-1.5 rounded-xl text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 cursor-pointer"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Team Details & Roster */}
      {!teamData?.team ? (
        <div className="rounded-3xl border border-slate-200 bg-white/80 p-12 text-center shadow-xs">
          <Users className="h-10 w-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-800">You are not part of an active team yet</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Create a team to become the designated Team Leader, or wait for an invitation from your peers.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-4 px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition-all cursor-pointer"
          >
            Create Team Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Team Info Card (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="rounded-3xl border border-slate-200/90 bg-white/90 p-6 shadow-xs backdrop-blur-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">Active Team</span>
                  <h3 className="text-base font-extrabold text-slate-900">{teamData.team.name}</h3>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {teamData.team.status}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Team Leader:</span>
                  <span className="font-bold text-slate-800">{teamData.team.leaderName || teamData.team.leaderEmail}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Section:</span>
                  <span className="font-bold text-slate-800">{teamData.team.section}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Academic Term:</span>
                  <span className="font-semibold text-slate-700">{teamData.team.academicTerm}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500">Team Size:</span>
                  <span className="font-bold text-indigo-700">{teamData.members.length} / 4 Members</span>
                </div>
              </div>

              {/* Discord Webhook Info */}
              <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-1.5">
                <div className="flex items-center justify-between text-purple-900 font-bold text-xs">
                  <span className="flex items-center gap-1.5">
                    <Link className="h-3.5 w-3.5 text-purple-700" />
                    <span>Discord Channel Webhook</span>
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                    {teamData.team.discordWebhookUrl ? 'Connected' : 'Not Set'}
                  </span>
                </div>
                <p className="text-[11px] text-purple-800/80 leading-relaxed font-mono truncate">
                  {teamData.team.discordWebhookUrl || 'No webhook attached. Updates sent via Email only.'}
                </p>
              </div>
            </div>
          </div>

          {/* Members Roster (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="rounded-3xl border border-slate-200/90 bg-white/90 p-6 shadow-xs backdrop-blur-xl">
              <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Team Members Roster</h3>
                  <p className="text-xs text-slate-500">Enforces two-level contribution & task distribution</p>
                </div>
                <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                  {teamData.members.length} Total
                </span>
              </div>

              <div className="space-y-3">
                {teamData.members.map((m) => (
                  <div
                    key={m.id}
                    className="p-4 rounded-2xl border border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center font-bold text-indigo-700 text-xs">
                        {m.fullName.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
                          <span>{m.fullName}</span>
                          {m.userEmail === teamData.team?.leaderEmail && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-0.5">
                              <Crown className="h-2.5 w-2.5 text-indigo-600" />
                              Leader
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-500">{m.userEmail} • {m.rollNumber || '21CSXXX'}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-center">
                      <span className="px-3 py-1 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                        {m.claimedRole || 'Developer'}
                      </span>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        m.inviteStatus === 'ACCEPTED'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {m.inviteStatus}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Create Team */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Create Academic Project Team</h3>
            <form onSubmit={handleCreateTeam} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Team Name</label>
                <input
                  type="text"
                  required
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  placeholder="e.g. Team NeuralWorks"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Discord Webhook URL (Optional)</label>
                <input
                  type="url"
                  value={newWebhookUrl}
                  onChange={(e) => setNewWebhookUrl(e.target.value)}
                  placeholder="https://discord.com/api/webhooks/..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md"
                >
                  {isProcessing ? 'Creating...' : 'Create Team'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Invite Member */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Invite Student to Team</h3>
            <form onSubmit={handleInviteMember} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Student Institutional Email</label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="student@gcet.edu.in"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Designated Role in Project</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                >
                  <option value="Frontend & UI">Frontend & UI Design</option>
                  <option value="Backend & APIs">Backend & REST APIs</option>
                  <option value="AI / ML Engineering">AI / ML Pipeline</option>
                  <option value="Database & Cloud">Database & Cloud DevOps</option>
                  <option value="Research & Documentation">Research & Documentation</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md flex items-center gap-1.5"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Send Dual-Channel Invite</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
