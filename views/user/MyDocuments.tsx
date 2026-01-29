import React, { useState, useEffect } from 'react';
import { store } from '../../services/store';
import { User, DocumentRequest, DocumentStatus } from '../../types';
import { FileText, Upload, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

export const MyDocuments: React.FC = () => {
    const [user, setUser] = useState<User | null>(store.getCurrentUser());
    const [requests, setRequests] = useState<DocumentRequest[]>([]);
    const [uploadingId, setUploadingId] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    useEffect(() => {
        loadRequests();
        return store.subscribe(() => {
            setUser(store.getCurrentUser());
            loadRequests();
        });
    }, []);

    const loadRequests = async () => {
        const currentUser = store.getCurrentUser();
        if (currentUser) {
            const reqs = await store.getDocumentRequests(currentUser.id);
            setRequests(reqs);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
        }
    };

    const handleSubmit = async (requestId: string) => {
        if (!selectedFile) {
            alert('Please select a file first');
            return;
        }

        const success = await store.submitDocument(requestId, selectedFile);
        if (success) {
            setUploadingId(null);
            setSelectedFile(null);
            await loadRequests();
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

    if (!user) return null;

    const pendingRequests = requests.filter(r => r.status === DocumentStatus.PENDING);
    const submittedRequests = requests.filter(r => r.status === DocumentStatus.SUBMITTED);
    const approvedRequests = requests.filter(r => r.status === DocumentStatus.APPROVED);
    const rejectedRequests = requests.filter(r => r.status === DocumentStatus.REJECTED);

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <FileText size={28} className="text-brand-yellow" />
                <h2 className="text-2xl font-bold text-white">My Documents</h2>
            </div>

            {/* Pending Requests - Need to Submit */}
            {pendingRequests.length > 0 && (
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <AlertCircle size={20} className="text-yellow-400" />
                        Action Required ({pendingRequests.length})
                    </h3>
                    <div className="space-y-4">
                        {pendingRequests.map(req => (
                            <div key={req.id} className="bg-black border-2 border-yellow-900/50 rounded-lg p-4">
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <h4 className="font-bold text-white text-lg">{req.documentType}</h4>
                                        <p className="text-sm text-zinc-400">Requested: {new Date(req.requestDate).toLocaleDateString()}</p>
                                    </div>
                                    {getStatusBadge(req.status)}
                                </div>
                                
                                <div className="bg-zinc-900 border border-zinc-800 rounded p-3 mb-3">
                                    <p className="text-sm text-zinc-300">{req.description}</p>
                                </div>

                                {uploadingId === req.id ? (
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-sm font-medium text-zinc-400 mb-2">
                                                Select Document File
                                            </label>
                                            <input
                                                type="file"
                                                onChange={handleFileSelect}
                                                accept=".pdf,.jpg,.jpeg,.png"
                                                className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-white text-sm file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-brand-yellow file:text-black file:font-medium hover:file:bg-yellow-400"
                                            />
                                            <p className="text-xs text-zinc-500 mt-1">
                                                Accepted formats: PDF, JPG, PNG (Max 5MB)
                                            </p>
                                        </div>

                                        {selectedFile && (
                                            <div className="bg-zinc-900 border border-zinc-800 rounded p-3">
                                                <p className="text-sm text-white">
                                                    <FileText size={14} className="inline mr-1" />
                                                    {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
                                                </p>
                                            </div>
                                        )}

                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleSubmit(req.id)}
                                                disabled={!selectedFile}
                                                className="flex-1 py-3 px-4 bg-brand-yellow hover:bg-yellow-400 disabled:bg-zinc-700 disabled:cursor-not-allowed text-black font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                                            >
                                                <Upload size={18} />
                                                Submit Document
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setUploadingId(null);
                                                    setSelectedFile(null);
                                                }}
                                                className="py-3 px-4 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setUploadingId(req.id)}
                                        className="w-full py-3 px-4 bg-brand-yellow hover:bg-yellow-400 text-black font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Upload size={18} />
                                        Upload Document
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Submitted Requests - Under Review */}
            {submittedRequests.length > 0 && (
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4">Under Review ({submittedRequests.length})</h3>
                    <div className="space-y-3">
                        {submittedRequests.map(req => (
                            <div key={req.id} className="bg-black border border-zinc-800 rounded-lg p-4">
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <h4 className="font-bold text-white">{req.documentType}</h4>
                                        <p className="text-xs text-zinc-500">Submitted: {new Date(req.submittedDate!).toLocaleString()}</p>
                                    </div>
                                    {getStatusBadge(req.status)}
                                </div>
                                <p className="text-sm text-zinc-400">
                                    <FileText size={14} className="inline mr-1" />
                                    {req.fileName} ({req.fileSize})
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Approved Documents */}
            {approvedRequests.length > 0 && (
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <CheckCircle size={20} className="text-emerald-400" />
                        Approved Documents ({approvedRequests.length})
                    </h3>
                    <div className="space-y-3">
                        {approvedRequests.map(req => (
                            <div key={req.id} className="bg-black border border-emerald-900/30 rounded-lg p-4">
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <h4 className="font-bold text-white">{req.documentType}</h4>
                                        <p className="text-xs text-zinc-500">Approved: {new Date(req.submittedDate || req.requestDate).toLocaleDateString()}</p>
                                    </div>
                                    {getStatusBadge(req.status)}
                                </div>
                                {req.adminReason && (
                                    <p className="text-sm text-emerald-400 italic">Note: {req.adminReason}</p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Rejected Documents */}
            {rejectedRequests.length > 0 && (
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <XCircle size={20} className="text-red-400" />
                        Rejected Documents ({rejectedRequests.length})
                    </h3>
                    <div className="space-y-3">
                        {rejectedRequests.map(req => (
                            <div key={req.id} className="bg-black border border-red-900/30 rounded-lg p-4">
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <h4 className="font-bold text-white">{req.documentType}</h4>
                                        <p className="text-xs text-zinc-500">Rejected: {new Date(req.submittedDate || req.requestDate).toLocaleDateString()}</p>
                                    </div>
                                    {getStatusBadge(req.status)}
                                </div>
                                {req.adminReason && (
                                    <div className="bg-red-900/10 border border-red-900/30 rounded p-3 mt-2">
                                        <p className="text-sm text-red-400">
                                            <strong>Reason:</strong> {req.adminReason}
                                        </p>
                                    </div>
                                )}
                                <p className="text-sm text-zinc-500 mt-2">Please contact support or submit a new document.</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {requests.length === 0 && (
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 flex flex-col items-center justify-center text-zinc-500">
                    <FileText size={48} className="mb-4 opacity-50" />
                    <p>No document requests yet.</p>
                </div>
            )}
        </div>
    );
};
