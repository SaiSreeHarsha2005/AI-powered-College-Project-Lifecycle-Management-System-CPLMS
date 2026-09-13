import React, { useEffect, useState } from 'react';
import api, { aiApi } from '../services/api';
import type { User } from '../types';
import {
  User as UserIcon,
  Mail,
  Phone,
  Building,
  GraduationCap,
  Sparkles,
  Save,
  CheckCircle2,
  AlertCircle,
  Globe,
  Code,
  Briefcase
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form fields
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [skills, setSkills] = useState('');
  const [researchInterests, setResearchInterests] = useState('');
  const [experienceYears, setExperienceYears] = useState<number>(0);
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');

  // AI Resume Parser
  const [resumeText, setResumeText] = useState('');
  const [isExtractingSkills, setIsExtractingSkills] = useState(false);
  const [extractSummary, setExtractSummary] = useState<string | null>(null);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users/profile');
      const u: User = res.data;
      setProfile(u);
      setFullName(u.fullName || '');
      setPhone(u.phone || '');
      setSkills(u.skills || '');
      setResearchInterests(u.researchInterests || '');
      setExperienceYears(u.experienceYears || 0);
      setLinkedinUrl(u.linkedinUrl || '');
      setGithubUrl(u.githubUrl || '');
    } catch (err: any) {
      console.error('Failed to load profile', err);
      setError('Unable to load user profile details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaveSuccess(false);

    try {
      const payload = {
        fullName,
        phone,
        skills,
        researchInterests,
        experienceYears: Number(experienceYears),
        linkedinUrl,
        githubUrl,
      };

      const res = await api.put('/users/profile', payload);
      setProfile(res.data);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      console.error('Failed to update profile', err);
      setError('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleExtractAiSkills = async () => {
    if (!resumeText.trim()) {
      setError('Please paste your resume or CV text first to extract skills.');
      return;
    }

    setIsExtractingSkills(true);
    setError(null);
    try {
      const res = await aiApi.post('/api/ai/extract-resume-skills', {
        resume_text: resumeText,
      });

      const { skills: detectedSkills, research_areas, detected_experience_years, summary } = res.data;

      // Merge skills
      const currentSkillsList = skills ? skills.split(',').map((s) => s.trim()) : [];
      const newSkills = Array.from(new Set([...currentSkillsList, ...detectedSkills])).filter(Boolean);
      setSkills(newSkills.join(', '));

      // Merge research domains
      const currentInterests = researchInterests ? researchInterests.split(',').map((s) => s.trim()) : [];
      const newInterests = Array.from(new Set([...currentInterests, ...research_areas])).filter(Boolean);
      setResearchInterests(newInterests.join(', '));

      if (detected_experience_years > experienceYears) {
        setExperienceYears(detected_experience_years);
      }

      setExtractSummary(summary || 'Successfully extracted technical skills and research competencies.');
      setTimeout(() => setExtractSummary(null), 6000);
    } catch (err: any) {
      console.error('AI Skill extraction error', err);
      setError('AI extraction failed. Ensure the AI microservice is active on port 8000.');
    } finally {
      setIsExtractingSkills(false);
    }
  };

  const skillChips = skills
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const interestChips = researchInterests
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-slate-500 font-medium">
        <div className="h-6 w-6 border-2 border-indigo-600 border-t-transparent animate-spin rounded-full mr-3" />
        Loading profile details...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="h-20 w-20 rounded-2xl bg-indigo-600/30 border border-indigo-400/30 flex items-center justify-center text-3xl font-extrabold text-white shadow-inner">
              {profile?.fullName ? profile.fullName.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight">{profile?.fullName || 'User Profile'}</h1>
                <span className="rounded-full bg-indigo-500/20 border border-indigo-400/40 px-3 py-0.5 text-xs font-semibold text-indigo-300">
                  {profile?.role?.replace('ROLE_', '')}
                </span>
              </div>
              <p className="text-indigo-200 text-sm mt-1 flex items-center gap-2">
                <Mail className="h-3.5 w-3.5" />
                {profile?.email}
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 mt-2">
                {profile?.department && (
                  <span className="flex items-center gap-1.5">
                    <Building className="h-3.5 w-3.5 text-indigo-400" />
                    Dept: {profile.department}
                  </span>
                )}
                {profile?.section && (
                  <span className="flex items-center gap-1.5">
                    <GraduationCap className="h-3.5 w-3.5 text-indigo-400" />
                    Section: {profile.section}
                  </span>
                )}
                {profile?.rollNumber && (
                  <span className="flex items-center gap-1.5 font-mono">
                    ID: {profile.rollNumber}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setResumeText(
                  `Experience: 5 years in full-stack cloud applications.\nSkills: Python, FastAPI, React, PostgreSQL, Docker, PyTorch, Deep Learning.\nResearch: Distributed Systems, Edge AI, Applied Cryptography.`
                );
              }}
              className="rounded-xl border border-white/20 bg-white/10 hover:bg-white/15 px-4 py-2 text-xs font-semibold backdrop-blur-md transition-all text-white flex items-center gap-2"
            >
              <Sparkles className="h-3.5 w-3.5 text-indigo-300" />
              Sample CV Text
            </button>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {saveSuccess && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/90 p-4 text-emerald-800 flex items-center gap-3 text-sm shadow-xs">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <span>Profile and technical competencies updated successfully!</span>
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50/90 p-4 text-rose-800 flex items-center gap-3 text-sm shadow-xs">
          <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {extractSummary && (
        <div className="rounded-2xl border border-indigo-200 bg-indigo-50/90 p-4 text-indigo-800 flex items-center gap-3 text-sm shadow-xs">
          <Sparkles className="h-5 w-5 text-indigo-600 shrink-0" />
          <span>{extractSummary}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Profile Form */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSaveProfile} className="rounded-3xl border border-slate-200/80 bg-white p-6 md:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Personal & Academic Profile</h2>
                <p className="text-xs text-slate-500">Keep your technical expertise and contact links up to date</p>
              </div>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-600/20 transition-all disabled:opacity-50 cursor-pointer"
              >
                {saving ? (
                  <div className="h-4 w-4 border-2 border-white border-t-transparent animate-spin rounded-full" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save Changes
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2.5 text-xs font-medium text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-hidden transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Phone / Contact
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 9876543210"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2.5 text-xs font-medium text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-hidden transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Years of Experience
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2.5 text-xs font-medium text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-hidden transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Institutional Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    value={profile?.email || ''}
                    disabled
                    className="w-full rounded-xl border border-slate-200 bg-slate-100 pl-10 pr-4 py-2.5 text-xs font-medium text-slate-500 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  LinkedIn Profile
                </label>
                <div className="relative">
                  <Globe className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="url"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    placeholder="https://linkedin.com/in/username"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2.5 text-xs font-medium text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-hidden transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  GitHub Profile
                </label>
                <div className="relative">
                  <Code className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="url"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    placeholder="https://github.com/username"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2.5 text-xs font-medium text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-hidden transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Skills Tags Input */}
            <div className="pt-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Technical Skills (Comma Separated)
              </label>
              <textarea
                rows={2}
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="Python, React, FastAPI, PostgreSQL, PyTorch, Docker..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-xs font-medium text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-hidden transition-all"
              />
              {skillChips.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {skillChips.map((chip, idx) => (
                    <span
                      key={idx}
                      className="rounded-lg bg-indigo-50 border border-indigo-100 px-2.5 py-1 text-[11px] font-semibold text-indigo-700"
                    >
                      {chip}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Research Domains Input */}
            <div className="pt-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Research Domains & Specializations (Comma Separated)
              </label>
              <textarea
                rows={2}
                value={researchInterests}
                onChange={(e) => setResearchInterests(e.target.value)}
                placeholder="Edge AI, Distributed Systems, Computer Vision, Cloud Governance..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-xs font-medium text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-hidden transition-all"
              />
              {interestChips.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {interestChips.map((chip, idx) => (
                    <span
                      key={idx}
                      className="rounded-lg bg-emerald-50 border border-emerald-100 px-2.5 py-1 text-[11px] font-semibold text-emerald-700"
                    >
                      {chip}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Right Col: AI Resume Skill Extractor */}
        <div className="space-y-6">
          <div className="rounded-3xl border border-indigo-100 bg-gradient-to-b from-indigo-50/70 via-white to-white p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 text-indigo-900 font-bold">
              <div className="rounded-xl bg-indigo-600 p-2 text-white">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold">AI Resume / CV Parser</h3>
                <p className="text-[11px] text-indigo-700 font-normal">Modules 3 & 4 (FR-3.1 - FR-3.3)</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Paste your resume or curriculum vitae text below. The AI extraction pipeline will identify technical competencies, research domains, and experience benchmarks to populate your profile.
            </p>

            <textarea
              rows={8}
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste CV / Resume content here..."
              className="w-full rounded-2xl border border-slate-200 bg-white p-3.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-hidden shadow-inner font-mono text-[11px]"
            />

            <button
              onClick={handleExtractAiSkills}
              disabled={isExtractingSkills || !resumeText.trim()}
              className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 px-4 py-3 text-xs font-bold text-white shadow-md shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isExtractingSkills ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent animate-spin rounded-full" />
                  <span>Extracting Competencies...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Extract & Auto-Fill Skills</span>
                </>
              )}
            </button>

            <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 text-[11px] text-slate-600 space-y-1">
              <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-indigo-600" />
                <span>Automated Capability Mapping:</span>
              </div>
              <p>
                Profiles enriched with skills and research domains automatically empower the Workload Balancer's AI Guide Recommendation Engine.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
