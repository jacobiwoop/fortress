import React from 'react';
import { Notification } from '../types';
import { AlertTriangle, X } from 'lucide-react';

interface AlertModalProps {
  notifications: Notification[];
  onClose: (notificationId: string) => void;
}

export const AlertModal: React.FC<AlertModalProps> = ({ notifications, onClose }) => {
  if (notifications.length === 0) return null;

  const currentAlert = notifications[0];

  const handleOk = () => {
    onClose(currentAlert.id);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      
      {/* Modal */}
      <div className="relative bg-zinc-900 border-2 border-red-500 rounded-xl p-8 max-w-md w-full shadow-2xl shadow-red-500/20 animate-in zoom-in-95 duration-300">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
            <AlertTriangle size={32} className="text-red-500" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-white text-center mb-4">
          {currentAlert.title}
        </h2>

        {/* Message */}
        <p className="text-zinc-300 text-center mb-6 leading-relaxed">
          {currentAlert.message}
        </p>

        {/* Queue indicator */}
        {notifications.length > 1 && (
          <p className="text-xs text-zinc-500 text-center mb-4">
            {notifications.length - 1} more notification{notifications.length > 2 ? 's' : ''} pending
          </p>
        )}

        {/* OK Button */}
        <button
          onClick={handleOk}
          className="w-full py-3 px-6 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg transition-colors shadow-lg shadow-red-500/30"
        >
          OK
        </button>
      </div>
    </div>
  );
};
