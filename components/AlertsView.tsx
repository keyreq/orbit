import React, { useState, useEffect } from 'react';
import { Bell, Plus, Trash2, Edit2, Mail, MessageSquare, Phone, Send, Loader2 } from 'lucide-react';
import { Alert, NotificationType } from '../types';
import { CreateAlertView } from './CreateAlertView';
import { fetchAlerts, createAlert, updateAlert, deleteAlert as deleteAlertApi } from '@/lib/api/alerts';
import { useUserIdContext } from './UserIdProvider';

const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case 'in-app':
      return <Bell className="w-3 h-3" />;
    case 'email':
      return <Mail className="w-3 h-3" />;
    case 'sms':
      return <MessageSquare className="w-3 h-3" />;
    case 'phone':
      return <Phone className="w-3 h-3" />;
    case 'telegram':
      return <Send className="w-3 h-3" />;
    case 'slack':
      return <MessageSquare className="w-3 h-3" />;
    default:
      return <Bell className="w-3 h-3" />;
  }
};

const getNotificationLabel = (type: NotificationType) => {
  switch (type) {
    case 'in-app':
      return 'In-App';
    case 'email':
      return 'Email';
    case 'sms':
      return 'SMS';
    case 'phone':
      return 'Call';
    case 'telegram':
      return 'Telegram';
    case 'slack':
      return 'Slack';
    default:
      return type;
  }
};

export const AlertsView: React.FC = () => {
  const { userId, isLoading: userIdLoading } = useUserIdContext();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [editingAlert, setEditingAlert] = useState<Alert | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showQuickSetup, setShowQuickSetup] = useState(false);
  const [quickEmail, setQuickEmail] = useState('');
  const [quickPhone, setQuickPhone] = useState('');
  const [savingQuick, setSavingQuick] = useState(false);
  const [showCreatePage, setShowCreatePage] = useState(false);
  const [showEditPage, setShowEditPage] = useState(false);

  // Fetch alerts on component mount
  useEffect(() => {
    if (userId) {
      loadAlerts();
    }
  }, [userId]);

  const loadAlerts = async () => {
    if (!userId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await fetchAlerts(userId);
      setAlerts(data);
    } catch (err) {
      console.error('Failed to load alerts:', err);
      setError(err instanceof Error ? err.message : 'Failed to load alerts');
    } finally {
      setLoading(false);
    }
  };

  const toggleAlert = async (id: string) => {
    if (!userId) return;
    const alert = alerts.find(a => a.id === id);
    if (!alert) return;

    try {
      const updated = await updateAlert(userId, id, { active: !alert.active });
      setAlerts(alerts.map(a => a.id === id ? updated : a));
    } catch (err) {
      console.error('Failed to toggle alert:', err);
      window.alert(err instanceof Error ? err.message : 'Failed to toggle alert');
    }
  };

  const handleDeleteAlert = async (id: string) => {
    if (!userId) return;
    if (!confirm('Are you sure you want to delete this alert?')) {
      return;
    }

    try {
      await deleteAlertApi(userId, id);
      setAlerts(alerts.filter(a => a.id !== id));
    } catch (err) {
      console.error('Failed to delete alert:', err);
      window.alert(err instanceof Error ? err.message : 'Failed to delete alert');
    }
  };

  const openEditPage = (alert: Alert) => {
    setEditingAlert(alert);
    setShowEditPage(true);
  };

  const openCreateModal = () => {
    setShowCreatePage(true);
  };

  const handleCreateFromPage = async (alertData: {
    token: string;
    condition: 'above' | 'below';
    targetPrice: number;
    notifications: NotificationType[];
    active: boolean;
  }) => {
    if (!userId) return;
    const newAlert = await createAlert(userId, {
      token: alertData.token,
      condition: alertData.condition,
      targetPrice: alertData.targetPrice,
      notifications: alertData.notifications,
    });
    setAlerts([...alerts, newAlert]);
  };

  const saveQuickSetup = async () => {
    if (!userId) return;
    try {
      setSavingQuick(true);
      const response = await fetch('/api/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId,
        },
        body: JSON.stringify({
          email: quickEmail,
          phoneNumber: quickPhone,
          channels: ['in-app', 'email', 'sms']
        })
      });

      if (response.ok) {
        setShowQuickSetup(false);
        window.alert('Contact info saved! You can now receive notifications.');
      } else {
        window.alert('Failed to save contact info');
      }
    } catch (err) {
      window.alert('Error saving contact info');
    } finally {
      setSavingQuick(false);
    }
  };

  const handleEditFromPage = async (alertData: {
    token: string;
    condition: 'above' | 'below';
    targetPrice: number;
    notifications: NotificationType[];
    active: boolean;
  }) => {
    if (!userId || !editingAlert) return;

    const updated = await updateAlert(userId, editingAlert.id, {
      targetPrice: alertData.targetPrice,
      condition: alertData.condition,
      notifications: alertData.notifications,
      active: alertData.active,
    });
    setAlerts(alerts.map(a => a.id === editingAlert.id ? updated : a));
  };

  // Show create alert page if navigated to it
  if (showCreatePage) {
    return (
      <CreateAlertView
        onBack={() => setShowCreatePage(false)}
        onSave={handleCreateFromPage}
      />
    );
  }

  // Show edit alert page if navigated to it
  if (showEditPage && editingAlert) {
    return (
      <CreateAlertView
        onBack={() => {
          setShowEditPage(false);
          setEditingAlert(null);
        }}
        onSave={handleEditFromPage}
        editingAlert={editingAlert}
      />
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <header className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Price Alerts</h1>
        <button
          onClick={openCreateModal}
          disabled={loading}
          className="flex items-center px-4 py-2 bg-orbit-accent hover:bg-orbit-accent/80 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-orbit-accent/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Alert
        </button>
      </header>

      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
          <p className="text-sm">{error}</p>
          <button
            onClick={loadAlerts}
            className="mt-2 text-xs text-red-300 hover:text-white underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="glass-panel rounded-2xl p-12 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-orbit-accent animate-spin" />
          <span className="ml-3 text-gray-400">Loading alerts...</span>
        </div>
      )}

      {/* Alerts List */}
      {!loading && (
        <div className="glass-panel rounded-2xl overflow-hidden">
        <div className="divide-y divide-orbit-600">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="p-6 flex items-center justify-between hover:bg-orbit-700/30 transition-colors"
            >
              <div className="flex items-center space-x-4 flex-1">
                <div
                  className={`p-3 rounded-full ${
                    alert.active
                      ? 'bg-orbit-accent/10 text-orbit-accent'
                      : 'bg-gray-800 text-gray-500'
                  }`}
                >
                  <Bell className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white">{alert.token}</h3>
                    {!alert.active && (
                      <span className="px-2 py-0.5 text-xs bg-gray-800 text-gray-500 rounded">
                        Paused
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-400">
                    Trigger when price is
                    <span
                      className={
                        alert.condition === 'above' ? 'text-green-400' : 'text-red-400'
                      }
                    >
                      {' '}
                      {alert.condition}{' '}
                    </span>
                    ${alert.targetPrice.toLocaleString()}
                  </p>
                  <div className="flex gap-2 mt-2">
                    {alert.notifications.map((type) => (
                      <span
                        key={type}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-orbit-700 text-xs text-gray-300"
                        title={getNotificationLabel(type)}
                      >
                        {getNotificationIcon(type)}
                        {getNotificationLabel(type)}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={alert.active}
                    onChange={() => toggleAlert(alert.id)}
                  />
                  <div className="w-11 h-6 bg-orbit-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orbit-accent"></div>
                </label>
                <button
                  onClick={() => openEditPage(alert)}
                  className="p-2 text-gray-500 hover:text-orbit-accent transition-colors"
                  title="Edit alert"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDeleteAlert(alert.id)}
                  className="p-2 text-gray-500 hover:text-red-400 transition-colors"
                  title="Delete alert"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
        {alerts.length === 0 && !loading && (
          <div className="p-8 text-center text-gray-500">
            No active alerts. Create one to get started.
          </div>
        )}
        </div>
      )}

      {/* Quick Setup Panel */}
      <div className="p-5 rounded-xl bg-gradient-to-r from-orbit-accent/10 to-purple-500/10 border border-orbit-accent/20">
        {!showQuickSetup ? (
          <div className="flex items-start justify-between">
            <div>
              <h4 className="text-sm font-semibold text-white mb-1">📬 Set Up Notifications</h4>
              <p className="text-xs text-gray-400">
                Add your email & phone to receive SMS and email alerts
              </p>
            </div>
            <button
              onClick={() => setShowQuickSetup(true)}
              className="text-xs px-4 py-2 bg-orbit-accent hover:bg-orbit-accent/80 text-white rounded-lg transition-colors whitespace-nowrap"
            >
              Quick Setup
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white mb-3">Quick Notification Setup</h4>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Email Address</label>
              <input
                type="email"
                value={quickEmail}
                onChange={(e) => setQuickEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-3 py-2 bg-orbit-700 border border-orbit-600 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-orbit-accent"
              />
            </div>

            {/* Phone Number - DISABLED */}
            {/* <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Phone Number</label>
              <input
                type="tel"
                value={quickPhone}
                onChange={(e) => setQuickPhone(e.target.value)}
                placeholder="+14155552671"
                className="w-full px-3 py-2 bg-orbit-700 border border-orbit-600 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-orbit-accent"
              />
              <p className="text-xs text-gray-500 mt-1">Format: +[country code][number]</p>
            </div> */}

            <div className="flex gap-2">
              <button
                onClick={saveQuickSetup}
                disabled={savingQuick || !quickEmail}
                className="flex-1 px-4 py-2 bg-orbit-accent hover:bg-orbit-accent/80 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {savingQuick ? 'Saving...' : 'Save & Enable Notifications'}
              </button>
              <button
                onClick={() => setShowQuickSetup(false)}
                className="px-4 py-2 bg-orbit-700 hover:bg-orbit-600 text-white rounded-lg text-sm transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Info Panel */}
      <div className="p-5 rounded-xl bg-orbit-800/50 border border-orbit-600">
        <h4 className="text-sm font-semibold text-white mb-3">Available Notification Methods</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Bell className="w-4 h-4 text-orbit-accent" />
            <span>In-App Notifications</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Mail className="w-4 h-4 text-orbit-accent" />
            <span>Email Alerts</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <MessageSquare className="w-4 h-4 text-orbit-accent" />
            <span>SMS Messages</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Phone className="w-4 h-4 text-orbit-accent" />
            <span>Phone Calls</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Send className="w-4 h-4 text-orbit-accent" />
            <span>Telegram Bot</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <MessageSquare className="w-4 h-4 text-orbit-accent" />
            <span>Slack Integration</span>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-3">
          Configure notification settings in your account preferences to enable each method.
        </p>
      </div>

    </div>
  );
};
