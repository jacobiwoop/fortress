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
            case 'error': return <AlertCircle size={24} className="text-current" strokeWidth={2.5} />;
            case 'warning': return <AlertCircle size={24} className="text-current" strokeWidth={2.5} />;
            case 'success': return <CheckCircle size={24} className="text-current" strokeWidth={2.5} />;
            case 'info': return <Info size={24} className="text-current" strokeWidth={2.5} />;
            default: return <Info size={24} className="text-current" strokeWidth={2.5} />;
        }
    };



    const handleMarkAsRead = async (notificationId: string) => {
        await store.markNotificationAsRead(notificationId);
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="bg-blue-50 p-3 rounded-2xl text-brand-blue">
                        <Bell size={28} strokeWidth={2.5} />
                    </div>
                    <h2 className="text-3xl font-extrabold text-brand-navy">Notifications</h2>
                </div>
                <div className="px-4 py-2 bg-gray-100 rounded-full text-sm text-brand-navy font-bold">
                    {notifications.filter(n => !n.read).length} unread
                </div>
            </div>

            {notifications.length === 0 ? (
                <div className="bg-white border border-gray-100 rounded-[30px] p-16 flex flex-col items-center justify-center text-gray-400 shadow-sm">
                    <Bell size={64} className="mb-6 opacity-20" />
                    <p className="font-bold text-lg">No notifications yet.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {notifications.map((notification) => (
                        <div
                            key={notification.id}
                            className={`border rounded-[24px] p-6 transition-all hover:shadow-md cursor-pointer ${
                                !notification.read ? 'bg-white border-l-[6px] border-l-brand-blue border-y-gray-100 border-r-gray-100 shadow-sm' : 'bg-gray-50 border-gray-100 opacity-75 hover:opacity-100'
                            }`}
                            onClick={() => !notification.read && handleMarkAsRead(notification.id)}
                        >
                            <div className="flex items-start gap-5">
                                <div className={`shrink-0 mt-1 p-2 rounded-xl ${
                                    notification.type === 'error' ? 'bg-red-100 text-red-600' :
                                    notification.type === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                                    notification.type === 'success' ? 'bg-emerald-100 text-emerald-600' :
                                    'bg-blue-100 text-brand-blue'
                                }`}>
                                    {getTypeIcon(notification.type)}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-4 mb-2">
                                        <h4 className="font-extrabold text-brand-navy text-lg">
                                            {notification.title}
                                            {!notification.read && (
                                                <span className="ml-3 inline-block w-2.5 h-2.5 bg-brand-blue rounded-full" />
                                            )}
                                        </h4>
                                        <span className="text-xs text-gray-400 font-bold shrink-0">
                                            {new Date(notification.date).toLocaleDateString()} {new Date(notification.date).toLocaleTimeString()}
                                        </span>
                                    </div>

                                    <p className="text-sm text-gray-500 font-medium leading-relaxed">
                                        {notification.message}
                                    </p>

                                    {!notification.read && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleMarkAsRead(notification.id);
                                            }}
                                            className="mt-4 text-xs font-bold text-brand-blue hover:text-blue-700 transition-colors uppercase tracking-wider"
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
