import React, { useState, useEffect } from 'react';
import { store } from '../../services/store';
import { User, Notification } from '../../types';
import { Bell, Info, CheckCircle, AlertCircle, AlertTriangle, Trash2 } from 'lucide-react';

export const Notifications: React.FC = () => {
    const [user, setUser] = useState<User | null>(store.getCurrentUser());

    useEffect(() => {
        return store.subscribe(() => {
            setUser(store.getCurrentUser());
        });
    }, []);

    if (!user) return null;

    // Filter out alert notifications (they're shown in modal)
    const notifications = user.notifications.filter(n => n.type !== 'alert');

    const getTypeIcon = (type: Notification['type']) => {
        switch (type) {
            case 'error': return <AlertCircle size={20} className="text-red-400" />;
            case 'warning': return <AlertCircle size={20} className="text-yellow-400" />;
            case 'success': return <CheckCircle size={20} className="text-emerald-400" />;
            case 'info': return <Info size={20} className="text-blue-400" />;
            default: return <Info size={20} className="text-zinc-400" />;
        }
    };

    const getTypeColor = (type: Notification['type']) => {
        switch (type) {
            case 'error': return 'border-red-400/30 bg-red-900/10';
            case 'warning': return 'border-yellow-400/30 bg-yellow-900/10';
            case 'success': return 'border-emerald-400/30 bg-emerald-900/10';
            case 'info': return 'border-blue-400/30 bg-blue-900/10';
            default: return 'border-zinc-700 bg-zinc-900';
        }
    };

    const handleMarkAsRead = async (notificationId: string) => {
        await store.markNotificationAsRead(notificationId);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Bell size={28} className="text-brand-yellow" />
                    <h2 className="text-2xl font-bold text-white">Notifications</h2>
                </div>
                <div className="text-sm text-zinc-500">
                    {notifications.filter(n => !n.read).length} unread
                </div>
            </div>

            {notifications.length === 0 ? (
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 flex flex-col items-center justify-center text-zinc-500">
                    <Bell size={48} className="mb-4 opacity-50" />
                    <p>No notifications yet.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {notifications.map((notification) => (
                        <div
                            key={notification.id}
                            className={`border rounded-xl p-4 transition-all ${getTypeColor(notification.type)} ${
                                !notification.read ? 'border-l-4' : ''
                            }`}
                            onClick={() => !notification.read && handleMarkAsRead(notification.id)}
                        >
                            <div className="flex items-start gap-4">
                                <div className="shrink-0 mt-1">
                                    {getTypeIcon(notification.type)}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-4 mb-2">
                                        <h4 className="font-bold text-white">
                                            {notification.title}
                                            {!notification.read && (
                                                <span className="ml-2 inline-block w-2 h-2 bg-brand-yellow rounded-full" />
                                            )}
                                        </h4>
                                        <span className="text-xs text-zinc-500 shrink-0">
                                            {new Date(notification.date).toLocaleDateString()} {new Date(notification.date).toLocaleTimeString()}
                                        </span>
                                    </div>

                                    <p className="text-sm text-zinc-300 leading-relaxed">
                                        {notification.message}
                                    </p>

                                    {!notification.read && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleMarkAsRead(notification.id);
                                            }}
                                            className="mt-3 text-xs text-brand-yellow hover:text-yellow-400 transition-colors"
                                        >
                                            Mark as read
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
