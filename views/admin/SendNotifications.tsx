import React, { useState, useEffect } from 'react';
import { store } from '../../services/store';
import { User, Notification } from '../../types';
import { Send, Bell, AlertTriangle, Info, CheckCircle, AlertCircle } from 'lucide-react';

export const SendNotifications: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUserId, setSelectedUserId] = useState('');
    const [notifType, setNotifType] = useState<Notification['type']>('info');
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [statusMsg, setStatusMsg] = useState('');

    useEffect(() => {
        setUsers(store.getUsers().filter(u => u.role === 'USER'));
        const unsub = store.subscribe(() => {
            setUsers(store.getUsers().filter(u => u.role === 'USER'));
        });
        return unsub;
    }, []);

    const getTypeIcon = (type: Notification['type']) => {
        switch (type) {
            case 'alert': return <AlertTriangle size={20} className="text-red-500" />;
            case 'error': return <AlertCircle size={20} className="text-red-400" />;
            case 'warning': return <AlertCircle size={20} className="text-yellow-400" />;
            case 'success': return <CheckCircle size={20} className="text-emerald-400" />;
            case 'info': return <Info size={20} className="text-blue-400" />;
        }
    };

    const getTypeColor = (type: Notification['type']) => {
        switch (type) {
            case 'alert': return 'border-red-500 bg-red-900/20';
            case 'error': return 'border-red-400 bg-red-900/10';
            case 'warning': return 'border-yellow-400 bg-yellow-900/10';
            case 'success': return 'border-emerald-400 bg-emerald-900/10';
            case 'info': return 'border-blue-400 bg-blue-900/10';
        }
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!selectedUserId || !title || !message) {
            setStatusMsg('Please fill all fields');
            setTimeout(() => setStatusMsg(''), 3000);
            return;
        }

        setSending(true);
        const success = await store.sendNotification(selectedUserId, title, message, notifType);
        
        if (success) {
            setStatusMsg('Notification sent successfully!');
            setTitle('');
            setMessage('');
            setSelectedUserId('');
        } else {
            setStatusMsg('Failed to send notification');
        }
        
        setSending(false);
        setTimeout(() => setStatusMsg(''), 3000);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <Bell size={28} className="text-brand-yellow" />
                <h2 className="text-2xl font-bold text-white">Send Notifications</h2>
            </div>

            {statusMsg && (
                <div className={`p-4 rounded-lg ${statusMsg.includes('success') ? 'bg-emerald-900/20 border border-emerald-900/50 text-emerald-400' : 'bg-red-900/20 border border-red-900/50 text-red-400'}`}>
                    {statusMsg}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Form */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4">Compose Notification</h3>
                    
                    <form onSubmit={handleSend} className="space-y-4">
                        {/* Recipient */}
                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-2">
                                Recipient
                            </label>
                            <select
                                value={selectedUserId}
                                onChange={(e) => setSelectedUserId(e.target.value)}
                                className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-white focus:border-brand-yellow focus:outline-none"
                                required
                            >
                                <option value="">Select a user...</option>
                                {users.map(user => (
                                    <option key={user.id} value={user.id}>
                                        {user.name} ({user.email})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Type */}
                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-2">
                                Type
                            </label>
                            <div className="grid grid-cols-5 gap-2">
                                {(['info', 'success', 'warning', 'error', 'alert'] as const).map(type => (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => setNotifType(type)}
                                        className={`p-3 rounded-lg border-2 transition-all ${
                                            notifType === type 
                                                ? getTypeColor(type) 
                                                : 'border-zinc-800 bg-zinc-900 hover:border-zinc-700'
                                        }`}
                                        title={type}
                                    >
                                        {getTypeIcon(type)}
                                    </button>
                                ))}
                            </div>
                            <p className="text-xs text-zinc-500 mt-2">
                                {notifType === 'alert' && '⚠️ Alert: Displays as modal (use for critical messages only)'}
                                {notifType === 'info' && 'ℹ️ Info: General information'}
                                {notifType === 'success' && '✅ Success: Positive confirmation'}
                                {notifType === 'warning' && '⚠️ Warning: Important notice'}
                                {notifType === 'error' && '❌ Error: Problem notification'}
                            </p>
                        </div>

                        {/* Title */}
                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-2">
                                Title
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-white focus:border-brand-yellow focus:outline-none"
                                placeholder="Notification title..."
                                required
                            />
                        </div>

                        {/* Message */}
                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-2">
                                Message
                            </label>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-white focus:border-brand-yellow focus:outline-none resize-none"
                                rows={4}
                                placeholder="Notification message..."
                                required
                            />
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={sending}
                            className="w-full py-3 px-6 bg-brand-yellow hover:bg-yellow-400 disabled:bg-zinc-700 disabled:cursor-not-allowed text-black font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                            <Send size={18} />
                            {sending ? 'Sending...' : 'Send Notification'}
                        </button>
                    </form>
                </div>

                {/* Preview */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4">Preview</h3>
                    
                    {title || message ? (
                        <div className={`border-2 rounded-lg p-4 ${getTypeColor(notifType)}`}>
                            <div className="flex items-start gap-3">
                                {getTypeIcon(notifType)}
                                <div className="flex-1">
                                    <h4 className="font-bold text-white mb-1">
                                        {title || 'Notification Title'}
                                    </h4>
                                    <p className="text-sm text-zinc-300">
                                        {message || 'Notification message will appear here...'}
                                    </p>
                                    <p className="text-xs text-zinc-500 mt-2">
                                        Just now
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center text-zinc-500 py-12">
                            <Bell size={48} className="mx-auto mb-4 opacity-50" />
                            <p>Fill the form to see a preview</p>
                        </div>
                    )}

                    {notifType === 'alert' && (title || message) && (
                        <div className="mt-4 p-4 bg-zinc-800 rounded-lg">
                            <p className="text-xs text-zinc-400 mb-2">
                                <AlertTriangle size={14} className="inline mr-1" />
                                Alert Preview (Modal)
                            </p>
                            <div className="bg-zinc-900 border-2 border-red-500 rounded-lg p-6">
                                <div className="flex justify-center mb-4">
                                    <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                                        <AlertTriangle size={24} className="text-red-500" />
                                    </div>
                                </div>
                                <h4 className="text-lg font-bold text-white text-center mb-2">
                                    {title}
                                </h4>
                                <p className="text-sm text-zinc-300 text-center mb-4">
                                    {message}
                                </p>
                                <button className="w-full py-2 bg-red-500 text-white rounded font-bold text-sm">
                                    OK
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
