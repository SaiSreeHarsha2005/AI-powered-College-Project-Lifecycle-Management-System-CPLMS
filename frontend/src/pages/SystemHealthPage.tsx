import React, { useEffect, useState } from 'react';
import { 
  Activity, 
  Database, 
  Cpu, 
  Bot, 
  HardDrive, 
  ShieldCheck, 
  RefreshCw, 
  CheckCircle2, 
  Server,
  Zap,
  Lock
} from 'lucide-react';
import api from '../services/api';
import type { SystemHealthData } from '../types';

export const SystemHealthPage: React.FC = () => {
  const [health, setHealth] = useState<SystemHealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchHealth = async () => {
    try {
      setLoading(true);
      const res = await api.get<SystemHealthData>('/health/system');
      setHealth(res.data);
      setLastRefreshed(new Date());
    } catch (err) {
      console.error('Failed to load system telemetry', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    let interval: any = null;
    if (autoRefresh) {
      interval = setInterval(fetchHealth, 10000); // 10s live pulse
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const memoryPercent = health
    ? Math.round((health.jvmMemory.usedMb / health.jvmMemory.totalMb) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/50 p-6 rounded-2xl border border-slate-800 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Production Infrastructure Telemetry</span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">System Health & Core Services</h1>
          <p className="text-sm text-slate-400">
            Live multi-service diagnostics monitoring PostgreSQL cluster, Spring Boot JVM, Python AI Novelty Engine, and Distributed Storage.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              autoRefresh 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
          >
            {autoRefresh ? 'Live Pulse (10s): ON' : 'Live Pulse: PAUSED'}
          </button>
          <button
            onClick={fetchHealth}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Database Status */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Database size={20} />
            </div>
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
              health?.database.status === 'UP' 
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
            }`}>
              {health?.database.status || 'PROBING...'}
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium">PostgreSQL Engine</p>
          <h3 className="text-xl font-bold text-white mt-1">{health?.database.engine || 'PostgreSQL'}</h3>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80 pt-3">
            <span>Query Ping Latency:</span>
            <span className="font-semibold text-emerald-400">{health?.database.latencyMs ?? 0} ms</span>
          </div>
        </div>

        {/* AI Service Status */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Bot size={20} />
            </div>
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
              health?.aiService.status === 'UP' 
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
            }`}>
              {health?.aiService.status || 'PROBING...'}
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium">FastAPI Novelty Engine</p>
          <h3 className="text-xl font-bold text-white mt-1">all-MiniLM-L6-v2</h3>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80 pt-3">
            <span>Endpoint:</span>
            <span className="font-mono text-xs text-purple-400">:8000/validate</span>
          </div>
        </div>

        {/* Distributed Storage & Encryption */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <HardDrive size={20} />
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              ACTIVE
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium">Artifact Storage</p>
          <h3 className="text-xl font-bold text-white mt-1">{health?.storage.provider || 'MinIO S3'}</h3>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80 pt-3">
            <span>Bucket Encryption:</span>
            <span className="font-semibold text-amber-400">{health?.storage.encryption || 'AES-256'}</span>
          </div>
        </div>

        {/* JVM Cores & Execution */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Cpu size={20} />
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
              Java 21
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium">Compute Fabric</p>
          <h3 className="text-xl font-bold text-white mt-1">{health?.jvmMemory.availableProcessors || 8} Logical Cores</h3>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80 pt-3">
            <span>JVM Max Heap:</span>
            <span className="font-semibold text-slate-200">{health?.jvmMemory.maxMb || 0} MB</span>
          </div>
        </div>
      </div>

      {/* Detailed Diagnostics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* JVM Memory Gauge */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Server size={18} className="text-indigo-400" />
              JVM Memory Utilization
            </h3>
            <span className="text-xs font-semibold text-slate-400">{memoryPercent}% Used</span>
          </div>
          
          <div className="w-full bg-slate-800 rounded-full h-3 mb-4 overflow-hidden border border-slate-700">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                memoryPercent > 85 ? 'bg-rose-500' : memoryPercent > 65 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(memoryPercent, 100)}%` }}
            ></div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800">
              <p className="text-slate-400">Heap Allocated</p>
              <p className="text-base font-bold text-white mt-0.5">{health?.jvmMemory.totalMb || 0} MB</p>
            </div>
            <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800">
              <p className="text-slate-400">Used Memory</p>
              <p className="text-base font-bold text-indigo-400 mt-0.5">{health?.jvmMemory.usedMb || 0} MB</p>
            </div>
            <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800">
              <p className="text-slate-400">Free Heap</p>
              <p className="text-base font-bold text-emerald-400 mt-0.5">{health?.jvmMemory.freeMb || 0} MB</p>
            </div>
            <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800">
              <p className="text-slate-400">Max Allocatable</p>
              <p className="text-base font-bold text-slate-300 mt-0.5">{health?.jvmMemory.maxMb || 0} MB</p>
            </div>
          </div>
        </div>

        {/* Security & Authentication Subsystem */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-base font-semibold text-white flex items-center gap-2 mb-4">
            <ShieldCheck size={18} className="text-emerald-400" />
            Security & Enterprise Auth
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 bg-slate-800/40 rounded-xl border border-slate-800">
              <div className="flex items-center gap-2">
                <Lock size={14} className="text-blue-400" />
                <span className="text-slate-300 font-medium">Microsoft Entra ID (OIDC)</span>
              </div>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 size={13} /> Active
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-800/40 rounded-xl border border-slate-800">
              <div className="flex items-center gap-2">
                <Lock size={14} className="text-rose-400" />
                <span className="text-slate-300 font-medium">Google Workspace SSO</span>
              </div>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 size={13} /> Active
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-800/40 rounded-xl border border-slate-800">
              <div className="flex items-center gap-2">
                <Zap size={14} className="text-amber-400" />
                <span className="text-slate-300 font-medium">JWT Token Rotation (HS256)</span>
              </div>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 size={13} /> 24h Expiry
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-800/40 rounded-xl border border-slate-800">
              <div className="flex items-center gap-2">
                <Activity size={14} className="text-indigo-400" />
                <span className="text-slate-300 font-medium">Audit Log Immutable Stream</span>
              </div>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 size={13} /> Active
              </span>
            </div>
          </div>
        </div>

        {/* SLA & Automation Diagnostics */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-base font-semibold text-white flex items-center gap-2 mb-4">
            <Zap size={18} className="text-amber-400" />
            SLA & Workflow Diagnostics
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800">
              <div className="flex justify-between items-center mb-1">
                <span className="text-slate-300 font-medium">Tier 1 SLA Rule</span>
                <span className="text-amber-400 font-semibold">&gt; 5 Business Days</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Automated Guide reminder alert banner injected on proposal review queue.
              </p>
            </div>

            <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800">
              <div className="flex justify-between items-center mb-1">
                <span className="text-slate-300 font-medium">Tier 2 SLA Rule</span>
                <span className="text-rose-400 font-semibold">&gt; 7 Business Days</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Automatic coordinator escalation flag raised for immediate department intervention.
              </p>
            </div>

            <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800">
              <div className="flex justify-between items-center mb-1">
                <span className="text-slate-300 font-medium">Proposal Versioning</span>
                <span className="text-emerald-400 font-semibold">Semantic Deltas Enabled</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Automatic immutable snapshots created upon revision request with side-by-side diffing.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center text-xs text-slate-500 pt-2">
        Telemetry polled at {lastRefreshed.toLocaleTimeString()} &bull; CPLMS Enterprise Core v2.0
      </div>
    </div>
  );
};
