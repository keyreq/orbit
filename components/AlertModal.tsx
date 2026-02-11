import React, { useState, useEffect } from 'react';
import { X, Bell, Mail, MessageSquare, Phone, Send } from 'lucide-react';
import { Alert, NotificationType } from '../types';

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (alert: Omit<Alert, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
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

export const AlertModal: React.FC<AlertModalProps> = ({ isOpen, onClose, onSave, editingAlert }) => {
  const [token, setToken] = useState('');
  const [condition, setCondition] = useState<'above' | 'below'>('above');
  const [targetPrice, setTargetPrice] = useState('');
  const [notifications, setNotifications] = useState<NotificationType[]>(['in-app']);
  const [errors, setErrors] = useState<Record<string, string>>({});

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
  }, [editingAlert, isOpen]);

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
      await onSave({
        token: token.toUpperCase(),
        condition,
        targetPrice: parseFloat(targetPrice),
        notifications,
        active: editingAlert?.active ?? true,
      });

      onClose();
    } catch (err) {
      // Error is already handled in parent, just don't close modal
      console.error('Failed to save alert:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-orbit-800 rounded-2xl shadow-2xl border border-orbit-600 max-h-[90vh] overflow-y-auto z-10">
        {/* Header */}
        <div className="sticky top-0 bg-orbit-800 border-b border-orbit-600 p-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">
            {editingAlert ? 'Edit Alert' : 'Create New Alert'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-orbit-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Token Input */}
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

          {/* Notification Types */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Notification Methods
            </label>
            <div className="grid grid-cols-2 gap-3">
              {notificationOptions.map((option) => (
                <button
                  key={option.type}
                  type="button"
                  onClick={(e) => toggleNotification(option.type, e)}
                  className={`p-4 rounded-xl border-2 transition-all text-left cursor-pointer ${
                    notifications.includes(option.type)
                      ? 'border-orbit-accent bg-orbit-accent/10 text-white'
                      : 'border-orbit-600 bg-orbit-700/50 text-gray-400 hover:border-orbit-500 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-3 mb-1">
                    {option.icon}
                    <span className="font-medium text-sm">{option.label}</span>
                  </div>
                  <p className="text-xs text-gray-500">{option.description}</p>
                </button>
              ))}
            </div>
            {errors.notifications && (
              <p className="mt-2 text-sm text-red-400">{errors.notifications}</p>
            )}
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
            <p className="text-xs text-gray-500 mt-1">
              Notifications: {notifications.length > 0 ? notifications.join(', ') : 'None selected'}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-orbit-700 hover:bg-orbit-600 text-white rounded-xl font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-orbit-accent hover:bg-orbit-accent/80 text-white rounded-xl font-medium transition-colors shadow-lg shadow-orbit-accent/20"
            >
              {editingAlert ? 'Save Changes' : 'Create Alert'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
