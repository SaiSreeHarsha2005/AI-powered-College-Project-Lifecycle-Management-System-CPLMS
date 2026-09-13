import React, { useEffect, useState } from 'react';
import api from '../services/api';
import type { NotificationItem } from '../types';
import { Bell, Mail, Send, Sparkles, ExternalLink } from 'lucide-react';

export const NotificationCenter: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showDiscordModal, setShowDiscordModal] = useState(false);
  const [testWebhookUrl, setTestWebhookUrl] = useState('');
  const [testResult, setTestResult] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch (err) {
      console.error('Failed to load notifications', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const timer = setInterval(fetchNotifications, 15000);
    return () => clearInterval(timer);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAsRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendDiscordTest = async () => {
    if (!testWebhookUrl.trim()) return;
    setIsSending(true);
    setTestResult(null);
    try {
      const res = await api.post('/notifications/test-discord', {
        webhookUrl: testWebhookUrl.trim(),
        title: 'Academic Portal Notification Test',
        message: 'Hello from CPLMS! Dual-channel notification engine (Email + Discord Webhook) is actively operational.',
        type: 'SYSTEM',
      });
      if (res.data.success) {
        setTestResult('Success: Real message delivered to your Discord channel!');
        fetchNotifications();
      } else {
        setTestResult('Failed: Ensure Discord webhook URL is valid and starts with https://discord.com/api/webhooks/');
      }
    } catch (err: any) {
      setTestResult('Failed to dispatch: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer border border-slate-200/80 shadow-2xs bg-white"
        title="Notifications (Email & Discord)"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[9px] font-bold text-white shadow-sm">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 origin-top-right rounded-3xl border border-slate-200/90 bg-white p-3 shadow-xl backdrop-blur-xl z-50">
          <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100">
            <div>
              <h4 className="text-xs font-bold text-slate-900">Multi-Channel Alerts</h4>
              <p className="text-[10px] text-slate-500">Live Email & Discord Webhook Feed</p>
            </div>
            <button
              onClick={() => setShowDiscordModal(true)}
              className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>Test Discord</span>
              <ExternalLink className="h-3 w-3" />
            </button>
          </div>

          <div className="mt-2 max-h-80 overflow-y-auto space-y-2">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No notifications received yet.
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleMarkAsRead(n.id)}
                  className={`p-3 rounded-2xl border text-xs transition-all cursor-pointer ${
                    n.read
                      ? 'bg-slate-50/50 border-slate-200/60 opacity-80'
                      : 'bg-white border-indigo-200 shadow-2xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
                      {n.type === 'DUPLICATION_ALERT' ? (
                        <span className="h-2 w-2 rounded-full bg-rose-500 shrink-0" />
                      ) : n.type === 'GUIDE_APPROVE' ? (
                        <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                      ) : (
                        <span className="h-2 w-2 rounded-full bg-indigo-500 shrink-0" />
                      )}
                      <span className="line-clamp-1">{n.title}</span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 text-[9px] font-semibold border border-blue-200">
                        <Mail className="h-2.5 w-2.5 inline mr-0.5" />
                        Email
                      </span>
                      {n.discordWebhookUrl && (
                        <span className="px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 text-[9px] font-semibold border border-purple-200">
                          Discord
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                    {n.message}
                  </p>
                  <span className="text-[9px] text-slate-400 mt-1 block">
                    {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Discord Test Modal */}
      {showDiscordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Live Discord Webhook Dispatch</h3>
                  <p className="text-[11px] text-slate-500">Test multi-channel notifications in your server</p>
                </div>
              </div>
              <button
                onClick={() => setShowDiscordModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Discord Channel Webhook URL
              </label>
              <input
                type="url"
                value={testWebhookUrl}
                onChange={(e) => setTestWebhookUrl(e.target.value)}
                placeholder="https://discord.com/api/webhooks/..."
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all shadow-2xs font-mono"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Obtained from Discord: Server Settings ➔ Integrations ➔ Webhooks ➔ Copy Webhook URL.
              </p>
            </div>

            {testResult && (
              <div className={`p-3 rounded-2xl text-xs font-semibold ${
                testResult.startsWith('Success')
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}>
                {testResult}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowDiscordModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSendDiscordTest}
                disabled={isSending || !testWebhookUrl.trim()}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Send className="h-3.5 w-3.5" />
                <span>{isSending ? 'Sending Webhook...' : 'Send Live Notification'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
