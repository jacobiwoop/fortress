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
            [DocumentStatus.PENDING]: { color: 'bg-yellow-100 text-yellow-700', icon: <Clock size={14} strokeWidth={2.5} />, text: 'Pending' },
            [DocumentStatus.SUBMITTED]: { color: 'bg-blue-100 text-blue-700', icon: <FileText size={14} strokeWidth={2.5} />, text: 'Submitted' },
            [DocumentStatus.APPROVED]: { color: 'bg-emerald-100 text-emerald-700', icon: <CheckCircle size={14} strokeWidth={2.5} />, text: 'Approved' },
            [DocumentStatus.REJECTED]: { color: 'bg-red-100 text-red-700', icon: <XCircle size={14} strokeWidth={2.5} />, text: 'Rejected' }
        };
        const badge = badges[status];
        return (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${badge.color}`}>
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
        <div className="space-y-8">
            <div className="flex items-center gap-4">
                <div className="bg-blue-50 p-3 rounded-2xl text-brand-blue">
                    <FileText size={28} strokeWidth={2.5} />
                </div>
                <h2 className="text-3xl font-extrabold text-brand-navy">My Documents</h2>
            </div>

            {/* Pending Requests - Need to Submit */}
            {pendingRequests.length > 0 && (
                <div className="bg-white border border-gray-100 rounded-[30px] p-8 shadow-sm">
                    <h3 className="text-xl font-extrabold text-brand-navy mb-6 flex items-center gap-2">
                        <AlertCircle size={24} className="text-yellow-500" />
                        Action Required ({pendingRequests.length})
                    </h3>
                    <div className="space-y-6">
                        {pendingRequests.map(req => (
                            <div key={req.id} className="bg-white border-2 border-yellow-100 rounded-[24px] p-6 shadow-sm">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h4 className="font-extrabold text-brand-navy text-xl">{req.documentType}</h4>
                                        <p className="text-sm text-gray-400 font-medium">Requested: {new Date(req.requestDate).toLocaleDateString()}</p>
                                    </div>
                                    {getStatusBadge(req.status)}
                                </div>
                                
                                <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 mb-4">
                                    <p className="text-sm text-gray-600 font-medium leading-relaxed">{req.description}</p>
                                </div>

                                {uploadingId === req.id ? (
                                    <div className="space-y-4">
                                        <div className="p-4 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50">
                                            <label className="block text-sm font-bold text-gray-500 mb-2">
                                                Select Document File
                                            </label>
                                            <input
                                                type="file"
                                                onChange={handleFileSelect}
                                                accept=".pdf,.jpg,.jpeg,.png"
                                                className="w-full text-brand-navy font-medium text-sm file:mr-4 file:py-2.5 file:px-4 file:rounded-full file:border-0 file:bg-brand-blue file:text-white file:font-bold hover:file:bg-blue-600 cursor-pointer"
                                            />
                                            <p className="text-xs text-gray-400 mt-2 font-medium">
                                                Accepted formats: PDF, JPG, PNG (Max 5MB)
                                            </p>
                                        </div>

                                        {selectedFile && (
                                            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex items-center gap-2 text-brand-blue">
                                                <FileText size={18} />
                                                <p className="text-sm font-bold">
                                                    {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
                                                </p>
                                            </div>
                                        )}

                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => handleSubmit(req.id)}
                                                disabled={!selectedFile}
                                                className="flex-1 py-3 px-4 bg-brand-blue hover:bg-blue-600 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-brand-blue/20"
                                            >
                                                <Upload size={18} strokeWidth={2.5} />
                                                Submit Document
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setUploadingId(null);
                                                    setSelectedFile(null);
                                                }}
                                                className="py-3 px-6 bg-gray-100 hover:bg-gray-200 text-brand-navy font-bold rounded-xl transition-colors"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setUploadingId(req.id)}
                                        className="w-full py-4 px-4 bg-brand-navy hover:bg-brand-navy/90 text-white font-bold rounded-2xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-brand-navy/20"
                                    >
                                        <Upload size={20} strokeWidth={2.5} />
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
                <div className="bg-white border border-gray-100 rounded-[30px] p-8 shadow-sm">
                    <h3 className="text-xl font-extrabold text-brand-navy mb-6">Under Review ({submittedRequests.length})</h3>
                    <div className="space-y-4">
                        {submittedRequests.map(req => (
                            <div key={req.id} className="bg-gray-50 border border-gray-200 rounded-[24px] p-6">
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <h4 className="font-bold text-brand-navy text-lg">{req.documentType}</h4>
                                        <p className="text-xs text-gray-400 font-bold">Submitted: {new Date(req.submittedDate!).toLocaleString()}</p>
                                    </div>
                                    {getStatusBadge(req.status)}
                                </div>
                                <p className="text-sm text-gray-500 font-medium flex items-center gap-2 mt-2">
                                    <FileText size={16} className="text-brand-blue" />
                                    {req.fileName} ({req.fileSize})
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Approved Documents */}
            {approvedRequests.length > 0 && (
                <div className="bg-white border border-gray-100 rounded-[30px] p-8 shadow-sm">
                    <h3 className="text-xl font-extrabold text-brand-navy mb-6 flex items-center gap-2">
                        <CheckCircle size={24} className="text-emerald-500" />
                        Approved Documents ({approvedRequests.length})
                    </h3>
                    <div className="space-y-4">
                        {approvedRequests.map(req => (
                            <div key={req.id} className="bg-emerald-50/50 border border-emerald-100 rounded-[24px] p-6">
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <h4 className="font-bold text-brand-navy text-lg">{req.documentType}</h4>
                                        <p className="text-xs text-emerald-600/70 font-bold">Approved: {new Date(req.submittedDate || req.requestDate).toLocaleDateString()}</p>
                                    </div>
                                    {getStatusBadge(req.status)}
                                </div>
                                {req.adminReason && (
                                    <p className="text-sm text-emerald-600 italic font-medium mt-2">Note: {req.adminReason}</p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Rejected Documents */}
            {rejectedRequests.length > 0 && (
                <div className="bg-white border border-gray-100 rounded-[30px] p-8 shadow-sm">
                    <h3 className="text-xl font-extrabold text-brand-navy mb-6 flex items-center gap-2">
                        <XCircle size={24} className="text-red-500" />
                        Rejected Documents ({rejectedRequests.length})
                    </h3>
                    <div className="space-y-4">
                        {rejectedRequests.map(req => (
                            <div key={req.id} className="bg-red-50/50 border border-red-100 rounded-[24px] p-6">
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <h4 className="font-bold text-brand-navy text-lg">{req.documentType}</h4>
                                        <p className="text-xs text-red-400 font-bold">Rejected: {new Date(req.submittedDate || req.requestDate).toLocaleDateString()}</p>
                                    </div>
                                    {getStatusBadge(req.status)}
                                </div>
                                {req.adminReason && (
                                    <div className="bg-red-100 border border-red-200 rounded-xl p-4 mt-3">
                                        <p className="text-sm text-red-600 font-bold">
                                            Reason: {req.adminReason}
                                        </p>
                                    </div>
                                )}
                                <p className="text-sm text-gray-500 mt-3 font-medium">Please contact support or submit a new document.</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {requests.length === 0 && (
                <div className="bg-white border border-gray-100 rounded-[30px] p-16 flex flex-col items-center justify-center text-gray-400 shadow-sm">
                    <FileText size={64} className="mb-6 opacity-20" />
                    <p className="font-bold text-lg">No document requests yet.</p>
                </div>
            )}
        </div>
    );
};
