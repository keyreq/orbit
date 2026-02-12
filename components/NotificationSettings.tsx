import React, { useState, useEffect } from 'react';
import { Bell, Mail, Phone, MessageSquare, Send, Check, X, Loader2 } from 'lucide-react';
import { NotificationType } from '../types';

interface NotificationSettings {
  email?: string;
  phoneNumber?: string;
  telegramChatId?: string;
  slackWebhookUrl?: string;
  channels: NotificationType[];
}

interface TestResult {
  channel: string;
  success: boolean;
  error?: string;
}

export const NotificationSettings: React.FC = () => {
  const [settings, setSettings] = useState<NotificationSettings>({
    channels: ['in-app'],
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, TestResult>>({});
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/preferences');
      const data = await response.json();
      if (data.success) {
        setSettings(data.data);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      setMessage(null);

      const response = await fetch('/api/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: 'Settings saved successfully!' });
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to save settings' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  const testChannel = async (channel: string) => {
    try {
      setTesting(channel);
      setTestResults({ ...testResults, [channel]: { channel, success: false } });

      const response = await fetch('/api/notifications/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ channel }),
      });

      const data = await response.json();

      setTestResults({
        ...testResults,
        [channel]: {
          channel,
          success: data.success,
          error: data.result?.error,
        },
      });
    } catch (error) {
      setTestResults({
        ...testResults,
        [channel]: {
          channel,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });
    } finally {
      setTesting(null);
    }
  };

  const toggleChannel = (channel: NotificationType) => {
    setSettings((prev) => {
      const channels = prev.channels.includes(channel)
        ? prev.channels.filter((c) => c !== channel)
        : [...prev.channels, channel];
      return { ...prev, channels };
    });
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center">
        <Loader2 className="w-8 h-8 text-orbit-accent animate-spin mx-auto" />
        <p className="text-gray-400 mt-4">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-white">Notification Settings</h1>
        <p className="text-gray-400 text-sm mt-1">
          Configure how you want to receive price alerts
        </p>
      </header>

      {/* Success/Error Message */}
      {message && (
        <div
          className={`p-4 rounded-xl border ${
            message.type === 'success'
              ? 'bg-green-500/10 border-green-500/20 text-green-400'
              : 'bg-red-500/10 border-red-500/20 text-red-400'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Contact Information */}
      <div className="glass-panel rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-semibold text-white mb-4">Contact Information</h2>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Email Address (Optional)
          </label>
          <input
            type="email"
            value={settings.email || ''}
            onChange={(e) => setSettings({ ...settings, email: e.target.value })}
            placeholder="you@example.com"
            className="w-full px-4 py-3 bg-orbit-700 border border-orbit-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orbit-accent transition-colors"
          />
        </div>

        {/* Phone Number */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Phone Number (Optional)
          </label>
          <input
            type="tel"
            value={settings.phoneNumber || ''}
            onChange={(e) => setSettings({ ...settings, phoneNumber: e.target.value })}
            placeholder="+14155552671"
            className="w-full px-4 py-3 bg-orbit-700 border border-orbit-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orbit-accent transition-colors"
          />
          <p className="text-xs text-gray-500 mt-1">
            Use E.164 format: +[country code][number]
          </p>
        </div>

        {/* Telegram Chat ID */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Telegram Chat ID (Optional)
          </label>
          <input
            type="text"
            value={settings.telegramChatId || ''}
            onChange={(e) => setSettings({ ...settings, telegramChatId: e.target.value })}
            placeholder="123456789"
            className="w-full px-4 py-3 bg-orbit-700 border border-orbit-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orbit-accent transition-colors"
          />
          <p className="text-xs text-gray-500 mt-1">
            Get from @userinfobot on Telegram
          </p>
        </div>

        {/* Slack Webhook */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Slack Webhook URL (Optional)
          </label>
          <input
            type="url"
            value={settings.slackWebhookUrl || ''}
            onChange={(e) => setSettings({ ...settings, slackWebhookUrl: e.target.value })}
            placeholder="https://hooks.slack.com/services/..."
            className="w-full px-4 py-3 bg-orbit-700 border border-orbit-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orbit-accent transition-colors"
          />
        </div>

        {/* Save Contact Info Button */}
        <div className="pt-4 border-t border-orbit-600">
          <button
            onClick={saveSettings}
            disabled={saving}
            className="w-full px-6 py-3 bg-orbit-accent hover:bg-orbit-accent/80 text-white rounded-xl font-medium transition-colors shadow-lg shadow-orbit-accent/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Contact Information'
            )}
          </button>
        </div>
      </div>

      {/* Notification Channels */}
      <div className="glass-panel rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Active Channels</h2>

        <div className="space-y-3">
          {[
            {
              id: 'in-app' as NotificationType,
              label: 'In-App Notifications',
              icon: Bell,
              description: 'Browser notifications in ORBIT',
              canTest: true,
            },
            {
              id: 'email' as NotificationType,
              label: 'Email Alerts',
              icon: Mail,
              description: 'Email notifications',
              canTest: true,
              requiresField: 'email',
            },
            {
              id: 'sms' as NotificationType,
              label: 'SMS Messages',
              icon: MessageSquare,
              description: 'Text message alerts',
              canTest: true,
              requiresField: 'phoneNumber',
            },
            {
              id: 'phone' as NotificationType,
              label: 'Phone Calls',
              icon: Phone,
              description: 'Voice call alerts',
              canTest: true,
              requiresField: 'phoneNumber',
            },
            {
              id: 'telegram' as NotificationType,
              label: 'Telegram',
              icon: Send,
              description: 'Telegram bot messages',
              canTest: true,
              requiresField: 'telegramChatId',
            },
            {
              id: 'slack' as NotificationType,
              label: 'Slack',
              icon: MessageSquare,
              description: 'Slack channel messages',
              canTest: true,
              requiresField: 'slackWebhookUrl',
            },
          ].map((channel) => {
            const isEnabled = settings.channels.includes(channel.id);
            const isConfigured = !channel.requiresField || !!settings[channel.requiresField as keyof NotificationSettings];
            const testResult = testResults[channel.id];

            return (
              <div
                key={channel.id}
                className={`p-4 rounded-xl border-2 transition-all ${
                  isEnabled
                    ? 'border-orbit-accent bg-orbit-accent/10'
                    : 'border-orbit-600 bg-orbit-700/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    <channel.icon className="w-5 h-5 text-orbit-accent" />
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-white">{channel.label}</h3>
                      <p className="text-xs text-gray-400">{channel.description}</p>
                      {!isConfigured && (
                        <p className="text-xs text-yellow-400 mt-1">
                          ⚠️ Configure {channel.requiresField} above
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Test Button */}
                    {channel.canTest && isEnabled && isConfigured && (
                      <button
                        onClick={() => testChannel(channel.id)}
                        disabled={testing === channel.id}
                        className="px-3 py-1.5 text-xs bg-orbit-accent/20 hover:bg-orbit-accent/30 text-orbit-accent rounded-lg transition-colors disabled:opacity-50"
                      >
                        {testing === channel.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          'Test'
                        )}
                      </button>
                    )}

                    {/* Test Result */}
                    {testResult && (
                      <div title={testResult.error}>
                        {testResult.success ? (
                          <Check className="w-5 h-5 text-green-400" />
                        ) : (
                          <X className="w-5 h-5 text-red-400" />
                        )}
                      </div>
                    )}

                    {/* Toggle */}
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={isEnabled}
                        onChange={() => toggleChannel(channel.id)}
                      />
                      <div className="w-11 h-6 bg-orbit-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orbit-accent"></div>
                    </label>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex gap-3">
        <button
          onClick={saveSettings}
          disabled={saving}
          className="flex-1 px-6 py-3 bg-orbit-accent hover:bg-orbit-accent/80 text-white rounded-xl font-medium transition-colors shadow-lg shadow-orbit-accent/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {saving ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Settings'
          )}
        </button>
      </div>
    </div>
  );
};
