import React, { useState, useEffect } from 'react';
import { store } from '../../services/store';
import { User, DocumentRequest, DocumentStatus } from '../../types';
import { FileText, Send, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';

export const DocumentRequests: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [requests, setRequests] = useState<DocumentRequest[]>([]);
    const [selectedUserId, setSelectedUserId] = useState('');
    const [documentType, setDocumentType] = useState('');
    const [customType, setCustomType] = useState('');
    const [description, setDescription] = useState('');
    const [notificationType, setNotificationType] = useState<'alert' | 'info'>('info');
    const [sending, setSending] = useState(false);
    const [statusMsg, setStatusMsg] = useState('');
    const [reviewingId, setReviewingId] = useState<string | null>(null);
    const [reviewReason, setReviewReason] = useState('');

    const documentTypes = [
        'Identity Card / Passport',
        'Proof of Address',
        'Bank Statement (RIB)',
        'Tax Notice',
        'Payslip',
        'Other'
    ];

    useEffect(() => {
        loadData();
        const unsub = store.subscribe(() => loadData());
        return unsub;
    }, []);

    const loadData = async () => {
        setUsers(store.getUsers().filter(u => u.role === 'USER'));
        const reqs = await store.getDocumentRequests();
        setRequests(reqs);
    };

    const handleCreateRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!selectedUserId || (!documentType && !customType) || !description) {
            setStatusMsg('Please fill all fields');
            setTimeout(() => setStatusMsg(''), 3000);
            return;
        }

        setSending(true);
        const finalType = documentType === 'Other' ? customType : documentType;
        const success = await store.createDocumentRequest(selectedUserId, finalType, description, notificationType);
        
        if (success) {
            setStatusMsg('Document request sent successfully!');
            setSelectedUserId('');
            setDocumentType('');
            setCustomType('');
            setDescription('');
            await loadData();
        } else {
            setStatusMsg('Failed to send request');
        }
        
        setSending(false);
        setTimeout(() => setStatusMsg(''), 3000);
    };

    const handleReview = async (requestId: string, status: 'APPROVED' | 'REJECTED') => {
        const success = await store.reviewDocument(requestId, status, reviewReason);
        if (success) {
            setReviewingId(null);
            setReviewReason('');
            await loadData();
        }
    };

    const getStatusBadge = (status: DocumentStatus) => {
        const badges = {
            [DocumentStatus.PENDING]: { color: 'bg-yellow-900/20 text-yellow-400 border-yellow-900/50', icon: <Clock size={14} />, text: 'Pending' },
            [DocumentStatus.SUBMITTED]: { color: 'bg-blue-900/20 text-blue-400 border-blue-900/50', icon: <FileText size={14} />, text: 'Submitted' },
            [DocumentStatus.APPROVED]: { color: 'bg-emerald-900/20 text-emerald-400 border-emerald-900/50', icon: <CheckCircle size={14} />, text: 'Approved' },
            [DocumentStatus.REJECTED]: { color: 'bg-red-900/20 text-red-400 border-red-900/50', icon: <XCircle size={14} />, text: 'Rejected' }
        };
        const badge = badges[status];
        return (
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border ${badge.color}`}>
                {badge.icon} {badge.text}
            </span>
        );
    };

    const pendingRequests = requests.filter(r => r.status === DocumentStatus.PENDING);
    const submittedRequests = requests.filter(r => r.status === DocumentStatus.SUBMITTED);
    const completedRequests = requests.filter(r => r.status === DocumentStatus.APPROVED || r.status === DocumentStatus.REJECTED);

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <FileText size={28} className="text-brand-yellow" />
                <h2 className="text-2xl font-bold text-white">Document Requests</h2>
            </div>

            {statusMsg && (
                <div className={`p-4 rounded-lg ${statusMsg.includes('success') ? 'bg-emerald-900/20 border border-emerald-900/50 text-emerald-400' : 'bg-red-900/20 border border-red-900/50 text-red-400'}`}>
                    {statusMsg}
                </div>
            )}

            {/* Create New Request */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">Create New Request</h3>
                
                <form onSubmit={handleCreateRequest} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-2">User</label>
                            <select
                                value={selectedUserId}
                                onChange={(e) => setSelectedUserId(e.target.value)}
                                className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-white focus:border-brand-yellow focus:outline-none"
                                required
                            >
                                <option value="">Select user...</option>
                                {users.map(user => (
                                    <option key={user.id} value={user.id}>{user.name} ({user.email})</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-2">Document Type</label>
                            <select
                                value={documentType}
                                onChange={(e) => setDocumentType(e.target.value)}
                                className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-white focus:border-brand-yellow focus:outline-none"
                                required={!customType}
                            >
                                <option value="">Select type...</option>
                                {documentTypes.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {documentType === 'Other' && (
                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-2">Custom Document Type</label>
                            <input
                                type="text"
                                value={customType}
                                onChange={(e) => setCustomType(e.target.value)}
                                className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-white focus:border-brand-yellow focus:outline-none"
                                placeholder="Enter document type..."
                                required
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-2">Description / Instructions</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-white focus:border-brand-yellow focus:outline-none resize-none"
                            rows={3}
                            placeholder="Provide instructions for the user..."
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-2">Notification Type</label>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    value="info"
                                    checked={notificationType === 'info'}
                                    onChange={(e) => setNotificationType(e.target.value as 'info')}
                                    className="text-brand-yellow"
                                />
                                <span className="text-white">Normal (Info)</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    value="alert"
                                    checked={notificationType === 'alert'}
                                    onChange={(e) => setNotificationType(e.target.value as 'alert')}
                                    className="text-brand-yellow"
                                />
                                <span className="text-white">Alert (Modal) <AlertTriangle size={14} className="inline text-red-500" /></span>
                            </label>
                        </div>
                        <p className="text-xs text-zinc-500 mt-1">
                            {notificationType === 'alert' ? '⚠️ Alert will display as modal (use for urgent requests)' : 'ℹ️ Normal notification in user\'s notification list'}
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={sending}
                        className="w-full py-3 px-6 bg-brand-yellow hover:bg-yellow-400 disabled:bg-zinc-700 disabled:cursor-not-allowed text-black font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                        <Send size={18} />
                        {sending ? 'Sending...' : 'Send Request'}
                    </button>
                </form>
            </div>

            {/* Submitted Requests (Need Review) */}
            {submittedRequests.length > 0 && (
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4">Submitted Documents ({submittedRequests.length})</h3>
                    <div className="space-y-3">
                        {submittedRequests.map(req => (
                            <div key={req.id} className="bg-black border border-zinc-800 rounded-lg p-4">
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <h4 className="font-bold text-white">{req.documentType}</h4>
                                        <p className="text-sm text-zinc-400">User: {req.userName}</p>
                                        <p className="text-xs text-zinc-500">Submitted: {new Date(req.submittedDate!).toLocaleString()}</p>
                                    </div>
                                    {getStatusBadge(req.status)}
                                </div>
                                <p className="text-sm text-zinc-300 mb-2">{req.description}</p>
                                <p className="text-sm text-zinc-400 mb-3">
                                    <FileText size={14} className="inline mr-1" />
                                    File: {req.fileName} ({req.fileSize})
                                </p>

                                {reviewingId === req.id ? (
                                    <div className="space-y-2">
                                        <textarea
                                            value={reviewReason}
                                            onChange={(e) => setReviewReason(e.target.value)}
                                            className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-white text-sm"
                                            placeholder="Reason (optional)..."
                                            rows={2}
                                        />
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleReview(req.id, 'APPROVED')}
                                                className="flex-1 py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-medium text-sm flex items-center justify-center gap-1"
                                            >
                                                <CheckCircle size={16} /> Approve
                                            </button>
                                            <button
                                                onClick={() => handleReview(req.id, 'REJECTED')}
                                                className="flex-1 py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded font-medium text-sm flex items-center justify-center gap-1"
                                            >
                                                <XCircle size={16} /> Reject
                                            </button>
                                            <button
                                                onClick={() => setReviewingId(null)}
                                                className="py-2 px-4 bg-zinc-700 hover:bg-zinc-600 text-white rounded text-sm"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setReviewingId(req.id)}
                                        className="w-full py-2 px-4 bg-zinc-800 hover:bg-zinc-700 text-white rounded font-medium text-sm"
                                    >
                                        Review Document
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Pending Requests */}
            {pendingRequests.length > 0 && (
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4">Pending Requests ({pendingRequests.length})</h3>
                    <div className="space-y-3">
                        {pendingRequests.map(req => (
                            <div key={req.id} className="bg-black border border-zinc-800 rounded-lg p-4">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h4 className="font-bold text-white">{req.documentType}</h4>
                                        <p className="text-sm text-zinc-400">User: {req.userName}</p>
                                        <p className="text-xs text-zinc-500">Requested: {new Date(req.requestDate).toLocaleString()}</p>
                                        <p className="text-sm text-zinc-300 mt-1">{req.description}</p>
                                    </div>
                                    {getStatusBadge(req.status)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Completed Requests */}
            {completedRequests.length > 0 && (
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4">History ({completedRequests.length})</h3>
                    <div className="space-y-3">
                        {completedRequests.map(req => (
                            <div key={req.id} className="bg-black border border-zinc-800 rounded-lg p-4">
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <h4 className="font-bold text-white">{req.documentType}</h4>
                                        <p className="text-sm text-zinc-400">User: {req.userName}</p>
                                        <p className="text-xs text-zinc-500">
                                            {req.status === DocumentStatus.APPROVED ? 'Approved' : 'Rejected'}: {new Date(req.submittedDate || req.requestDate).toLocaleString()}
                                        </p>
                                    </div>
                                    {getStatusBadge(req.status)}
                                </div>
                                {req.adminReason && (
                                    <p className="text-sm text-zinc-400 italic">Reason: {req.adminReason}</p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
