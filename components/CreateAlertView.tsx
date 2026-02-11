import React, { useState, useEffect } from 'react';
import { ArrowLeft, Bell, Mail, MessageSquare, Phone, Send, Check } from 'lucide-react';
import { NotificationType, Alert } from '../types';

interface CreateAlertViewProps {
  onBack: () => void;
  onSave: (alert: {
    token: string;
    condition: 'above' | 'below';
    targetPrice: number;
    notifications: NotificationType[];
    active: boolean;
  }) => Promise<void>;
  editingAlert?: Alert | null;
}

const notificationOptions: { type: NotificationType; label: string; icon: React.ReactNode; description: string }[] = [
  {
    type: 'in-app',
    label: 'In-App',
    icon: <Bell className="w-5 h-5" />,
    description: 'Browser notifications'
  },
  {
    type: 'email',
    label: 'Email',
    icon: <Mail className="w-5 h-5" />,
    description: 'Email alerts'
  },
  {
    type: 'sms',
    label: 'SMS',
    icon: <MessageSquare className="w-5 h-5" />,
    description: 'Text message'
  },
  {
    type: 'phone',
    label: 'Phone Call',
    icon: <Phone className="w-5 h-5" />,
    description: 'Voice call alert'
  },
  {
    type: 'telegram',
    label: 'Telegram',
    icon: <Send className="w-5 h-5" />,
    description: 'Telegram bot message'
  },
  {
    type: 'slack',
    label: 'Slack',
    icon: <MessageSquare className="w-5 h-5" />,
    description: 'Slack channel message'
  },
];

export const CreateAlertView: React.FC<CreateAlertViewProps> = ({ onBack, onSave, editingAlert }) => {
  const [token, setToken] = useState('');
  const [condition, setCondition] = useState<'above' | 'below'>('above');
  const [targetPrice, setTargetPrice] = useState('');
  const [notifications, setNotifications] = useState<NotificationType[]>(['in-app']);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  // Populate form when editing
  useEffect(() => {
    if (editingAlert) {
      setToken(editingAlert.token);
      setCondition(editingAlert.condition);
      setTargetPrice(editingAlert.targetPrice.toString());
      setNotifications(editingAlert.notifications);
    } else {
      // Reset form for new alert
      setToken('');
      setCondition('above');
      setTargetPrice('');
      setNotifications(['in-app']);
    }
    setErrors({});
  }, [editingAlert]);

  const toggleNotification = (type: NotificationType, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setNotifications(prev =>
      prev.includes(type)
        ? prev.filter(n => n !== type)
        : [...prev, type]
    );
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!token.trim()) {
      newErrors.token = 'Token symbol is required';
    } else if (!/^[A-Z0-9]+$/.test(token)) {
      newErrors.token = 'Token must be uppercase letters and numbers only';
    }

    const price = parseFloat(targetPrice);
    if (!targetPrice || isNaN(price)) {
      newErrors.targetPrice = 'Valid price is required';
    } else if (price <= 0) {
      newErrors.targetPrice = 'Price must be positive';
    } else if (price > 10_000_000) {
      newErrors.targetPrice = 'Price too high (max: 10M)';
    }

    if (notifications.length === 0) {
      newErrors.notifications = 'Select at least one notification type';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      setSaving(true);
      await onSave({
        token: token.toUpperCase(),
        condition,
        targetPrice: parseFloat(targetPrice),
        notifications,
        active: editingAlert?.active ?? true,
      });
      onBack();
    } catch (err) {
      console.error('Failed to save alert:', err);
      setErrors({ submit: err instanceof Error ? err.message : 'Failed to save alert' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-orbit-700"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">
            {editingAlert ? 'Edit Price Alert' : 'Create Price Alert'}
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            {editingAlert ? 'Update your cryptocurrency price alert' : 'Set up a new cryptocurrency price alert'}
          </p>
        </div>
      </div>

      {/* Error Message */}
      {errors.submit && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
          {errors.submit}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Token Input */}
        <div className="glass-panel rounded-2xl p-6 space-y-6">
          <h2 className="text-lg font-semibold text-white">Alert Configuration</h2>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Token Symbol
            </label>
            <input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value.toUpperCase())}
              placeholder="BTC"
              className={`w-full px-4 py-3 bg-orbit-700 border ${
                errors.token ? 'border-red-500' : 'border-orbit-600'
              } rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orbit-accent transition-colors`}
            />
            {errors.token && (
              <p className="mt-1 text-sm text-red-400">{errors.token}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Popular tokens: BTC, ETH, SOL, BNB, XRP, ADA, DOGE
            </p>
          </div>

          {/* Condition & Price */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Condition
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as 'above' | 'below')}
                className="w-full px-4 py-3 bg-orbit-700 border border-orbit-600 rounded-xl text-white focus:outline-none focus:border-orbit-accent transition-colors"
              >
                <option value="above">Above</option>
                <option value="below">Below</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Target Price ($)
              </label>
              <input
                type="number"
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
                placeholder="50000"
                step="0.01"
                className={`w-full px-4 py-3 bg-orbit-700 border ${
                  errors.targetPrice ? 'border-red-500' : 'border-orbit-600'
                } rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orbit-accent transition-colors`}
              />
              {errors.targetPrice && (
                <p className="mt-1 text-sm text-red-400">{errors.targetPrice}</p>
              )}
            </div>
          </div>

          {/* Alert Preview */}
          <div className="p-4 rounded-xl bg-orbit-700/50 border border-orbit-600">
            <p className="text-sm text-gray-400">
              Alert will trigger when <span className="text-white font-semibold">{token || 'TOKEN'}</span> price is{' '}
              <span className={condition === 'above' ? 'text-green-400' : 'text-red-400'}>
                {condition}
              </span>{' '}
              <span className="text-white font-semibold">
                ${targetPrice ? parseFloat(targetPrice).toLocaleString() : '0'}
              </span>
            </p>
          </div>
        </div>

        {/* Notification Types */}
        <div className="glass-panel rounded-2xl p-6 space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-white mb-1">Notification Methods</h2>
            <p className="text-sm text-gray-400">Choose how you want to be notified</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {notificationOptions.map((option) => {
              const isSelected = notifications.includes(option.type);
              return (
                <button
                  key={option.type}
                  type="button"
                  onClick={(e) => toggleNotification(option.type, e)}
                  className={`relative p-4 rounded-xl border-2 transition-all text-left cursor-pointer ${
                    isSelected
                      ? 'border-orbit-accent bg-orbit-accent/20 text-white shadow-lg shadow-orbit-accent/10'
                      : 'border-orbit-600 bg-orbit-700/50 text-gray-400 hover:border-orbit-500 hover:text-white'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-orbit-accent flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div className="flex items-center space-x-3 mb-1">
                    <div className={isSelected ? 'text-orbit-accent' : ''}>
                      {option.icon}
                    </div>
                    <span className="font-medium text-sm">{option.label}</span>
                  </div>
                  <p className={`text-xs ${isSelected ? 'text-gray-300' : 'text-gray-500'}`}>
                    {option.description}
                  </p>
                </button>
              );
            })}
          </div>

          {errors.notifications && (
            <p className="text-sm text-red-400">{errors.notifications}</p>
          )}

          <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <p className="text-xs text-blue-300">
              💡 Tip: Configure your email and phone in the Quick Setup above to enable email/SMS notifications
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 px-6 py-3 bg-orbit-700 hover:bg-orbit-600 text-white rounded-xl font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 px-6 py-3 bg-orbit-accent hover:bg-orbit-accent/80 text-white rounded-xl font-medium transition-colors shadow-lg shadow-orbit-accent/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving
              ? (editingAlert ? 'Saving...' : 'Creating...')
              : (editingAlert ? 'Save Changes' : 'Create Alert')
            }
          </button>
        </div>
      </form>
    </div>
  );
};
