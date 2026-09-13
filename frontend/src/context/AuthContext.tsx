import React, { createContext, useContext, useState } from 'react';
import api from '../services/api';
import type { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  quickLogin: (email: string) => Promise<void>;
  ssoLogin: (
    provider: 'MICROSOFT' | 'GOOGLE',
    email: string,
    fullName?: string,
    department?: string,
    section?: string
  ) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export interface PresetRole {
  role: UserRole;
  title: string;
  email: string;
  desc: string;
  badgeColor: string;
  isTeamLead?: boolean;
}

export const PRESET_ROLES: PresetRole[] = [
  {
    role: 'ROLE_STUDENT',
    title: 'Student (Team Lead)',
    email: 'student.lead@gcet.edu.in',
    desc: 'Creates team, submits project idea, reviews member task contributions',
    badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    isTeamLead: true,
  },
  {
    role: 'ROLE_STUDENT',
    title: 'Student (Member)',
    email: 'student.member@gcet.edu.in',
    desc: 'Joins team, views team status, logs individual task contributions',
    badgeColor: 'bg-sky-50 text-sky-700 border-sky-200',
    isTeamLead: false,
  },
  {
    role: 'ROLE_INTERNAL_GUIDE',
    title: 'Internal Guide',
    email: 'internalguide@gcet.edu.in',
    desc: 'Direct mentor for assigned teams; rubric grading & recommendation',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  {
    role: 'ROLE_SECTION_COORDINATOR',
    title: 'Section-Wise Guide',
    email: 'sectionguide@gcet.edu.in',
    desc: 'Section-level coordination, monitoring all teams in assigned section',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  {
    role: 'ROLE_OVERALL_COORDINATOR',
    title: 'Overall Coordinator',
    email: 'coordinator@gcet.edu.in',
    desc: 'Department head of projects; guide allocation, capacity & escalations',
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
  },
  {
    role: 'ROLE_PANEL',
    title: 'Panel Reviewer',
    email: 'panel.member@gcet.edu.in',
    desc: 'Independent evaluation; blind/open rubric scoring & panel recommendation',
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  {
    role: 'ROLE_ADMIN',
    title: 'Administrator',
    email: 'admin@gcet.edu.in',
    desc: 'Central administrator; user management, bulk Excel import & audit logs',
    badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
  },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('cplms_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('cplms_token'));
  const [loading, setLoading] = useState<boolean>(false);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      const data = res.data;
      setToken(data.token);
      const userObj: User = {
        id: data.id,
        email: data.email,
        fullName: data.fullName,
        role: data.role,
        department: data.department,
        section: data.section,
        teamLead: data.teamLead,
        active: true,
      };
      setUser(userObj);
      localStorage.setItem('cplms_token', data.token);
      localStorage.setItem('cplms_user', JSON.stringify(userObj));
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = async (email: string) => {
    await login(email, 'password123');
  };

  const ssoLogin = async (
    provider: 'MICROSOFT' | 'GOOGLE',
    email: string,
    fullName?: string,
    department?: string,
    section?: string
  ) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/sso/institutional-login', {
        provider,
        email,
        fullName,
        department,
        section,
      });
      const data = res.data;
      setToken(data.token);
      const userObj: User = {
        id: data.id,
        email: data.email,
        fullName: data.fullName,
        role: data.role,
        department: data.department,
        section: data.section,
        teamLead: data.teamLead,
        active: true,
      };
      setUser(userObj);
      localStorage.setItem('cplms_token', data.token);
      localStorage.setItem('cplms_user', JSON.stringify(userObj));
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('cplms_token');
    localStorage.removeItem('cplms_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        login,
        quickLogin,
        ssoLogin,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
